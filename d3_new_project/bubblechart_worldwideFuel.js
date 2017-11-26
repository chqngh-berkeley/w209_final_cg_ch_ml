$(document).ready(function(){
  var margin = {top: 20, right: 20, bottom: 20, left: 100},
      width = 960 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;
  function __getSVGElement() {
      var svg = d3.select("#bubble-chart").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      return svg;
  }
  // var svg_ = d3.select("#bubble-chart").append("svg")
  //         .attr("width", width + margin.left + margin.right)
  //         .attr("height", height + margin.top + margin.bottom)
  //       .append("g")
  //         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  //

  var tooltip = d3
        .select('body')
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("color", "white")
        .style("padding", "8px")
        .style("background-color", "#626D71")
        .style("border-radius", "6px")
        .style("text-align", "center")
        .style("font-family", "monospace")
        .style("width", "400px")
        .text("");
  d3.csv("./data/electricity_consumption_cleaned.csv", function(error, electricity_data) {
    d3.csv("./data/coal_consumption_cleaned.csv", function(error, coal_data) {
      d3.csv("./data/co2_emissions_worldwide_cleaned.csv", function(error, co2_data) {
        d3.csv("./data/natural_gas_consumption_cleaned.csv", function(error, natural_gas_data) {
          var consumptionTypes = ['Electricity', 'Coal','CO2 Emissions' ,'Natural Gas'];
          var chosenData = electricity_data;
          var chosenYear = 1996;
          var chosenType = consumptionTypes[0];

          $('#fuel_type').text('Electricity Consumption')
          function getDataByYear(year) {
            var selectedData = []
            for(var i = 0; i < chosenData.length; i ++) {
              selectedData.push({key: chosenData[i].Country, value: chosenData[i][year]})
            }
            return selectedData;
          }
          function initYearUpdate() {
            $( "#slider" ).slider({
                min: 1996,
                max: 2016,
                step: 1,
                slide: function( event, ui ) {
                  $( "#year" ).val( ui.value );
                  chosenYear = ui.value;
                  renderChartByYearAndData();
                }
            });
            $( "#year" ).val($( "#slider" ).slider( "value" ) );
          }

          function resetChart() {
            d3.select('#bubble-chart').selectAll("svg").remove();
            d3.select('#bubble-chart').selectAll("bubble").remove();
            d3.select('#bubble-chart').selectAll("circle").remove();
            d3.select('#bubble-chart').selectAll("node").remove();
            d3.select('#bubble-chart').selectAll("table").remove();
          }

          function fillEnergyTypes() {
            var s = document.getElementById('sel-energy-types');
            var i = 0;
            for(var idx in consumptionTypes) {
              var item = consumptionTypes[idx]
              s.options[i++] = new Option(item, item, true, false);
            }
            $('#sel-energy-types').change(function() {
              chosenType = this.value;
              $('#fuel_type').text(chosenType);
              if(chosenType == consumptionTypes[0]) {
                chosenData = electricity_data;
              }
              if(chosenType == consumptionTypes[1]) {
                chosenData = coal_data;
              }
              if(chosenType == consumptionTypes[2]) {
                chosenData = co2_data;
              }
              if(chosenType == consumptionTypes[3]) {
                chosenData = natural_gas_data;
              }
              renderChartByYearAndData();
            });
          };
          function renderChartByYearAndData() {
            resetChart();
            var d = getDataByYear(chosenYear);
            renderChart(d, __getSVGElement(), chosenYear, chosenType);
          }
          fillEnergyTypes();
          initYearUpdate();
          renderChartByYearAndData();
        });


        function renderChart(raw_data, svg_, targetLabel, chosenType) {
          var diameter = height;
          var color = d3.scaleOrdinal(d3.schemeCategory20);
          var data = {
            'children' : raw_data
          }
          var bubble = d3.pack(data)
              .size([diameter, diameter])
              .padding(1.5);

          var svg = svg_
                .attr("width", diameter)
                .attr("height", diameter)
                .attr("class", "bubble");

          var nodes = d3.hierarchy(data)
              .sum(function(d) {
                return parseInt(d.value);
              });

          var node = svg.selectAll(".node")
              .data(bubble(nodes).descendants())
              .enter()
              .filter(function(d){
                  return  !d.children
              })
              .append("g")
              .attr("class", "node")
              .attr("transform", function(d) {
                  return "translate(" + d.x + "," + d.y + ")";
              })
              .on("mouseover", function(d) {
                  var unitOfMeasure = ''
                  if(chosenType == 'Electricity') {
                    unitOfMeasure = '(TWh)'
                  }
                  if(chosenType == 'Coal') {
                    unitOfMeasure = '(Mt)'
                  }
                  if(chosenType == 'Natural Gas') {
                    unitOfMeasure = '(bcm)'
                  }
                  if(chosenType == 'CO2 Emissions') {
                    unitOfMeasure = '(MtCO2)'
                  }
                  tooltip.html('<span>' + d.data.key + ':'+ d.data.value+ unitOfMeasure+' </span>');
                  return tooltip.style("visibility", "visible");
              })
              .on("mousemove", function() {
                  return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
              })
              .on("mouseout", function() {
                  return tooltip.style("visibility", "hidden");
              });

          node.append("title")
              .text(function(d) {
                  return d.key + ": " + d.value;
              });

          node.append("circle")
              .attr("r", function(d) {
                  return d.r;
              })
              .style("fill", function(d,i) {
                  return color(i);
              });

          node.append("text")
              .attr("dy", ".2em")
              .style("text-anchor", "middle")
              .text(function(d) {
                  return d.data.key.substring(0, d.r / 3);
              })
              .attr("font-family", "sans-serif")
              .attr("font-size", function(d){
                  return d.r/5;
              })
              .attr("fill", "white");

          node.append("text")
              .attr("dy", "1.3em")
              .style("text-anchor", "middle")
              .text(function(d) {
                  return d.data.value;
              })
              .attr("font-family",  "Gill Sans", "Gill Sans MT")
              .attr("font-size", function(d){
                  return d.r/5;
              })
              .attr("fill", "white");

          d3.select(self.frameElement)
              .style("height", diameter + "px");
            }
      })
    })
  })
})
