$(document).ready(function(){
  var margin = {top: 20, right: 20, bottom: 20, left: 50},
      width = 700 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;
  function __getSVGElement() {
      var svg = d3.select("#bubble-chart").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      return svg;
  }
  function getUnitOfMeasure(chosenType) {
    var unitOfMeasure = '';
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
    return unitOfMeasure;
  }

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
          var chosenData = co2_data;
          var chosenYear = 1996;
          var chosenType = consumptionTypes[2];
          function getDataByYear(year) {
            var selectedData = []
            for(var i = 0; i < chosenData.length; i ++) {
              if(!chosenData[i][year]) {
                return []
              }
              selectedData.push({key: chosenData[i].Country, value: chosenData[i][year]})
            }
            return selectedData;
          }
          function tabulate(data, columns) {
        		var table = d3.select('#consumption-table').append('table')
        		var thead = table.append('thead')
        		var	tbody = table.append('tbody');
            console.log(chosenType)
        		// append the header row
        		thead.append('tr')
        		  .selectAll('th')
        		  .data(columns).enter()
        		  .append('th')
        		    .text(function (column) {
                  if(column == 'key') { return 'Country'}
                  if(column == 'value') {
                    if(chosenType == consumptionTypes[2]) {
                      return 'Emitted'
                    } else {
                      return 'Consumed';
                    }
                  }
                  if(column == 'percChange') { return '% change to previous year'; }
                });
        		// create a row for each object in the data
        		var rows = tbody.selectAll('tr')
        		  .data(data)
        		  .enter()
        		  .append('tr');
        		// create a cell in each row for each column
        		var cells = rows.selectAll('td')
        		  .data(function (row) {
        		    return columns.map(function (column) {
        		      return {column: column, value: row[column]};
        		    });
        		  })
        		  .enter()
        		  .append('td')
        		    .text(function (d) {
                  return d.value;
                });
        	  return table;
        	}

          function initYearUpdate() {
            $( "#slider" ).slider({
                min: 1991,
                max: 2016,
                step: 1,
                slide: function( event, ui ) {
                  $( "#year" ).val( ui.value );
                  chosenYear = ui.value;
                  renderChartByYearAndData();
                }
            });
            setSliderTicks();
            $( "#year" ).val($( "#slider" ).slider( "value" ) );
          }

          function setSliderTicks(){
              var $slider =  $('#slider');
              var max =  $slider.slider("option", "max");
              var min =  $slider.slider("option", "min");
              var spacing =  100 / (max - min);

              $slider.find('.ui-slider-tick-mark').remove();
              for (var i = 1; i < max - min ; i++) {
                  $('<span class="ui-slider-tick-mark"></span>').css('left', (spacing * i) +  '%').appendTo($slider);
               }
          }

          function resetChart() {
            d3.select('#bubble-chart').selectAll("svg").remove();
            d3.select('#bubble-chart').selectAll("bubble").remove();
            d3.select('#bubble-chart').selectAll("circle").remove();
            d3.select('#bubble-chart').selectAll("node").remove();
            d3.select('#consumption-table').selectAll("table").remove();
          }

          function fillEnergyTypes() {
            var s = document.getElementById('sel-energy-types');
            var i = 0;
            for(var idx in consumptionTypes) {
              var item = consumptionTypes[idx]
              s.options[i++] = new Option(item, item, true, false);
            }
            s.value = chosenType;
            $('#sel-energy-types').change(function() {
              chosenType = this.value;
              $('#fuel_type').text(chosenType);
              // var $th = $("table thead tr th").eq(1)
              // $th.text('Consumed')
              if(chosenType == consumptionTypes[0]) {
                chosenData = electricity_data;
              }
              if(chosenType == consumptionTypes[1]) {
                chosenData = coal_data;
              }
              if(chosenType == consumptionTypes[2]) {
                chosenData = co2_data;
                // $th.text('Emitted')
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
            var prev_d = getDataByYear(parseInt(chosenYear)-1);
            renderChart(d, __getSVGElement(), chosenYear, chosenType);
            $('#unitOfMeasure').text(getUnitOfMeasure(chosenType))
            $('#fuel_type').text(chosenType)
            function getTopTen(d, prev_d) {
              var sorted_arr = d.sort(function(a,b) {
                return parseFloat(b.value) - parseFloat(a.value)
              })
              var topTenFromThisYear = sorted_arr.slice(0,10)
              var retArr = []
              for(var i =0; i< topTenFromThisYear.length; i++) {
                var curr_item = topTenFromThisYear[i]
                var prev_item = prev_d.filter(function(item){
                  return curr_item.key == item.key
                })[0];
                if(prev_item) {
                  var percChange = (curr_item.value - prev_item.value) /  prev_item.value;
                  curr_item['percChange'] = (percChange*100).toFixed(1) + '%'
                } else {
                  curr_item['percChange'] = 'N/A'
                }
                retArr.push(curr_item)
              }
              return retArr
            }
            var topTen = getTopTen(d,prev_d)
            tabulate(topTen, ['key', 'value','percChange']);
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
                  var unitOfMeasure = getUnitOfMeasure(chosenType)

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
                  return d.r/3.5;
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
