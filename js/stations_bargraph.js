
const marginPercentage = { top: 0.03, right: 0.06, bottom: 0.07, left: 0.04 };
const container = d3.select("#network-slide");
const containerWidth = container.node().getBoundingClientRect().width;
const containerHeight = container.node().getBoundingClientRect().height;

const margin_bar = {
    top: containerHeight * marginPercentage.top,
    right: containerWidth * marginPercentage.right,
    bottom: containerHeight * marginPercentage.bottom,
    left: containerWidth * marginPercentage.left
};

// Calculate the width and height of the plot area
const width_bar = 0.5*containerWidth - margin_bar.left - margin_bar.right;
const height_bar = 0.4*containerHeight - margin_bar.top - margin_bar.bottom;


// set the dimensions and margins of the graph
// const margin_bar = { top: 10, right: 0, bottom: 35, left: 70 },
//   width_bar = 700 - margin_bar.left - margin_bar.right,
//   height_bar = 400 - margin_bar.top - margin_bar.bottom;

// append the svg object to the body of the page
const svg = d3
  .select("#stations_bargraph")
  .append("svg")
  .attr("width", width_bar + margin_bar.left + margin_bar.right)
  .attr("height", height_bar + margin_bar.top + margin_bar.bottom);

var g = svg
  .append("g")
  .attr("transform", "translate(" + margin_bar.left + "," + margin_bar.top + ")");

var xScale = d3.scaleBand().range([0, width_bar]).padding(0.1),
  yScale = d3.scaleLinear().range([height_bar, 0]);

d3.csv("data/Station_passengers2018_top50_5.csv").then(function (data_bar) {
  d3.json("data/network.json").then( function( data_net){


  xScale.domain(data_bar.map(function (d) { return d.code; }));
//  yScale.domain(d3.extent(data_bar, function (d) { return d.InUit2018; }));


  yScale.domain([0,194385]);

  g.append("g")
    .attr("transform", "translate(0," + height_bar + ")")
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-45)");

  g.append("g")
    .call(
      d3
        .axisLeft(yScale)
        .tickFormat(function (d) {
          return d;
        })
        .ticks(10)
        .tickSizeOuter(1)
    )
    .append("text")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("value")


  g.selectAll(".bar")
    .data(data_bar)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function (d) { return xScale(d.code); })
    .attr("y", function (d) { return yScale(d.InUit2018); })
    .attr("width", xScale.bandwidth())
    .attr("height", function (d) { return height_bar - yScale(d.InUit2018); })
    .attr("fill", "#003082")
    //.on("mouseover", BarMouseOver)
    .on("mouseout", BarMouseOut);
  
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin_bar.left)
    .attr("x", 0 - height_bar / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "#003082")
    .text("Daily passengers");
  
  svg.append("text")
    .attr("x", (width_bar + margin_bar.left + margin_bar.right) / 2)
    .attr("y",  margin_bar.top +5)  // Adjust the y-coordinate based on your design
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("fill", "#003082")
    .text("Busiest Stations in the Netherlands in 2018");
    

//create invisible bars that are the full height of the graph for easier selection
  g.selectAll(".bar-overlay")
    .data(data_bar)
    .enter()
    .append("rect")
    .attr("class", "bar-overlay")
    .attr("x", function (d) { return xScale(d.code); })
    .attr("y", 0)
    .attr("width", xScale.bandwidth())
    .attr("height", height_bar)
    .style("opacity", 0)  // Make the overlay rectangle invisible
    .on("mouseover", BarMouseOver)
    .on("mouseout", BarMouseOut);


    

  function BarMouseOver(event, d, element) {
    var correspondingBar = g.select(".bar:nth-child(" + (data_bar.indexOf(d) + 3) + ")");
    correspondingBar.attr("fill", "#f7c82d");

    //d3.select(this).attr("fill", "#f7c82d");
    
    var stationName = d.Station;
    var correspondingNode = data_net.nodes.find(node => node.name_long === stationName);
    var passengers = d.InUit2018;


    var eventDetails = {
      stationName: stationName,
      passengers: passengers

    }
    
    document.dispatchEvent(new CustomEvent('barMouseOver', { detail: eventDetails }));

    }
  
  function BarMouseOut(event, i) {
    g.selectAll(".bar").attr("fill", "#003082");
    document.dispatchEvent(new CustomEvent('barMouseOut'));



    }

    
    function BarMouseOverByNodeID(nodeID) {
  // Use xScale to find the corresponding x-coordinate for the nodeID
  var xCoordinate = xScale(nodeID);

  // Select the corresponding bar using the x-coordinate
  var correspondingBar = g.select(".bar").filter(function (d) {
    return xScale(d.code) === xCoordinate;
  });

  correspondingBar.attr("fill", "#f7c82d");
    }
    
  document.addEventListener('nodeMouseOver', function (event) {
      const nodeID = event.detail;
      BarMouseOverByNodeID(nodeID);
    });

  document.addEventListener('nodeMouseOut', function (event) {
    g.selectAll(".bar").attr("fill", "#003082");
    });

  })
  }

);