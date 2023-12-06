
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
    console.log(station_names.length);


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
                     .call(d3.axisBottom(xScale).ticks(10)) // Initial call for creation
                     .selectAll("path")
                     .style("stroke-width", 2);
                     
    const yAxis = svg.append("g")
                    .call(d3.axisLeft(yScale).ticks(10)) // Initial call for creation
                    .selectAll("path")
                    .style("stroke-width", 2);

    // Update function
    function updateScatterPlot() {
      console.log(code1);
      console.log(code2);
      console.log(currentX);
      console.log(currentY);
      d3.csv("data/relative-features/" + code1 + ".csv").then(relative_data1 => {
        d3.csv("data/relative-features/" + code2 + ".csv").then(relative_data2 => {
        // Update scales
        console.log(data.length);
        console.log(relative_data1.length);
        console.log(relative_data2.length);

        //print the station codes that are in relative_data1 but not in data
        let relative_data1_codes = relative_data1.map(d => d['Station Code']);
        let relative_data2_codes = relative_data2.map(d => d['Station Code']);
        let data_codes = data.map(d => d['Station Code']);
        
        let data_codes_not_in_relative_data1 = data_codes.filter(x => !relative_data1_codes.includes(x));
        let data_codes_not_in_relative_data2 = data_codes.filter(x => !relative_data2_codes.includes(x));
        console.log(data_codes_not_in_relative_data1);
        console.log(data_codes_not_in_relative_data2);






        let data1;
        let data2;
        let data_merged;
        
        //if currentX or currentY is in relative_features
        if (currentX == currentY && relative_features.includes(currentX))
        {
          console.log("sono qui");
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
            console.log(data_merged.slice(0,5));

            

        }
        else
        {
            data1 = data;
            data2 = data;
            data_merged = data;
        }

        console.log(data_merged.slice(0,5));

        xScale.domain([0, d3.max(data_merged, d => +d[currentX])]);
        yScale.domain([0, d3.max(data_merged, d => +d[currentY])]);

        console.log(data_merged.slice(0,5));

        // Update axes
        xAxis.transition()
             .duration(1000)
             .call(d3.axisBottom(xScale));
        yAxis.transition()
             .duration(1000)
             .call(d3.axisLeft(yScale));

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

          d3.select("#scatter-node-" + station_code)
            .transition()
            .duration(1000)
            .attr("cx", d => xScale(d[currentX]))
            .attr("cy", d => yScale(d[currentY]));

        }
        // Remove old labels
        labels.exit().remove();
    });
  });
}

    // Initial plot
    updateScatterPlot();

    // Dropdown event listeners
    d3.select("#xFeature").on("change", function() {
        currentX = d3.select(this).property("value");

        if (currentX[0] === 'd'){
          console.log("DDD");
          code1 = currentX.slice(9);
        }
        else if (currentX[0] === 's'){
          code1 = currentX.slice(17);
        }
        else if (currentX[0] === 'n'){
          code1 = currentX.slice(17);
        }
        else{
          code1 = 'ASD';
        }

        updateScatterPlot();
    });

    d3.select("#yFeature").on("change", function() {
        currentY = d3.select(this).property("value");

        if (currentY[0] === 'd'){
          console.log("DDD");
          code2 = currentY.slice(9);
        }
        else if (currentY[0] === 's'){
          code2 = currentY.slice(17);
        }
        else if (currentY[0] === 'n'){
          code2 = currentY.slice(17);
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
                  
                  relative_features.push("distance_" + compare_stations[i]);
                  relative_features.push("services_per_day_" + compare_stations[i]);
                  relative_features.push("n_of_disruptions_" + compare_stations[i]);
              }
              console.log(relative_features);

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
          let feature1 = "distance_" + compare_stations[i];
          let feature2 = "services_per_day_" + compare_stations[i];
          let feature3 = "n_of_disruptions_" + compare_stations[i];
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
