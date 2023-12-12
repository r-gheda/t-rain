
let k = 25000
let x_domain_bottom = 30429 - k;
let x_domain_top = 309128 + k;
let y_domain_bottom = 275165 - k;
let y_domain_top = 609034 ;

// set the dimensions and margins of the graph


let container = d3.select("#network-slide")
let margin = {top: -100, right: 0, bottom: 0, left: 0},
  width = 0.5*container.node().getBoundingClientRect().width, 
  height = 0.9*container.node().getBoundingClientRect().height;
  // height = (width * (y_domain_top - y_domain_bottom) / (x_domain_top - x_domain_bottom)) - margin.top - margin.bottom;

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

  const maxInUit2018 = d3.max(data.nodes, d => d.InUit2018);
  const radiusScale = d3.scaleLinear()
  .domain([0, maxInUit2018])
  .range([5, 30]);

  const opacityScale = d3.scaleLinear()
  .domain([0, maxInUit2018])
  .range([0.2, 0.9]);

  
  const nodeCircle = svg
    .selectAll(".node-circle")
    .data(data.nodes)
    .join("circle")
    .attr("r", d => radiusScale(d.InUit2018))
    .style("fill", "#FFC917")
    .style("opacity", 0.4)
    .style("stroke", "none")
    .attr("class", "node-circle")
    .style('mix-blend-mode', 'multiply')
    .attr("class", "node-circle");

// Append links next
const link = svg
    .selectAll("line")
    .data(data.links)
    .join("line")
    .attr("stroke-width", 0.2)
    .style("stroke", "#003082");

// Append nodes last
const node = svg
    .selectAll(".node")
    .data(data.nodes)
    .join("circle")
    .attr("r", 2)
    .style("fill", d => (d.InUit2018 !== undefined) ? "#003082" : "#D0D0D0")
    .style("stroke", d => (d.InUit2018 !== undefined) ? "#003082" : "#838383")
    .style("stroke-width", 1)
    .attr("class", "node");

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

  const nodeValue = svg
    .selectAll(".node-value")
    .data(data.nodes)
    .join("text")
    .text(d => (d.InUit2018 !== undefined) ? `${d.InUit2018} daily passengers` : "No NS data available for this station")
    .attr("dy", "0.35em")
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", d => (d.InUit2018 !== undefined) ? "bold" : "")
    .style("fill", d => (d.InUit2018 !== undefined) ? "#003082" : "#838383")
    .style("visibility", "hidden")
    .attr("class", "node-value");  // Add a class to make the labels initially invisible




  // Let's list the force we wanna apply on the network
  const simulation = d3.forceSimulation(data.nodes)                 // Force algorithm is applied to data.nodes
      .force("link", d3.forceLink()                               // This force provides links between nodes
            .id(function(d) { return d.id; })                     // This provide  the id of a node
            .links(data.links)
            .distance(10)                                   // and this the list of links
            
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

    nodeCircle
         .attr("cx", function (d) { return d.x+0; })
         .attr("cy", function(d) { return d.y-0; })
         .style("opacity", 0.4)


         nodeName
         .attr("transform", d => `translate(${d.x},${d.y + 20})`);
    
    nodeValue
         .attr("transform", d => `translate(${d.x},${d.y + 37})`);    
  }

  function handleNodeMouseOver (event, hoveredNode) {
    const selectedNode = d3.select(this);

    selectedNode.style("opacity", 1);

    node.style("opacity", function(d) {
      return areNodesConnected(hoveredNode, d) ? 1 : 0.2;
    })

    link.style("opacity", function(d){
      return d.source === hoveredNode || d.target === hoveredNode ? 1 : 0.2;
    })
    
    nodeCircle.style("opacity", 0.1);

    nodeCircle.style("opacity",function(d){
      return d.id === hoveredNode.id ? 0.7 : 0.1;
    })



    svg.selectAll(".node-label")
      .filter(label => label === hoveredNode)
      .style("visibility", "visible");
    
    svg.selectAll(".node-value")
      .filter(label => label === hoveredNode)
      .style("visibility", "visible");

    svg.selectAll(".node")
      .filter(label => label === hoveredNode)
      .style("r", 5)
      .style("opacity", 1);

    var selectedNodeId = hoveredNode.id;
    document.dispatchEvent(new CustomEvent('nodeMouseOver', { detail: selectedNodeId }));

  }

  node.on("mouseover", function(event, hoveredNode) {
    handleNodeMouseOver(event, hoveredNode)
  })

  function handleNodeMouseOut (event, d) {
    svg.selectAll(".node-label")
      //.filter(label => label === d)
      .style("visibility", "hidden");
    
    svg.selectAll(".node-value")
      //.filter(label => label === d)
      .style("visibility", "hidden");
    
    svg.selectAll(".node")
      //.filter(label => label === d)
      .style("r", 2)

  node.style("opacity", 1);
  link.style("opacity", 1);
  nodeCircle.style("opacity", 0.4)

  document.dispatchEvent(new CustomEvent('nodeMouseOut'));

  }

  node.on("mouseout", function (event, d) {
    handleNodeMouseOut(event, d)
  });


  function areNodesConnected(node1, node2) {
    return data.links.some(link => (link.source === node1 && link.target=== node2) || (link.source === node2 && link.target === node1));
  }

  document.addEventListener('barMouseOver', function (event) {
    const stationName = event.detail.stationName;
    
    const correspondingNode = data.nodes.find(node => node.name_long === stationName);

    //svg.selectAll(".node-value")
      //.filter(d => d === correspondingNode)
      //.text(event.detail.passengers + " daily passengers");

    //console.log(event.detail.passengers)
  
    if (correspondingNode) {
      handleNodeMouseOver(event, correspondingNode);
    }
  })

  document.addEventListener('barMouseOut', function (event, d) {
      handleNodeMouseOut(event, d);

  })

});
