
// set the dimensions and margins of the graph
const width = 460
const height = 460
const radius = width / 2 // radius of the dendrogram

// append the svg object to the body of the page
const svg = d3.select("#stations-dendrogram")
  .append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", `translate(${radius},${radius})`);

// read json data
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_dendrogram.json").then( function(data) {

    // Create the cluster layout:
    const cluster = d3.cluster()
        .size([360, radius - 60]);  // 360 means whole circle. radius - 60 means 60 px of margin around dendrogram

    // Give the data to this cluster layout:
    const root = d3.hierarchy(data, function(d) {
        return d.children;
    });
    cluster(root);

    // Features of the links between nodes:
    const linksGenerator = d3.linkRadial()
        .angle(function(d) { return d.x / 180 * Math.PI; })
        .radius(function(d) { return d.y; });

    // Add the links between nodes:
    svg.selectAll('path')
        .data(root.links())
        .join('path')
        .attr("d", linksGenerator)
        .style("fill", 'none')
        .attr("stroke", '#003082')


    // Add a circle for each node.
    svg.selectAll("g")
        .data(root.descendants())
        .join("g")
        .attr("transform", function(d) {
            return `rotate(${d.x-90})
            translate(${d.y})`;
        })
        .append("circle")
            .attr("r", 7)
            .style("fill", "#f7c82d")
            .attr("stroke", "#003082")
            .style("stroke-width", 2)
    
    svg.selectAll("g")
        .data(root.descendants())
        .join("g")
        .attr("transform", function(d) {
            return `rotate(${d.x-90})
            translate(${d.y})`;
        })
        .append("text")
            .text(function(d) { return (d.data.name)})
            .attr("dy", "0.31em")
            .attr("x", function(d) { return d.x < 180 === !d.children ? 9 : -9; })
            .style("font-size", "12px")
            .style("fill", "#003082")
            .attr("text-anchor", function(d)  { return d.x < 180 === !d.children ? "start" : "end"; })
            .attr("transform", function(d) { 
                let angle = d.x / 180 * Math.PI;
                let rad = d.y;
                let y = rad * Math.cos(angle);
                let x = rad * Math.sin(angle);
                if (x === 0 && y === 0) {
                    return "rotate(" + -90 + ")";
                }
                return "rotate(" + (x < 0 ? 180 : 0) + ")";
            });

        
})