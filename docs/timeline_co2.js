$(document).ready(function(){

  var State = [],
      Year = [],
      CO2 = [];
      plotData = [];
      format = d3.format(",.2f")


  d3.csv("./data/CO2emissions.csv", function(data) {
      data.map(function(d){
          State.push(d.State);
          Year.push(+d.Year);
          CO2.push(+d.CO2);
       });

          for(i = 0; i < State.length; i++){
              if(State[i] == "United States"){
                  plotData.push([Year[i], CO2[i]]);
              };
          };

          var plotData1 = plotData.sort(function(a, b) { return d3.ascending(a[0], b[0]); });

          var svg = d3.select("svg");

          var xpad = 100;

          var xmax = d3.max(plotData1, function(z) {return z[0];})+1;
          var xmin = d3.min(plotData1, function(z) {return z[0];});
          var ymax = d3.max(plotData1, function(z) {return z[1];})*1.1;
          var ymin = d3.min(plotData1, function(z) {return z[1];})*0.5;

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
             .attr("transform", "translate("+xpad+",325)")
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
             .attr("transform", "translate("+xpad*2+",0)")
             .call(make_y_axis()
             .tickSize(-450, 0, 0)
             .tickFormat("")
              )

          var div = d3.select("body")
                      .append("div")
                      .attr("class", "tooltip")
                      .style("opacity", 0);

          svg.append("g")
             .attr("class", "xAxis")
             .attr("transform", "translate("+xpad+",325)")
             .call(xAxis);

          svg.append("g")
             .attr("class", "yAxis")
             .attr("transform", "translate("+xpad*2+",0)")
             .call(yAxis);


          var xAxLab = (700 - xpad)/2 + 150
          svg.append("text")
             .attr("transform","translate("+xAxLab+",370)")
             .style("text-anchor", "middle")
             .text("Date");

          svg.append("text")
             .attr("transform","translate(5,140) rotate(0)")
             .attr("dy", "1em")
             .text("MM Metric Tons");

          svg.selectAll("path.pt")
             .data(plotData1)
             .enter()
             .append("path")
             .attr("class", "pt")
             .attr("fill","darkslateblue")
             .attr("d", d3.symbol().type(d3.symbolDiamond))
             .attr("transform", function(d) {
               return "translate(" + (xScale(d[0])+xpad)+ "," + yScale(d[1]) + ")";
              })
             .on("mouseover", function(d){
                          d3.select(this).attr("fill","tomato");
                          div.transition()
                             .duration(200)
                             .style("opacity", .9)
                             .style("left", (d3.event.pageX + 15) + "px")
                             .style("top", (d3.event.pageY - 30) + "px")
                             .attr("dy","0em")
                             .text(d[0] + " "+format(d[1]));

              })
              .on("mouseout", function(){
                          d3.select(this).attr("fill","darkslateblue");
                          div.transition()
                             .duration(300)
                             .style("opacity", 0)
              });

          var line = d3.line()
                       .x(function(d) {return (xScale(d[0])+xpad);})
                       .y(function(d) {return yScale(d[1]);});

          svg.append("path")
             .attr("class", "line")
             .attr("d", line(plotData1))


      var dropdown = State.filter(function(item, pos){
          return State.indexOf(item)== pos;
        });

      dropdown.unshift("United States");
      dropdown.splice(-1,1);

      var select = d3.select('body')
                  .append('select')
                  .attr('class','select')
                  .on('change', newPlot)

      var options = select.selectAll('option')
                        .data(dropdown).enter()
                        .append('option')
                          .text(function (d) { return d; });



      var line2 = d3.line()
                       .x(function(d) {return (xScale(d[0])+xpad);})
                       .y(function(d) {return yScale(plotData1[15][1]*0.65);});


      svg.append("path")
             .attr("class", "targetLevel")
             .attr("d", line2(plotData1))


      svg.append("text")
.attr("class", "targetLabel")
.attr("x", xpad*2)
.attr("y", yScale(plotData1[15][1]*0.65) - 7)
.text("Target Level 35% of 2005:  "+format(plotData1[15][1]*0.65))


      function newPlot() {
          var newArea = d3.select('select').property('value')
          plotData = [];
          plotData1 = [];

          for(i = 0; i < State.length; i++){
              if(State[i] == newArea){
                  plotData.push([Year[i], CO2[i]]);
              };
          };

          plotData1 = plotData.sort(function(a, b) { return d3.ascending(a[0], b[0]); });

          xmax = d3.max(plotData1, function(z) {return z[0];})+1;
          xmin = d3.min(plotData1, function(z) {return z[0];});
          ymax = d3.max(plotData1, function(z) {return z[1];})*1.1;
          ymin = d3.min(plotData1, function(z) {return z[1];})*0.5;

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
             .attr("transform", "translate("+xpad*2+",0)")
             .call(make_y_axis()
             .tickSize(-450, 0, 0)
             .tickFormat("")
              )

          svg.selectAll("g.xAxis")
             .attr("transform", "translate("+xpad+",325)")
             .call(xAxis);

          svg.selectAll("g.yAxis")
             .transition()
             .duration(500)
             .attr("transform", "translate("+xpad*2+",0)")
             .call(yAxis);


          //Updates data--------------------
          svg.selectAll("path.pt")
              .data(plotData1)
              .transition()
              .duration(800)
              .attr("transform", function(d) {
                  return "translate(" + (xScale(d[0])+xpad)+ "," + yScale(d[1]) + ")";
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
    .attr("y", yScale(plotData1[15][1]*0.65) - 7)
              .text("Target Level 35% of 2005:  "+format(plotData1[15][1]*0.65))

      };

    });
})
