$(document).ready(function(){

  var svg = d3.select('#fuelTypes-section').select("svg"),
    margin = {top: 20, right: 60, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    // for bottom half

var x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.05)
    .align(0.1);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

var z = d3.scaleOrdinal()
    .range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#666699", "#b82e2e", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"])

var div = d3.select('#fuelTypes-section')
            .append("div")
            .attr("id", "tooltip1")
            .style("opacity", 0);

    var svg2 = d3.select('#fuelTypes-section').select("svg#viz2"),
        margin2 = margin,
        width2 = +svg2.attr("width") - margin2.left - margin2.right,
        height2 = +svg2.attr("height") - margin2.bottom,
        g2 = svg2.append("g").attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
        // for bottom half

    var x2 = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.05)
        .align(0.1);

    var y2 = d3.scaleLinear()
        .rangeRound([0, height]);

    var z2 = d3.scaleOrdinal()
        .range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#666699", "#b82e2e", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"]);

var min_yr = 1940
var max_yr = 1970

// function for user timeline input
function myFunction() {
    var min_yr = document.getElementById("myText_1").value;
    var max_yr = document.getElementById("myText_2").value;
        //svg.selectAll("g").select("axis").remove();
    display_4(min_yr, max_yr);
}

//function tto display plot
function display_4(yr1, yr2) {

    svg.selectAll("rect").remove();
    svg.selectAll("text").remove();
    svg.selectAll(".tick").remove();
    svg2.selectAll("rect").remove();
    svg2.selectAll("text").remove();
    svg2.selectAll(".tick").remove();

    d3.csv("data/stack_time_fuel_1.csv", function(d, i, columns) {
      for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
      d.total = t;
      d.Year = +d.Year;
      if (d.Year <= yr2 && d.Year >= yr1) {return d;}
    }, function(error, data) {
      if (error) throw error;

      var keys = data.columns.slice(1);
      //data.filter(function(c) {return c.Year < 1940});
      console.log(data);
      data.sort(function(a, b) { return a.Year - b.Year; });
      x.domain(data.map(function(d) { return d.Year; }));
      //x.domain([1890, 2055])
      var max_on = d3.max(data, function(d) { return d.total; })
      y.domain([0, max_on]).nice();
      y2.domain([0, max_on]).nice();
      z.domain(keys);

      g.append("g")
        .selectAll("g")
        .data(d3.stack().keys(keys)(data))
        .enter().append("g")
          .attr("fill", function(d) { return z(d.key); })
        .selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
          .attr("x", function(d) { return x(d.data.Year); })
          .attr("y", function(d) { return y(d[1]); })
          .attr("height", function(d) { return y(d[0]) - y(d[1]); })
          .attr("width", x.bandwidth())
          .on("mouseover", function(d){
                      //console.log(d)
                       d3.select(this).attr("stroke","tomato");
                       d3.select("#tooltip1")
                          .style("left", (d3.event.pageX + 15) + "px")
                          .style("top", (d3.event.pageY - 30) + "px")
                          .style("opacity", .9)
                         .select("#yr")
                         .text(d['data'].Year);

                       d3.select("#tooltip1")
                         .select("#pow2")
                         .text(d3.format(",.0f")(d[1] - d[0]));

                     d3.select("#tooltip1")
                       .select("#pow3")
                       .text(d3.format(",.0f")(d['data'].total));

                       d3.select("#tooltip1")
                         .select("#f_t")
                         .text(d.key);

                       d3.select("#tooltip1").classed("hidden", false);

           })
           .on("mouseout", function(d){
                       d3.select(this).attr("stroke", "").attr("stroke-width", 2);
                       //Hide the tooltip1
                       d3.select("#tooltip1").classed("hidden", true);
           });

      g.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x)
          .tickValues(x.domain().filter(function(d, i) { return !(i % 4); })));

          //.tickValues([1900, 1920, 1940, 1960, 1980, 2000, 2020, 2040]));

      g.append("g")
          .attr("class", "axis")
          .call(d3.axisLeft(y).ticks(null, "s"))
        .append("text")
          .attr("x", 2)
          .attr("y", y(y.ticks().pop()) + 0.5)
          .attr("dy", "0.32em")
          .attr("fill", "#000")
          .attr("font-weight", "bold")
          .attr("text-anchor", "start")
          .text("Newly Constructed Nameplate Capacity (MW)");

      var legend = g.append("g")
          .attr("font-family", "sans-serif")
          .attr("font-size", 10)
          .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      legend.append("rect")
          .attr("x", width + margin.left)
          .attr("width", 19)
          .attr("height", 19)
          .attr("fill", z);

      legend.append("text")
          .attr("x", width + margin.left - 5)
          .attr("y", 9.5)
          .attr("dy", "0.32em")
          .text(function(d) { return d; });
    })


    d3.csv("data/retirements_2.csv", function(d, i, columns) {
      for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
      d.total = t;
      d.Year = +d.Year;
      if (d.Year <= yr2 && d.Year >= yr1) {return d;}
    }, function(error, data) {
      if (error) throw error;
      console.log(data);

      var keys = data.columns.slice(1);

      data.sort(function(a, b) { return a.Year - b.Year; });
      x2.domain(data.map(function(d) { return d.Year; }));
      max_ret = d3.max(data, function(d) { return d.total; })
      // if (max_ret > max_on) {
      // y.domain([0, max_ret]).nice();
      // y2.domain([0, max_ret]).nice();}

      g2.append("g")
        .selectAll("g")
        .data(d3.stack().keys(keys)(data))
        .enter().append("g")
          .attr("fill", function(d) { return z2(d.key); })
        .selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
          .attr("x", function(d) { return x2(d.data.Year); })
          .attr("y", function(d) { return y2(d[0]); })
          .attr("height", function(d) { return y2(d[1]) - y2(d[0]); })
          .attr("width", x2.bandwidth())
          .attr("opacity", 0.75)
          .on("mouseover", function(d){
                       console.log(d)
                       d3.select(this).attr("stroke","tomato");
                       d3.select("#tooltip1")
                          .style("left", (d3.event.pageX + 15) + "px")
                          .style("top", (d3.event.pageY - 30) + "px")
                          .style("opacity", .9)
                         .select("#yr")
                         .text(d['data'].Year);

                       d3.select("#tooltip1")
                         .select("#pow2")
                         .text(d3.format(",.0f")(d[1] - d[0]));

                         d3.select("#tooltip1")
                           .select("#pow3")
                           .text(d3.format(",.0f")(d['data'].total));

                           d3.select("#tooltip1")
                             .select("#f_t")
                             .text(d.key);

                       d3.select("#tooltip1").classed("hidden", false);

           })
           .on("mouseout", function(d){
                       d3.select(this).attr("stroke", "").attr("stroke-width", 2);
                       //Hide the tooltip1
                       d3.select("#tooltip1").classed("hidden", true);
           });

      // g2.append("g")
      //     .attr("class", "axis")
      //     .attr("transform", "translate(0,0)")
      //     .call(d3.axisTop(x).tickValues([1900, 1920, 1940, 1960, 1980, 2000, 2020]));

      g2.append("g")
          .attr("class", "axis")
          .call(d3.axisLeft(y2).ticks(null, "s"))
        .append("text")
          .attr("x", 2)
          .attr("y", 2)
          //.attr("y", y2(y2.ticks().pop()) + 0.5)
          .attr("dy", "0.32em")
          .attr("fill", "#000")
          .attr("font-weight", "bold")
          .attr("text-anchor", "start")
          .text("Retired Nameplate Capacity (MW)");

    });


  }

  display_4(min_yr, max_yr);
  window.display_4 = display_4;
  window.myFunction = myFunction;
})
