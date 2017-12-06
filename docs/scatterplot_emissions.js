$(document).ready(function(){

  var margin = {top: 20, right: 20, bottom: 70, left: 100},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var x = d3.scaleLinear()
      .range([0, width]);

  var y = d3.scaleLinear()
      .range([height, 0]);

  var color = d3.scaleOrdinal(d3.schemeCategory10);

  var xAxis = d3.axisBottom().scale(x);

  // d3.select(".axis")
  // .call(d3.svg.axis()
  //     .scale(x)
  //     .orient("bottom"));

  var yAxis = d3.axisLeft().scale(y);

  // d3.select(".axis").call(d3.svg.axis()
  //     .scale(y)
  //     .orient("left"));

  var svg = d3.select("#scatterplot-emissions").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      // add the tooltip area to the webpage

  d3.csv("./data/plant_data_14.csv", function(error, data) {
    if (error) throw error;

    data.forEach(function(d) {
      d.PLNGENAN = +d.PLNGENAN;
      d.PLCO2AN = +d.PLCO2AN;
    });

    //x.domain(d3.extent(data, function(d) { return d.PLNGENAN; })).nice();
    x.domain([0, d3.max(data, function(d){return d.PLNGENAN;})])
    y.domain(d3.extent(data, function(d) { return d.PLCO2AN; })).nice();

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        // text label for the x axis

    svg.append("text")
        .attr("transform",
              "translate(" + (width/2) + " ," +
                             (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Plant Total Power Generated in 2014 (MW-h)");

        // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Carbon Dioxide Annual Emissions, 2014 (Tons)");

    svg.selectAll(".dot")
        .data(data)
      .enter().append("circle")
      .filter(function(d) { return d.PLNGENAN > 0 })
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function(d) { return x(d.PLNGENAN); })
        .attr("cy", function(d) { return y(d.PLCO2AN); })
        .style("fill", function(d) { return color(d.PLFUELCT); })
        .on("mouseover", function(d,i) {

         //Get this bar's x/y values, then augment for the tooltip
         var coords = d3.mouse(this);
         //console.log(coords);
         var xPosition = coords[0];
         var yPosition = coords[1];

         //Update the tooltip position and value
         d3.select("#tooltip")
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 30) + "px")
            .style("opacity", .9)
           .select("#name")
           .text(d.PNAME);

         d3.select("#tooltip")
           .select("#loc")
           .text(d.CNTYNAME + " County, " + d.PSTATABB);

         d3.select("#tooltip")
           .select("#CO2")
           .text(d3.format(",.0f")(d.PLCO2AN));

         d3.select("#tooltip")
           .select("#pow")
           .text(d3.format(",.0f")(d.PLNGENAN));

         //Show the tooltip
         d3.select("#tooltip").classed("hidden", false);

        })
        .on("mouseout", function() {

         //Hide the tooltip
         d3.select("#tooltip").classed("hidden", true);
        });

    var legend = svg.selectAll(".legend")
        .data(color.domain())
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });

  });
})
