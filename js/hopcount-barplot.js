
const marginPercentage = { top: 0.05, right: 0.06, bottom: 0.07, left: 0.04 };
const container = d3.select("#dendro-slide");
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
const height = 0.45*containerHeight - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#hopcount-barplot")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

export function create_barplot(station_id){
    d3.csv("data/barplot/" + station_id + ".csv").then( function(data) {

        // remove previous plot
        svg.selectAll("*").remove();


        // X axis
        const x = d3.scaleBand()
            .range([ 0, width ])
            .domain(Array.from({length: 35}, (_, i) => i + 1))
            .padding(0.2);

        svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // Add Y axis
        const y = d3.scaleLinear()
        .domain([0, 70])
        .range([ height, 0]);
        svg.append("g")
        .call(d3.axisLeft(y));

        // Bars
        svg.selectAll("mybar")
            .data(data)
            .join("rect")
                .attr("x", d => x(d.hopcount))
                .attr("y", d => y(d.size))
                .attr("width", x.bandwidth())
                .attr("height", d => height - y(d.size))
                .attr("fill", "#003082")
                .on("mouseover", function(event, d) 
                {
                    let stations = d.stations.split(" ");
                    
                    d3.selectAll("circle")
                        .filter(function(d) {
                            // returns true if d.id contains scatter-label-
                            return this.id.includes('dendro-node-');
                        })
                        // .transition()
                        // .duration(250)
                        .style("opacity", 0.1)
                        // .attr("r", 3);
                        
                    d3.selectAll("path")
                        .filter(function(d) {
                            // returns true if d.id contains scatter-label-
                            return this.id.includes('link-');
                        })
                        // .transition()
                        // .duration(250)
                        .style("opacity", 0.1);

                    for (let i = 0; i < stations.length-1; i++)
                    {
                        let station_name = stations[i];

                        // console.log(station_name);
            
                        d3.select("#dendro-node-" + station_name)
                            // .transition()
                            // .duration(300)
                            .style("opacity", 1)
                            // .attr("r", 3);

                        d3.select("#dendrogram-svg").append("text")
                            .text(station_name)
                            .attr("x", 0)
                            .attr("y", 0)
                            .attr("text-anchor", "middle")
                            .attr("font-size", "12px")
                            .attr("id", "dendro-label-" + station_name)
                            .attr("opacity", 0)
                            .style("fill", "#003082")
                            .attr("transform", function() { 
                                // rotate labels to be horizontal   
                                let d = d3.select("#dendro-node-" + station_name).datum();                         
                                return "translate(340, 340) rotate(" + (d.x-90) + ") translate(" + d.y + ") rotate(" + (90 + (-d.x)) + ") translate(0, 25)";
                            });
                        
                        d3.select("#dendro-label-" + station_name)
                                // .transition()
                                // .duration(250)
                                .attr("opacity", 1)
                                .attr("font-size", "12px")
                                .attr("font-weight",700);
                    }

                    d3.select(this).style("fill", "#f7c82d");
                })
                .on("mouseout", function(d) 
                {
                    d3.selectAll("circle")
                        .filter(function(d) {
                            // returns true if d.id contains scatter-label-
                            return this.id.includes('dendro-node-');
                        })
                        .style("opacity", 1)
                        // .transition()
                        // .duration(250);
                    
                    d3.selectAll("path")
                        .filter(function(d) {
                            // returns true if d.id contains scatter-label-
                            return this.id.includes('link-');
                        })
                        // .transition()
                        // .duration(250)
                        .style("opacity", 1);
                    
                    d3.selectAll("text")
                        .filter(function(d) {
                            // returns true if d.id contains scatter-label-
                            return this.id.includes('dendro-label-');
                        })
                        // .transition()
                        // .duration(250)
                        .attr("opacity", 0)
                        .remove();

                    d3.select(this).style("fill", "#003082");
                });

    })
}
