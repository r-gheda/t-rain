// let x_domain_bottom = 30000;
// let x_domain_top = 28000;
// let y_domain_bottom = 30000;
// let y_domain_top = 61000;

// let x_domain_bottom = 30430;
// let x_domain_top = 276075;
// let y_domain_bottom = 309171;
// let y_domain_top = 609023;
let k = 25000
let x_domain_bottom = 30429 - k;
let x_domain_top = 309128 + k;
let y_domain_bottom = 275165 - k;
let y_domain_top = 609034 ;

// set the dimensions and margins of the graph
// const margin = {top: 10, right: 30, bottom: 30, left: 40},
//   width = 1800 - margin.left - margin.right,
//   height = 1000 - margin.top - margin.bottom;

let margin = {top: 0, right: 0, bottom: 0, left: 0},
  width = 450,  
//width = 550 - margin.left - margin.right,
  height = (width * (y_domain_top - y_domain_bottom) / (x_domain_top - x_domain_bottom)) - margin.top - margin.bottom;

function normalize_coordinates_x(x)
{
    return width * (x - x_domain_bottom) / (x_domain_top - x_domain_bottom);
}

function normalize_coordinates_y(y)
{
    return height - (height * (y - y_domain_bottom) / (y_domain_top - y_domain_bottom));
}

function normalize_coordinates(x, y, name_var)
{
    return { x: normalize_coordinates_x(x), y: normalize_coordinates_y(y), name: name_var };
}




// append the svg object to the body of the page
const svg = d3.select("#train_network")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        `translate(${margin.left}, ${margin.top})`);

d3.json("data/network.json").then( function( data) {

  // Normalize coordinates for each node
  data.nodes.forEach(function (node) {
    const normalizedCoords = normalize_coordinates(node.x, node.y, node.name);
    node.x = normalizedCoords.x;
    node.y = normalizedCoords.y;
  });

  // Initialize the links
  const link = svg
    .selectAll("line")
    .data(data.links)
    .join("line")
      .attr("stroke-width", 0.2)
      .style("stroke", "#003082")

  // Initialize the nodes
  const node = svg
    .selectAll("circle")
    .data(data.nodes)
    .join("circle")
    .attr("r", 2)
    .style("fill", "#f7c82d")
    .style("stroke", "#003082") 
    .style("stroke-width", 1)
    .attr("class", "node")

  // Initialize the labels for nodes
  const nodeName = svg
    .selectAll("text")
    .data(data.nodes)
    .join("text")
    .text(d => d.name_long)  // Use the 'name_long' property from the JSON for the label
    .attr("dy", "0.35em")
    .style("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .style("fill", "#003082")
    .style("visibility", "hidden")
    .attr("class", "node-label");  // Add a class to make the labels initially invisible

  // Let's list the force we wanna apply on the network
  const simulation = d3.forceSimulation(data.nodes)                 // Force algorithm is applied to data.nodes
      .force("link", d3.forceLink()                               // This force provides links between nodes
            .id(function(d) { return d.id; })                     // This provide  the id of a node
            .links(data.links)                                   // and this the list of links
            
      )
      .force("charge", d3.forceManyBody().strength(-0.2))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
      .force("center", d3.forceCenter(width / 2, height / 2))     // This force attracts nodes to the center of the svg area
      .on("end", ticked);

  // This function is run at each iteration of the force algorithm, updating the nodes position.
  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
         .attr("cx", function (d) { return d.x+0; })
         .attr("cy", function(d) { return d.y-0; })
         .style("opacity", 1);
  // Update the position of node names
    nodeName
         .attr("transform", d => `translate(${d.x},${d.y + 20})`);
  }

  node.on("mouseover", function(event, hoveredNode) {
    node.style("opacity", function(d) {
      return areNodesConnected(hoveredNode, d) ? 1 : 0.2;
    })

    link.style("opacity", function(d){
      return d.source === hoveredNode || d.target === hoveredNode ? 1 : 0.2;
    })


    svg.selectAll(".node-label")
      .filter(label => label === hoveredNode)
      .style("visibility", "visible");

    svg.selectAll(".node")
      .filter(label => label === hoveredNode)
      .style("r", 5)
      .style("opacity", 1);
  })


  .on("mouseout", function(event, d){
    svg.selectAll(".node-label")
      .filter(label => label === d)
      .style("visibility", "hidden");
    
    svg.selectAll(".node")
      .filter(label => label === d)
      .style("r", 2)

    node.style("opacity", 1);
    link.style("opacity", 1);
  });


  function areNodesConnected(node1, node2) {
    return data.links.some(link => (link.source === node1 && link.target=== node2) || (link.source === node2 && link.target === node1));
  }

});


