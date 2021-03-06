$(document).ready(function(){

          var State = [],
              Year = [],
              CO2 = [];
          plotData = [];
          format = d3.format(",.2f");


          d3.csv("data/CO2emissions.csv", function (data) {
              data.map(function (d) {
                  State.push(d.State);
                  Year.push(+d.Year);
                  CO2.push(+d.CO2);
              });

              for (i = 0; i < State.length; i++) {
                  if (State[i] == "United States") {
                      plotData.push([Year[i], CO2[i]]);
                  };
              };

              var plotData1 = plotData.sort(function (a, b) { return d3.ascending(a[0], b[0]); });

              var svg = d3.select('#co2-chart-section').select("svg");

              var xpad = 100;

              var xmax = d3.max(plotData1, function (z) { return z[0]; }) + 1;
              var xmin = d3.min(plotData1, function (z) { return z[0]; });
              var ymax = d3.max(plotData1, function (z) { return z[1]; }) * 1.1;
              var ymin = d3.min(plotData1, function (z) { return z[1]; }) * 0.5;

              var xScale = d3.scaleLinear()
                  .domain([xmin, xmax])
                  .range([xpad, 550]);

              var xAxis = d3.axisBottom(xScale)
                  .ticks(14)
                  .tickFormat(d3.format("d"));

              function make_x_axis() {
                  return d3.axisBottom()
                      .scale(xScale)
                      .ticks(14);
              }

              svg.append("g")
                  .attr("class", "gridx")
                  .attr("transform", "translate(" + xpad + ",325)")
                  .call(make_x_axis()
                      .tickSize(-400, 0, 0)
                      .tickFormat("")
                  )

              var yScale = d3.scaleLinear()
                  .domain([ymin, ymax])
                  .range([325, 0]);

              var yAxis = d3.axisLeft(yScale)
                  .ticks(10);

              function make_y_axis() {
                  return d3.axisLeft()
                      .scale(yScale)
                      .ticks(10);
              }

              svg.append("g")
                  .attr("class", "gridy")
                  .attr("transform", "translate(" + xpad * 2 + ",0)")
                  .call(make_y_axis()
                      .tickSize(-450, 0, 0)
                      .tickFormat("")
                  )

              var div = d3.select('#co2-chart-section')
                  .append("div")
                  .attr("class", "tooltip")
                  .style("opacity", 0);

              svg.append("g")
                  .attr("class", "xAxis")
                  .attr("transform", "translate(" + xpad + ",325)")
                  .call(xAxis);

              svg.append("g")
                  .attr("class", "yAxis")
                  .attr("transform", "translate(" + xpad * 2 + ",0)")
                  .call(yAxis);


              var xAxLab = (700 - xpad) / 2 + 150
              svg.append("text")
                  .attr("transform", "translate(" + xAxLab + ",370)")
                  .style("text-anchor", "middle")
                  .text("Date");

              svg.append("text")
                  .attr("transform", "translate(5,140) rotate(0)")
                  .attr("dy", "1em")
                  .text("MM Metric Tons");

              svg.selectAll("path.pt")
                  .data(plotData1)
                  .enter()
                  .append("path")
                  .attr("class", "pt")
                  .attr("fill", "darkslateblue")
                  .attr("d", d3.symbol().type(d3.symbolDiamond))
                  .attr("transform", function (d) {
                      return "translate(" + (xScale(d[0]) + xpad) + "," + yScale(d[1]) + ")";
                  })
                  .on("mouseover", function (d) {
                      d3.select(this).attr("fill", "tomato");
                      div.transition()
                          .duration(200)
                          .style("opacity", .9)
                          .style("left", (d3.event.pageX + 15) + "px")
                          .style("top", (d3.event.pageY - 30) + "px")
                          .attr("dy", "0em")
                          .text(d[0] + " " + format(d[1]));

                  })
                  .on("mouseout", function () {
                      d3.select(this).attr("fill", "darkslateblue");
                      div.transition()
                          .duration(300)
                          .style("opacity", 0)
                  });

              var line = d3.line()
                  .x(function (d) { return (xScale(d[0]) + xpad); })
                  .y(function (d) { return yScale(d[1]); });

              svg.append("path")
                  .attr("class", "line")
                  .attr("d", line(plotData1))


              var dropdown = State.filter(function (item, pos) {
                  return State.indexOf(item) == pos;
              });

              dropdown.unshift("United States");
              dropdown.splice(-1, 1);

              var select = d3.select('#co2-chart-section')
                  .append('select')
                  .attr('class', 'select')
                  .on('change', newPlot)

              var options = select.selectAll('option')
                  .data(dropdown).enter()
                  .append('option')
                  .text(function (d) { return d; });



              var line2 = d3.line()
                  .x(function (d) { return (xScale(d[0]) + xpad); })
                  .y(function (d) { return yScale(plotData1[15][1] * 0.65); });


              svg.append("path")
                  .attr("class", "targetLevel")
                  .attr("d", line2(plotData1))


              svg.append("text")
                  .attr("class", "targetLabel")
                  .attr("x", xpad * 2)
                  .attr("y", yScale(plotData1[15][1] * 0.65) - 7)
                  .text("Target Level 35% of 2005:  " + format(plotData1[15][1] * 0.65))


              function newPlot() {
                  var newArea = d3.select('select').property('value')
                  plotData = [];
                  plotData1 = [];

                  for (i = 0; i < State.length; i++) {
                      if (State[i] == newArea) {
                          plotData.push([Year[i], CO2[i]]);
                      };
                  };

                  plotData1 = plotData.sort(function (a, b) { return d3.ascending(a[0], b[0]); });

                  xmax = d3.max(plotData1, function (z) { return z[0]; }) + 1;
                  xmin = d3.min(plotData1, function (z) { return z[0]; });
                  ymax = d3.max(plotData1, function (z) { return z[1]; }) * 1.1;
                  ymin = d3.min(plotData1, function (z) { return z[1]; }) * 0.5;

                  xScale = d3.scaleLinear()
                      .domain([xmin, xmax])
                      .range([xpad, 550]);

                  yScale = d3.scaleLinear()
                      .domain([ymin, ymax])
                      .range([325, 0]);

                  xScale = d3.scaleLinear()
                      .domain([xmin, xmax])
                      .range([xpad, 550]);


                  xAxis = d3.axisBottom(xScale)
                      .tickFormat(d3.format("d"));

                  yAxis = d3.axisLeft(yScale);

                  //Updates axis--------------------

                  svg.selectAll("g.gridy")
                      .transition()
                      .duration(500)
                      .attr("transform", "translate(" + xpad * 2 + ",0)")
                      .call(make_y_axis()
                          .tickSize(-450, 0, 0)
                          .tickFormat("")
                      )

                  svg.selectAll("g.xAxis")
                      .attr("transform", "translate(" + xpad + ",325)")
                      .call(xAxis);

                  svg.selectAll("g.yAxis")
                      .transition()
                      .duration(500)
                      .attr("transform", "translate(" + xpad * 2 + ",0)")
                      .call(yAxis);


                  //Updates data--------------------
                  svg.selectAll("path.pt")
                      .data(plotData1)
                      .transition()
                      .duration(800)
                      .attr("transform", function (d) {
                          return "translate(" + (xScale(d[0]) + xpad) + "," + yScale(d[1]) + ")";
                      })

                  //Updates line--------------------
                  svg.selectAll("path.line")
                      .transition()
                      .duration(800)
                      .attr("d", line(plotData1))


                  svg.selectAll("path.targetLevel")
                      .transition()
                      .duration(800)
                      .attr("d", line2(plotData1))

                  svg.selectAll(".targetLabel")
                      .transition()
                      .duration(800)
                      .attr("y", yScale(plotData1[15][1] * 0.65) - 7)
                      .text("Target Level 35% of 2005:  " + format(plotData1[15][1] * 0.65))

                  //Link to SecondPLOTTTTT
                  var plotData2 = []

                  console.log("area: "+ newArea);
                  for (i = 0; i < State2.length; i++) {
                      if (State2[i] == newArea) {
                          plotData2.push([Year2[i], Fuel[i], Value2[i]]);
                      };
                  };

                  var ymax3 = d3.max(plotData2, function (z) { return z[2]; }) * 4;

                  var xpad1 = 25
                  var yScale2 = d3.scaleLinear()
                      .domain([0, ymax3])
                      .range([325, 0]);

                  var svg2 = d3.select('#co2-chart-section').select(".svg2")

                  svg2.selectAll("g.yAxis2")
                      .transition()
                      .duration(500)
                      .attr("transform", "translate(" + xpad1 * 2 + ",0)")
                      .call(d3.axisLeft(yScale2));

                  var xScale2 = d3.scaleBand()
                      .domain(d3.range(1990, 2016))
                      .rangeRound([xpad1, 600])
                      .paddingInner(.01);

                  var colors = ["orange", "blue", "black", "green", "grey"];

                  for (i = 1990; i < 2016; i++) {
                      var subdata = [];
                      var category = [];
                      var position = [];
                      var barData = [];

                      for (j = 0; j < plotData2.length; j++) {

                          if (plotData2[j][0] == i) {
                              subdata.push(plotData2[j][2])
                              category.push(plotData2[j][1])
                          };
                      };


                      subdata.reduce(function (a, b, i) { return position[i] = a + b; }, 0);


                      for (k = 0; k < position.length; k++) {
                          var xVal = (xScale2(i) + xpad1 + 7);
                          barData.push([subdata[k], position[k], colors[k], i, category[k], xVal]);
                      };

                      svg2.selectAll("g.rectByYear"+i+ " rect")
                          .data(barData)
                          .transition()
                          .duration(500)
                          .attr("y", function (d) {
                              // console.log(d)
                              return yScale2(d[1]);
                          })
                          .attr("data-legend", function (d) { return d[4] })
                          .attr("height", function (d) {
                              return 325 - yScale2(d[0]);
                          });

                  };

              };

          });

          var State2 = [],
                      Year2 = [],
                      Fuel = [];
                  Value2 = [];
                  plotData2 = [];


                  d3.csv("data/CO2bytype2.csv", function (data) {
                      data.map(function (d) {
                          State2.push(d.State);
                          Year2.push(+d.Year);
                          Fuel.push(d.Fuel);
                          Value2.push(+d.Value);
                      });

                      for (i = 0; i < State2.length; i++) {
                          if (State2[i] == "United States") {
                              plotData2.push([Year2[i], Fuel[i], Value2[i]]);
                          };
                      };

                      var xpad1 = 25

                      var svg2 = d3.select('#co2-chart-section').select(".svg2")
                      var xScale1 = d3.scaleBand()
                          .domain(d3.range(1990, 2016))
                          .rangeRound([xpad1, 600])
                          .paddingInner(.01);


                      var xAxis1 = d3.axisBottom(xScale1)
                          // .tickFormat(d3.format("d"));
                          .tickFormat(function(d){
                                  return d.toString().substring(2,4);
                              });

                      svg2.append("g")
                          .attr("class", "xAxis2")
                          .attr("transform", "translate(" + xpad1 + ",325)")
                          .call(xAxis1)
                          .selectAll("text")
                          .attr("y", 0)
                          .attr("x", -30)
                          .attr("dy", ".35em")
                          .attr("transform", "rotate(270)")
                          .style("text-anchor", "start");

                      var ymax2 = d3.max(plotData2, function (z) { return z[2]; }) * 4;

                      var yScale1 = d3.scaleLinear()
                          .domain([0, ymax2])
                          .range([325, 0]);

                      var yAxis2 = d3.axisLeft(yScale1);

                      svg2.append("g")
                          .attr("class", "yAxis2")
                          .attr("transform", "translate(" + xpad1 * 2 + ",0)")
                          .call(yAxis2);

                      var div1 = d3.select("#co2-chart-section")
                          .append("div")
                          .attr("class", "tooltip")
                          .style("opacity", 0);


                      var colors = ["orange", "blue", "black", "green", "grey"];

                      // svg2.append("g")
                      //     .attr("class", "rectBars")

                      for (i = 1990; i < 2016; i++) {
                          var subdata = [];
                          var category = [];
                          var position = [];
                          var barData = [];
                          for (j = 0; j < plotData2.length; j++) {

                              if (plotData2[j][0] == i) {
                                  subdata.push(plotData2[j][2])
                                  category.push(plotData2[j][1])
                              };
                          };


                          subdata.reduce(function (a, b, i) { return position[i] = a + b; }, 0);

                          for (k = 0; k < position.length; k++) {
                              var xVal = (xScale1(i) + xpad1 + 7);
                              barData.push([subdata[k], position[k], colors[k], i, category[k], xVal]);
                          };

                          svg2.selectAll("g.rectByYear"+i)
                              .data(barData)
                              .enter()
                              .append("g")
                              .attr("class", "rectByYear" + i)
                              .append("rect")
                              .attr("x", function (d) {
                                  return d[5];// (xScale1(i) + xpad1 + 7)
                              })
                              .attr("y", function (d) {
                                  return yScale1(d[1]);
                              })
                              .attr("data-legend", function (d) { return d[4] })
                              .attr("width", 6)
                              .attr("height", function (d) {
                                  return 325 - yScale1(d[0]);
                              })
                              .attr("fill", function (d) {
                                  return d[2];
                              })
                              .on("mouseover", function (d) {
                                  d3.select(this).attr("fill", "tomato");
                                  div1.transition()
                                      .duration(200)
                                      .style("opacity", .9)
                                      .style("left", (d3.event.pageX + 15) + "px")
                                      .style("top", (d3.event.pageY - 30) + "px")
                                      .attr("dy", "0em")
                                      .text(format(d[0]));

                              })
                              .on("mouseout", function () {
                                  d3.select(this).attr("fill", function (d) { return d[2] });
                                  div1.transition()
                                      .duration(300)
                                      .style("opacity", 0)
                              });
                      };

                      console.log(svg2.selectAll(".rectangle1991"))

                      var legendVals = ["Commercial", "Electricity", "Industrial", "Residential", "Transportation"]
                      var legend = svg2.selectAll(".legend")
                          .data(legendVals)
                          .enter().append("g")
                          .attr("class", "legend")
                          .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

                      legend.append("rect")
                          .data(colors)
                          .attr("x", 50)
                          .attr("width", 12)
                          .attr("height", 12)
                          .style("fill", function (d) { return d });

                      legend.append("text")
                          .data(legendVals)
                          .attr("x", 80)
                          .attr("y", 9)
                          .attr("dy", ".2em")
                          .style("text-anchor", "beginning")
                          .text(function (d) { return d; });
                  });

})
