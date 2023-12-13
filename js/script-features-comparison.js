
d3.csv("data/station_features/station_service_disruption_delays_cancel_counts_with_names.csv").then(data => {
    const margin = {top: 20, right: 40, bottom: 50, left: 70},
          width = 600 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#station-features-scatter")
                  .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);

    let currentX = "Number of Services";
    let currentY = "Disruption Count";
    let featureOptions = ["Number of Services", "Disruption Count", "Delay Count", "Cancel Count"]; // Add more options as needed
    let compare_stations = [];
    let relative_features = [];
    let station_names = [];
   
    let code1 = 'ASD';
    let code2 = 'ASD';

    for (let i = 0; i < data.length; i++)
    {
        station_names.push(data[i]['Station Name']);
    }


    // Populate dropdown menus
    d3.select("#xFeature")
      .selectAll("option")
      .data(featureOptions)
      .enter()
      .append("option")
      .text(d => d)
      .attr("value", d => d);
      

    d3.select("#yFeature")
      .selectAll("option")
      .data(featureOptions)
      .enter()
      .append("option")
      .text(d => d)
      .attr("value", d => d);

    // Set default values for dropdowns
    d3.select("#xFeature").property("value", "Number of Services");
    d3.select("#yFeature").property("value", "Disruption Count");

    // Scale setup
    const xScale = d3.scaleLinear()
                     .range([0, width]);
    const yScale = d3.scaleLinear()
                     .range([height, 0]);

    // Axis setup
    const xAxis = svg.append("g")
                     .attr("transform", `translate(0,${height})`)
                     
  
    const yAxis = svg.append("g")

    // Update function
    function updateScatterPlot() {

      d3.csv("data/relative-features/" + code1 + ".csv").then(relative_data1 => {
        d3.csv("data/relative-features/" + code2 + ".csv").then(relative_data2 => {
      
        let data1;
        let data2;
        let data_merged;
        
        //if currentX or currentY is in relative_features
        if (currentX == currentY && relative_features.includes(currentX))
        {
          data_merged = relative_data1;
        }
        else if (relative_features.includes(currentX) || relative_features.includes(currentY))
        {
           if (relative_features.includes(currentX))
           {
               data1 = relative_data1;
           }
            else
            {
                data1 = data;
            }
            if (relative_features.includes(currentY))
            {
                data2 = relative_data2;
            }
            else
            {
                data2 = data;
            }
          
            let data2Map = new Map(data2.map(item => [item['Station Code'], item]));

            // Merge data1 and data2
            data_merged = data1.map(item1 => {
                let item2 = data2Map.get(item1['Station Code']);
                if (item2) {
                    return {...item1, ...item2}; // Combine the objects
                }
            });

            // Filter out any undefined entries (if there's no match in data2)
            data_merged = data_merged.filter(item => item !== undefined);        
        }
        else
        {
            data1 = data;
            data2 = data;
            data_merged = data;
        }


        xScale.domain(d3.extent(data_merged, d => +d[currentX]));
        yScale.domain(d3.extent(data_merged, d => +d[currentY]));


        //Update axes
        xAxis.transition()
             .duration(2000)
             .call(d3.axisBottom(xScale));
        yAxis.transition()
             .duration(2000)
             .call(d3.axisLeft(yScale));

        let xAxisLabel = svg.select(".x-axis-label");
        if (xAxisLabel.empty()) {
            xAxisLabel = svg.append("text")
                            .attr("class", "x-axis-label")
                            .attr("text-anchor", "middle")
                            .style("font-size", "14px")
                            .style("fill", "#003082");
        }
        xAxisLabel.attr("x", width / 2)
                  .attr("y", height + margin.bottom - 5)
                  .text(currentX);
        
        // Update Y-axis label
        let yAxisLabel = svg.select(".y-axis-label");
        if (yAxisLabel.empty()) {
            yAxisLabel = svg.append("text")
                            .attr("class", "y-axis-label")
                            .attr("text-anchor", "middle")
                            .style("font-size", "14px")
                            .style("fill", "#003082")
                            .attr("transform", "rotate(-90)");
        }
        yAxisLabel.attr("x", -height / 2)
                  .attr("y", -margin.left + 15)
                  .text(currentY);

  
        // Bind data to dots
        const dots = svg.selectAll("circle").data(data_merged);

        // Enter new dots
        dots.enter()
            .append("circle")
            .attr("id", d => "scatter-node-" + d["Station Code"])
            .merge(dots) // Apply changes to all circles
            .transition()
            .duration(1000)
            .attr("cx", d => xScale(d[currentX]))
            .attr("cy", d => yScale(d[currentY]))
            .attr("r", 3.5)
            .style("fill", "#f7c82d");

        // Remove old dots
        dots.exit().remove();

        // Bind data to labels
        const labels = svg.selectAll(".label")
                          .data(data_merged);


        // Enter new labels
        labels.enter()
          .append("text")
          .attr("class", "label")
          .merge(labels)
          .transition()
          .duration(1000)
          .attr("opacity", 0.0)
          .attr("x", d => xScale(d[currentX]))
          .attr("y", d => yScale(d[currentY]) - 10)
          .text(d => d["Station Code"])
          .attr("text-anchor", "middle")
          .style("font-size", "11px")
          .attr("id", d => "scatter-label-" + d["Station Code"]);
                        
        // get all d3 elements whose id starts with scatter-node
        let children = document.querySelectorAll("[id^='spider-legend-']");

        for (let i = 0; i < children.length; i++) {
          let station_code = children[i]['id'].slice(14)
          d3.select("#scatter-label-" + station_code)
            .transition()
            .duration(1000)
            .attr("x", d => xScale(d[currentX]))
            .attr("y", d => yScale(d[currentY]) - 10)
            .attr("opacity", 1);

          //let color = d3.select("#spider-legend-" + station_code).style("fill")

          // for each scatter node, associate it with row with same station code
          
          data.forEach(function(row)
          {
            d3.select("#scatter-node-" + row['Station Code'])
              .transition()
              .duration(1000)
              .attr("cx", function(d)
              {
                if (relative_features.includes(currentX))
                {
                  // get idx in relative_data1 given station code
                  let idx = relative_data1.findIndex(x => x['Station Code'] === row['Station Code']);
                  return xScale(relative_data1[idx][currentX]);
                }
                return xScale(row[currentX]);
              })
              .attr("cy", function(d)
              {
                if (relative_features.includes(currentY))
                {
                  let idx = relative_data2.findIndex(x => x['Station Code'] === row['Station Code']);
                  return yScale(relative_data2[idx][currentY]);
                }
                return yScale(row[currentY]);
              });
          });


        }
        // Remove old labels
        labels.exit().remove();
    });
  });
}

    // // Initial plot
    updateScatterPlot();

    // Dropdown event listeners
    d3.select("#xFeature").on("change", function() {
        currentX = d3.select(this).property("value");

        if (currentX[9] === 'f' &&  currentX[3]=== 't'){
          code1 = currentX.replace("Distance from ", "");
        }
        else if (currentX[0] === 'S' && currentX[9] === 'f'){
          code1 = currentX.replace("Services from/to ", "");
        }
        else if (currentX[13] === 'n' && currentX[0] == 'D'){
          code1 = currentX.replace("Disruptions on path to ", "");
        }
        else{
          code1 = 'ASD';
        }

        updateScatterPlot();
    });

    d3.select("#yFeature").on("change", function() {
        currentY = d3.select(this).property("value");

        if (currentY[9] === 'f' &&  currentY[3]=== 't'){
          code2 = currentY.replace("Distance from ", "");
        }
        else if (currentY[0] === 'S' && currentY[9] === 'f'){
          code2 = currentY.replace("Services from/to ", "");
        }
        else if (currentY[13] === 'n' && currentY[0] == 'D'){
          code2 = currentY.replace("Disruptions on path to ", "");
        }
        else{
          code2 = 'ASD';
        }

        updateScatterPlot();
    });

    function searchRelativeStation(inputText) {
      let suggestions = station_names.filter(stationName => 
          stationName.toLowerCase().startsWith(inputText.toLowerCase())
      );
      displayRelativeSuggestions(suggestions);
  }

  function selectRelativeStation(name) {
          
          let searchValue = name.toUpperCase();
  
          //remove the text from the search bar
          d3.select('#relativeStation').property('value', '');

          //put in a value all the rows that have station name = searchValue
          if (data.filter(d => d['Station Name'].toUpperCase() === searchValue).length === 0 ){

          }
          else{
              //TODO

              d3.select("#suggestion-box-relative").selectAll("div").remove();
              let searchCode = data.filter(d => d['Station Name'].toUpperCase() === searchValue)[0]['Station Code'];

              if (!compare_stations.includes(searchCode)) {
                  compare_stations.push(searchCode);
              }
              //for each station in compare_stations, add three features to relative_features called "distance from station_code", "number of services to/from station_code", "number of disruptions to/from station_code"
              relative_features = [];
              for (let i = 0; i < compare_stations.length; i++)
              {   
                  
                  relative_features.push("Distance from " + compare_stations[i]);
                  relative_features.push("Services from/to " + compare_stations[i]);
                  relative_features.push("Disruptions on path to " + compare_stations[i]);
              }

              //add the new features to the dropdowns of the axes of the scatter plot
              d3.select("#xFeature")
                .selectAll("option")
                .data(featureOptions.concat(relative_features))
                .enter()
                .append("option")
                .text(d => d)
                .attr("value", d => d);
              
              d3.select("#yFeature")
                .selectAll("option")
                .data(featureOptions.concat(relative_features))
                .enter()
                .append("option")
                .text(d => d)
                .attr("value", d => d);
              

          }

      }
  
  function displayRelativeSuggestions(suggestions) {
          
          // Remove all existing suggestions
          d3.select("#suggestion-box-relative").selectAll("div").remove();
          // Bind the suggestions to div elements
          let suggestionDivs = d3.select("#suggestion-box-relative")
              .selectAll("div")
              .data(suggestions);
          
          // Enter selection: Create new divs for new data
          suggestionDivs.enter()
              .append("div")
              .text(d => d)
              .on("click", function() {
                  // Using datum() to retrieve the bound data
                  let selectedStation = d3.select(this).datum();
                  selectRelativeStation(selectedStation);
              });
          
          // Exit selection: Remove divs for data that no longer exists
          suggestionDivs.exit().remove();
      }


  d3.select('#relativeStation').on('input', function() {
      let inputText = this.value;
      if (inputText === "") {
          d3.select("#suggestion-box-relative").selectAll("div").remove();
      } else {
          searchRelativeStation(inputText);
      }

  });

  //if the user clicks on clearRelative, reset the compare_stations array
  d3.select('#clearRelative').on('click', function() {
      //for each station in compare_stations, remove the features from the dropdowns of the axes of the scatter plot
      for (let i = 0; i < compare_stations.length; i++)
      {   
          //nomi da cambiare con cose più comprensibili
          let feature1 = "Distance from " + compare_stations[i];
          let feature2 = "Services from/to " + compare_stations[i];
          let feature3 = "Disruptions on path to " + compare_stations[i];
          d3.select("#xFeature").selectAll("option").filter(function(d) { return d === feature1 || d === feature2 || d === feature3; }).remove();
          d3.select("#yFeature").selectAll("option").filter(function(d) { return d === feature1 || d === feature2 || d === feature3; }).remove();
      }
      compare_stations = [];
      relative_features = [];
      code1 = 'ASD';
      code2 = 'ASD';
      currentX = "Number of Services";
      currentY = "Disruption Count";
      d3.select("#xFeature").property("value", "Number of Services");
      d3.select("#yFeature").property("value", "Disruption Count");
      
      updateScatterPlot();
      
  });

});
