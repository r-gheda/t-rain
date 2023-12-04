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
        // Update scales
        xScale.domain([0, d3.max(data, d => +d[currentX])]);
        yScale.domain([0, d3.max(data, d => +d[currentY])]);

        // Update axes
        xAxis.transition()
             .duration(1000)
             .call(d3.axisBottom(xScale));
        yAxis.transition()
             .duration(1000)
             .call(d3.axisLeft(yScale));

        // Bind data to dots
        const dots = svg.selectAll("circle")
                        .data(data);

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
            .style("fill", "#69b3a2");

        // Remove old dots
        dots.exit().remove();

        // Bind data to labels
        const labels = svg.selectAll(".label")
                          .data(data);


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
                        
        // get all d3 elements that whose id starts with scatter-node
        let children = document.querySelectorAll("[id^='spider-legend-']");

        for (let i = 0; i < children.length; i++) {
          let station_code = children[i]['id'].slice(14)
          d3.select("#scatter-label-" + station_code)
            .transition()
            .duration(1000)
            .attr("x", d => xScale(d[currentX]))
            .attr("y", d => yScale(d[currentY]) - 10)
            .attr("opacity", 1);

          let color = d3.select("#spider-legend-" + station_code).style("fill")

          d3.select("#scatter-node-" + station_code)
            .transition()
            .duration(1000)
            .attr("cx", d => xScale(d[currentX]))
            .attr("cy", d => yScale(d[currentY]));
            //.style("fill", "darkred");
        }
        // Remove old labels
        labels.exit().remove();
    }

    // Initial plot
    updateScatterPlot();

    // Dropdown event listeners
    d3.select("#xFeature").on("change", function() {
        currentX = d3.select(this).property("value");
        updateScatterPlot();
    });

    d3.select("#yFeature").on("change", function() {
        currentY = d3.select(this).property("value");
        updateScatterPlot();
    });
});
