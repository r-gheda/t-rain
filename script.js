document.addEventListener('DOMContentLoaded', function() {

    /* PROVA BAR CHART*/
    // Sample data
    const data = [4, 8, 15, 16, 23, 42];

    // Create SVG element
    const svg = d3.select("#chart").append("svg")
        .attr("width", 500)
        .attr("height", 150);

    // Create bars
    svg.selectAll("rect")
        .data(data)
        .enter().append("rect")
        .attr("x", (d, i) => i * 30)
        .attr("y", d => 150 - d * 10)
        .attr("width", 25)
        .attr("height", d => d * 10)
        .attr("fill", "teal");
    
    /*FINE PROVA BAR CHART*/ 
    
    /* PROVA LINE CHART*/

    // Simulated data for the line chart
    const lineData = [];
    for (let year = 1950; year <= 2020; year += 10) {
        lineData.push({
            year: year,
            value: Math.random() * 100 // Random value for demonstration
        });
    }

    // Set the dimensions of the canvas / graph
    const margin = {top: 30, right: 20, bottom: 30, left: 50},
        width = 600 - margin.left - margin.right,
        height = 270 - margin.top - margin.bottom;

    // Set the ranges
    const x = d3.scaleLinear().domain([1950, 2020]).range([0, width]);
    const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

    // Define the line
    const valueline = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.value));
    
    // Adds the svg canvas
    const svg2 = d3.select("#chart2")
        .append("svg")
            .attr("width", width + margin.left + margin.right + 100)
            .attr("height", height + margin.top + margin.bottom + 100)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    // Add the valueline path.
    svg2.append("path")
        .data([lineData])
        .attr("class", "line")
        .attr("d", valueline);
    
    // Add the X Axis
    svg2.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
    
    // Add the Y Axis
    svg2.append("g")
        .call(d3.axisLeft(y));
    
    // Add the scatterplot
    svg2.selectAll("dot")
        .data(lineData)
        .enter().append("circle")
        .attr("r", 5)
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.value))
        .attr("fill", "teal");
    
    // Add the text label for the X axis
    svg2.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Year");
    
    // Add the text label for the Y axis
    svg2.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left )
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Value");
    
    // Add the title
    svg2.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2) + 10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Line Chart");
    
    // Add the legend
    svg2.append("circle").attr("cx", 500).attr("cy", 0).attr("r", 6).style("fill", "teal");
    svg2.append("text").attr("x", 520).attr("y", 0).text("Value").style("font-size", "15px").attr("alignment-baseline","middle");

    /*FINE PROVA LINE CHART */

});
