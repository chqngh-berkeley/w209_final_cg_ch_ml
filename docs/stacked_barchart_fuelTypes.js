$(document).ready(function(){

  var svg = d3.select('#barchart-timeline').select("svg"),
      margin = {top: 20, right: 20, bottom: 30, left: 40},
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
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00", "#ffbf80"])

  var div = d3.select("body")
              .append("div")
              .attr("class", "tooltip")
              .style("opacity", 0);

  d3.csv("./data/stack_time_fuel_1.csv", function(d, i, columns) {
    for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
    d.total = t;
    return d;
  }, function(error, data) {
    if (error) throw error;

    var keys = data.columns.slice(1);
    console.log(data)
    data.sort(function(a, b) { return a.Year - b.Year; });
    x.domain(data.map(function(d) { return d.Year; }));
    //x.domain([1890, 2055])
    y.domain([0, d3.max(data, function(d) { return d.total; })]).nice();
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
                     d3.select("#tooltip")
                        .style("left", (d3.event.pageX + 15) + "px")
                        .style("top", (d3.event.pageY - 30) + "px")
                        .style("opacity", .9)
                       .select("#yr")
                       .text(d['data'].Year);

                     d3.select("#tooltip")
                       .select("#pow2")
                       .text(d3.format(",.0f")(d[1] - d[0]));

                     d3.select("#tooltip").classed("hidden", false);

         })
         .on("mouseout", function(d){
                     d3.select(this).attr("stroke", "").attr("stroke-width", 2);
                     //Hide the tooltip
                     d3.select("#tooltip").classed("hidden", true);
         });

    g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickValues([1900, 1920, 1940, 1960, 1980, 2000, 2020, 2040]));

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
        .text("Nameplate Capacity (MW)");

    var legend = g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
      .selectAll("g")
      .data(keys.slice().reverse())
      .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", z);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d) { return d; });
  });

  var svg2 = d3.select("svg#viz2"),
      margin2 = {top: 0, right: 20, bottom: 30, left: 40},
      width2 = +svg2.attr("width") - margin2.left - margin2.right,
      height2 = +svg2.attr("height") - margin2.top - margin2.bottom,
      g2 = svg2.append("g").attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
      // for bottom half

  var x2 = d3.scaleBand()
      .rangeRound([0, width])
      .paddingInner(0.05)
      .align(0.1);

  var y2 = d3.scaleLinear()
      .rangeRound([0, height]);

  var z2 = d3.scaleOrdinal()
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  d3.csv("./data/retirements_2.csv", function(d, i, columns) {
    for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
    d.total = t;
    return d;
  }, function(error, data) {
    if (error) throw error;

    var keys = data.columns.slice(1);

    data.sort(function(a, b) { return a.Year - b.Year; });
    x2.domain(data.map(function(d) { return d.Year; }));
    //y2.domain([0, d3.max(data, function(d) { return d.total; })]).nice();
    y2.domain([0, 70000]).nice();
    z2.domain(keys);

    g2.append("g")
      .selectAll("g")
      .data(d3.stack().keys(keys)(data))
      .enter().append("g")
        .attr("fill", function(d) { return z2(d.key); })
      .selectAll("rect")
      .data(function(d) { return d; })
      .enter().append("rect")
        .attr("x", function(d) { return x(d.data.Year); })
        .attr("y", function(d) { return y2(d[0]); })
        .attr("height", function(d) { return y2(d[1]) - y2(d[0]); })
        .attr("width", x.bandwidth())
        .on("mouseover", function(d){
                    //console.log(d)
                     d3.select(this).attr("stroke","tomato");
                     d3.select("#tooltip")
                        .style("left", (d3.event.pageX + 15) + "px")
                        .style("top", (d3.event.pageY - 30) + "px")
                        .style("opacity", .9)
                       .select("#yr")
                       .text(d['data'].Year);

                     d3.select("#tooltip")
                       .select("#pow2")
                       .text(d3.format(",.0f")(d[1] - d[0]));

                     d3.select("#tooltip").classed("hidden", false);

         })
         .on("mouseout", function(d){
                     d3.select(this).attr("stroke", "").attr("stroke-width", 2);
                     //Hide the tooltip
                     d3.select("#tooltip").classed("hidden", true);
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
        .attr("y", y2(y2.ticks().pop()) + 0.5)
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text("Nameplate Capacity (MW)");

    var legend = g2.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
      .selectAll("g")
      .data(keys.slice().reverse())
      .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", z);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d) { return d; });
  });
})
