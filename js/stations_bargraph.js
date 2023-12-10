// set the dimensions and margins of the graph
const margin_bar = { top: 0, right: 0, bottom: 35, left: 50 },
  width_bar = 700 - margin_bar.left - margin_bar.right,
  height_bar = 100 - margin_bar.top - margin_bar.bottom;

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

d3.csv("data/station_passengers2018_top50_3.csv").then(function (data_bar) {
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
        .ticks(5)
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
    console.log(correspondingNode.id);
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
  })
  

    }

);