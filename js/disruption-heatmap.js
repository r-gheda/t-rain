// set the dimensions and margins of the graph
let margin = {top: 10, right: 30, bottom: 30, left: 100},
width = 460 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
let svg = d3.select("#disr-heatmap")
.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// read data
d3.csv("data/disruptions-2022-geo.csv").then( function(data) {

// Add X axis
let x = d3.scaleLinear()
    .domain([30429, 309128])
    .range([ margin.left, width - margin.right ]);

let xgen = d3.axisBottom(x)
    .ticks(0);

    
svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(xgen);
    
svg.select(".domain")
    .attr("opacity",".0");

// Add Y axis
let y = d3.scaleLinear()
    .domain([276165, 609034])
    .range([ height - margin.bottom, margin.top ]);

svg.append("g")
    .call(d3.axisLeft(y))
    .attr("opacity", ".0");


// Prepare a color palette
let color = d3.scaleLinear()
    .domain([0, 1]) // Points per square pixel.
    .range(["white", "#FF6600"])

// compute the density data
let densityData = d3.contourDensity()
    .x(function(d) { return x(d.x); })
    .y(function(d) { return y(d.y); })
    .size([width, height])
    .bandwidth(20)
    (data)
    
// show the shape!
svg.insert("g", "g")
    .selectAll("path")
    .data(densityData)
    .enter().append("path")
    .attr("d", d3.geoPath())
    .attr("fill", function(d) { return color(d.value); })
})

