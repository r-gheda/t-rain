const margin = {top:30, right:30, bottom: 70, left: 60},
    width = 1000 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

const svg = d3.select("#bargraph")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", margin.top + margin.bottom)
    .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("data/Station_passengers2018.csv").then( function(data) {

// X axis
const x = d3.scaleBand()
  .range([ 0, width ])
  .domain(data.map(d => d.Station))
  .padding(0.2);
svg.append("g")
  .attr("transform", `translate(0, ${height})`)
  .call(d3.axisBottom(x))
  .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

// Add Y axis
const y = d3.scaleLinear()
  .domain([0, 200000])
  .range([ height, 0]);
svg.append("g")
  .call(d3.axisLeft(y));

// Bars
svg.selectAll("mybar")
  .data(data)
  .join("rect")
    .attr("x", d => x(d.Station))
    .attr("y", d => y(d.InUit2018))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.InUit2018))
    .attr("fill", "#69b3a2")

    
    
    

})