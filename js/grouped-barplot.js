const key_to_label = {
  "Year": "Year",
  "Bike": "Bike",
  "Bus_tram_metro": "Bus, tram, metro",
  "Other": "Other",
  "Car_driver": "Car driver",
  "Car_passenger": "Car passenger",
  "Train": "Train",
  "Walking": "Walking",
}

const marginPercentage = { top: 0.01, right: 0.06, bottom: 0.07, left: 0.04 };
const container = d3.select("#modes-of-transport-slide");
const containerWidth = container.node().getBoundingClientRect().width;
const containerHeight = container.node().getBoundingClientRect().height;

const margin = {
    top: containerHeight * marginPercentage.top,
    right: containerWidth * marginPercentage.right,
    bottom: containerHeight * marginPercentage.bottom,
    left: containerWidth * marginPercentage.left
};

// Calculate the width and height of the plot area
const width = 0.35*containerWidth - margin.left - margin.right;
const height = 0.5*containerHeight - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#grouped-barplot")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",`translate(${margin.left},${margin.top})`);

// Parse the Data
d3.csv("data/modes-of-transportation.csv").then( function(data) {

  // List of subgroups = header of the csv files = soil condition here
  const subgroups = data.columns.slice(1)

  // List of groups = species here = value of the first column called group -> I show them on the X axis
  const groups = data.map(d => d.Year)

  // console.log(groups)

  // Add X axis
  const x = d3.scaleBand()
      .domain(groups)
      .range([0, width])
      .padding([0.2])
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickSize(0));

  // Add Y axis
  const y = d3.scaleLinear()
    .domain([0, 60])
    .range([ height, 0 ]);

  // add a label to y axis
  svg.append("text")
  .attr("text-anchor", "end")
  .attr("transform", "rotate(-90)")
  .attr("y", -margin.left + 20) // Adjust these values to position the label correctly
  .attr("x", -margin.top)
  .text("Percentage of Trips Taken (%)")
  .style("font-size", "12px")
  .style("fill", "#003082");

  svg.append("g")
    .call(d3.axisLeft(y));

  // Another scale for subgroup position?
  const xSubgroup = d3.scaleBand()
    .domain(subgroups)
    .range([0, x.bandwidth()])
    .padding([0.05])

  // color palette = one color per subgroup
  const color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(['red', 'blue', 'green', 'orange', 'brown', 'purple','black' ])

  // Show the bars
  svg.append("g")
    .selectAll("g")
    // Enter in data = loop group per group
    .data(data)
    .join("g")
      .attr("transform", d => `translate(${x(d.Year)}, 0)`)
    .selectAll("rect")
    .data(function(d) { return subgroups.map(function(key) { return {key: key, value: d[key]}; }); })
    .join("rect")
      .attr("x", d => xSubgroup(d.key))
      .attr("y", d => y(d.value))
      .attr("width", xSubgroup.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", d => color(d.key))
      .attr('id', function(d) {
        // console.log(d.key);
        return "grouped-barplot-" + d.Year + "-" + d.key;
      });
      //  d => "grouped-barplot-" + d.Year + "-" + d.key);

  // Legend
  const legend = svg.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .selectAll("g")
    .data(subgroups.slice().reverse())
    .join("g")
      .attr("transform", (d, i) => `translate(0,${i * 20})`);

  legend.append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", color)
      .attr('id', d => d)
      .on('mouseover', highlight)
      .on('mouseout', no_highlight);

  legend.append("text")
      .attr("x", width + 5)
      .attr("y", 9.5)
      .attr("dy", "0.35em")
      .text(d => key_to_label[d]);
})

const highlight = function(event,d){
  // reduce opacity of all groups
  d3.selectAll("rect")
    .filter(function(e)
      { 
        return this.id.includes("grouped-barplot") && !this.id.includes(d);
      })
    .transition().duration(200)
    .style("opacity", .1)
}

// And when it is not hovered anymore
const no_highlight = function(event,d){
  d3.selectAll("rect")
  .filter(function(d)
      { 
        return this.id.includes("grouped-barplot");
      })
  .transition().duration(200)
  .style("opacity", 1)
}