// set the dimensions and margins of the graph



const population = {
    "Albania": 2877797,
    "Argentina": 45195774,
    "Armenia": 2957728,
    "Australia": 25499884,
    "Austria": 9006398,
    "Azerbaijan": 10139177,
    "Belgium": 11589623,
    "Bulgaria": 6948445,
    "Bosnia-Herzegovina": 3280819,
    "Belarus": 9449321,
    "Canada": 37742154,
    "Switzerland": 8654622,
    "Chile": 19116201,
    "China": 1439323776, 
    "Czech Republic": 10708981,
    "Germany": 83783942,
    "Denmark": 5792202,
    "Spain": 46754778,
    "Estonia": 1326535,
    "Finland": 5540720,
    "France": 65273511,
    "United Kingdom": 67886011,
    "Georgia": 3989167,
    "Greece": 10423054,
    "Croatia": 4105267,
    "Hungary": 9660350,
    "India": 1380004385,
    "Ireland": 4937786,
    "Iceland": 341243,
    "Israel": 8655541,
    "Italy": 60461826,
    "Japan": 126476461,
    "Kazakhstan": 18776707,
    "Korea": 51269185,
    "Liechtenstein": 38128,
    "Lithuania": 2722289,
    "Luxembourg": 625976,
    "Latvia": 1886202,
    "Morocco": 36910560,
    "Moldova": 4033963,
    "Mexico": 128932753,
    "North Macedonia": 2083374,
    "Malta": 441543,
    "Montenegro, Republic of": 628066,
    "Netherlands": 17134872,
    "Norway": 5421241,
    "New Zealand": 4822233,
    "Poland": 37846611,
    "Portugal": 10196709,
    "Romania": 19237691,
    "Russian Federation": 145934460,
    "Serbia, Republic of": 8737371,
    "Slovak Republic": 5459642,
    "Slovenia": 2078938,
    "Sweden": 10099270,
    "Türkiye": 84339067,
    "Ukraine": 43733762,
    "United States": 331002651,
    "Uzbekistan": 33469203

}



const margin = {top: 20, right: 40, bottom: 40, left: 80},
    width = 700 - margin.left - margin.right,  // Increased from 460
    height = 500 - margin.top - margin.bottom; // Increased from 400

// Append the SVG object to the body of the page
const svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Read the data
d3.csv("data/world_train_usage.csv").then(function(data) {

    data = data.filter(function(d) { return d.Variable === "Rail passenger transport"; })
    //sort the data by country
    data.sort(function(a, b) {
        return a.Country.localeCompare(b.Country);
    });

    // Normalize the data by population
    data.forEach(function(d) {
        d.NormalizedValue = d.Value * 1000000 / population[d.Country];
    });

    // List of groups (one group per column)
    const allGroup = new Set(data.map(d => d.Country))

    // Add the options to the button
    d3.select("#selectButton")
      .selectAll('myOptions')
      .data(allGroup)
      .enter()
      .append('option')
      .text(function (d) { return d; }) // Text showed in the menu
      .attr("value", function (d) { return d; }) // Corresponding value returned by the button
      .style("font-family", "Verdana, sans-serif"); // Set font for options

    // A color scale: one color for each group
    const myColor = d3.scaleOrdinal()
      .domain(allGroup)
      .range(d3.schemeSet2);

    // Add X axis
    const x = d3.scaleLinear()
      .domain(d3.extent(data, function(d) { return d.Year; }))
      .range([0, width]);
    const xAxis = d3.axisBottom(x).ticks(7).tickFormat(d3.format("d"));
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis)
      .attr("color", "#003082") // Blue axis color
      .style("stroke-width", "2px") // Thicker axis lines
      .selectAll("text")
        .style("font-family", "Verdana, sans-serif"); // Verdana font for axis labels

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.NormalizedValue; })])
      .range([height, 0]);
    const yAxis = d3.axisLeft(y);
    svg.append("g")
      .call(yAxis)
      .attr("color", "#003082") // Blue axis color
      .style("stroke-width", "3px") // Thicker axis lines
      .selectAll("text")
        .style("font-family", "Verdana, sans-serif"); // Verdana font for axis labels

    // Initialize line for the first selected country (e.g., Korea)
    const selectedLine = svg
      .append('g')
      .append("path")
        .datum(data.filter(function(d){return d.Country=="Korea"}))
        .attr("d", d3.line()
          .x(function(d) { return x(d.Year) })
          .y(function(d) { return y(+d.NormalizedValue) })
        )
        .attr("stroke", "#003082" )
        .style("stroke-width", 4)
        .style("fill", "none");

    // Initialize permanent line for the Netherlands
    const netherlandsLine = svg
      .append('g')
      .append("path")
        .datum(data.filter(function(d){return d.Country=="Netherlands"}))
        .attr("d", d3.line()
          .x(function(d) { return x(d.Year) })
          .y(function(d) { return y(+d.NormalizedValue) })
        )
        .attr("stroke", "#FF6600") // Orange color for the Netherlands
        .style("stroke-width", 4)
        .style("fill", "none");

    // A function that updates the chart for the selected country
    function update(selectedGroup) {
      // Create new data with the selection and normalize
      const dataFilter = data.filter(function(d){
          return d.Country == selectedGroup && d.Variable === "Rail passenger transport"
      });

      // Update line for the selected country
      selectedLine
          .datum(dataFilter)
          .transition()
          .duration(1000)
          .attr("d", d3.line()
            .x(function(d) { return x(d.Year) })
            .y(function(d) { return y(+d.NormalizedValue) })
          )
          .attr("stroke", "#003082" )
    }

    // When the button is changed, run the update function
    d3.select("#selectButton").on("change", function(event, d) {
        const selectedOption = d3.select(this).property("value");
        update(selectedOption);
    });

    svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + margin.top + 20) // Adjust this value to position the label correctly
    .text("Year")
    .style("font-size", "12px")
    .style("fill", "#003082");

    svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20) // Adjust these values to position the label correctly
    .attr("x", -margin.top)
    .text("Kilometers per Passenger (Millions)")
    .style("font-size", "12px")
    .style("fill", "#003082");


});