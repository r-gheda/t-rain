// set the dimensions and margins of the graph
const margin = { top: 0, right: 0, bottom: 85, left: 50 },
  width = 700 - margin.left - margin.right,
  height = 200 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3
  .select("#stations_bargraph")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

var g = svg
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var xScale = d3.scaleBand().range([0, width]).padding(0.1),
  yScale = d3.scaleLinear().range([height, 0]);

d3.csv("data/station_passengers2018_top50.csv").then(function (data) {
  xScale.domain(data.map(function (d) { return d.Station; }));
//  yScale.domain(d3.extent(data, function (d) { return d.InUit2018; }));
  yScale.domain([0,194385]);

  g.append("g")
    .attr("transform", "translate(0," + height + ")")
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
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function (d) { return xScale(d.Station); })
    .attr("y", function (d) { return yScale(d.InUit2018); })
    .attr("width", xScale.bandwidth())
    .attr("height", function (d) { return height - yScale(d.InUit2018); })
    .attr("fill", "#003082");
});