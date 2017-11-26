$(document).ready(function(){
  //Width and height
  			var w = 900;
  			var h = 400;

  // Load eGRID 2014 unit level data
  			//Original data
      d3.csv("./data/stack_time_fuel.csv")
        .row(function (d) {
          return {
          Year: +d.Year,
          Coal: +d.Coal,
          Nat_gas: +d.Nat_gas,
          Petroleum: +d.Petroleum,
          Water: +d.Water,
          Solar: +d.Solar,
          Wind: +d.Wind,
          Nuclear: +d.Nuclear,
          Other: +d.Other,
        };})
        .get(function(data) {
          var dataset = data;
          // console.log(dataset);


  			//Set up stack method
  			var stack = d3.stack()
  						  .keys([ "Coal", "Nat_gas", "Petroleum", "Water", "Solar", "Wind", "Nuclear", "Other" ])
                .order(d3.stackOrderDescending);

  			//Data, stacked
  			var series = stack(dataset);
        // console.log(series);

  			//Set up scales
        var xScale = d3.scaleBand()
          .domain(d3.range(dataset.length))
  				.range([0, w]);

  			var yScale = d3.scaleLinear()
  				.domain([0,
  					d3.max(dataset, function(d) {
              // console.log(d.Coal + d.Nat_gas + d.Petroleum + d.Water + d.Solar + d.Wind + d.Nuclear + d.Other);
  						return d.Coal + d.Nat_gas + d.Petroleum + d.Water + d.Solar + d.Wind + d.Nuclear + d.Other;
  					})
  				])
  				.range([h, 0]);

  			//Easy colors accessible via a 10-step ordinal scale
  			var colors = d3.scaleOrdinal(d3.schemeCategory10);

  			//Create SVG element
  			var svg = d3.select("#fuelTypes-chart")
  						.append("svg")
  						.attr("width", w)
  						.attr("height", h);

  			// Add a group for each row of data
  			var groups = svg.selectAll("g")
  				.data(series)
  				.enter()
  				.append("g")
  				.style("fill", function(d, i) {
  					return colors(i);
  				});

  			// Add a rect for each data value
  			var rects = groups.selectAll("rect")
  				.data(function(d) { return d; })
  				.enter()
  				.append("rect")
  				.attr("x", function(d, i) {
  					return xScale(i);
  				})
  				.attr("y", function(d) {
            //console.log(d[0]);
            //console.log(d[1]);
  					return yScale(d[1]);
  				})
  				.attr("height", function(d) {
  					return yScale(d[0]) - yScale(d[1]);
  				})
  				.attr("width", xScale.bandwidth());
      var legend = svg.selectAll(".legend")
          .data(colors.domain())
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      legend.append("rect")
          .attr("x", w - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", colors);

      legend.append("text")
          .attr("x", w - 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function(d) {
            return d;
          });
  });
})
