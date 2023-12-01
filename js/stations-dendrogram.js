import { create_barplot } from "./hopcount-barplot.js";

// set the dimensions and margins of the graph
const width = 680
const height = 680
const radius = width / 2 // radius of the dendrogram
let text_labels = false;
let selected_station = null;

// append the svg object to the body of the page
const svg = d3.select("#stations-dendrogram")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", "dendrogram-svg")
    .append("g")
    .attr("transform", `translate(${radius},${radius})`);

// read json data
function create_dendro(station_code)
{
    d3.json("data/trees/" + station_code + ".json").then( function(data) {
        selected_station = station_code;
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
            .transition()
            .duration(1000)
            .attr("d", linksGenerator)
            .style("fill", 'none')
            .attr("stroke", '#003082')
            .attr("id", function(d) { return "link-" + d.source.data.name + "-" + d.target.data.name; });
            
            
            // Add a circle for each node.
            svg.selectAll("g")
            .data(root.descendants())
            .join("g")
            .attr("transform", function(d) {
                return `rotate(${d.x-90})
                translate(${d.y})`;
            })
            .append("circle")
                .style("stroke-width", 2)
                .on("mouseover", function(event, d) {
                    d3.selectAll("circle")
                        .filter(function(d) {
                            // returns true if d.id contains scatter-label-
                            return this.id.includes('dendro-node-');
                        })
                        .transition()
                        .duration(250)
                        .style("opacity", 0.2)
                        .attr("r", 3);
        
                    d3.select("#dendro-node-" + d.data.name)
                        .transition()
                        .duration(250)
                        .style("opacity", 1)
                        .attr("r", 5);
                    
                    // create a text label for the station
                    svg.append("text")
                        .text(d.data.name)
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr("text-anchor", "middle")
                        .attr("font-size", "12px")
                        .attr("id", "dendro-label-" + d.data.name)
                        .attr("opacity", 0)
                        .style("fill", "#003082")
                        .attr("transform", function() { 
                            // rotate labels to be horizontal                            
                            return "rotate(" + (d.x-90) + ") translate(" + d.y + ") rotate(" + (90 + (-d.x)) + ") translate(0, 25)";
                        });

                    d3.select("#dendro-label-" + d.data.name)
                        .transition()
                        .duration(250)
                        .attr("opacity", 1)
                        .attr("font-size", "14px")
                        .attr("font-weight",700);

                    d3.selectAll("path")
                        .filter(function(d) {
                            // returns true if d.id contains scatter-label-
                            return this.id.includes('link-');
                        })
                        .transition()
                        .duration(250)
                        .style("opacity", 0.2);
                    
                    // select the parent node
                    let parent = d.parent;
                    let child = d;
                    while (parent != null)
                    {
                        d3.select("#dendro-node-" + parent.data.name)
                            .transition()
                            .duration(250)
                            .style("opacity", 1.0)
                            .attr("r", 5);

                        d3.select("#link-" + parent.data.name + "-" + child.data.name)
                            .transition()
                            .duration(250)
                            .style("opacity", 1);

                        svg.append("text")
                            .text(child.data.name)
                            .attr("x", 0)
                            .attr("y", 0)
                            .attr("text-anchor", "middle")
                            .attr("font-size", "12px")
                            .attr("id", "dendro-label-" + child.data.name)
                            .attr("opacity", 0)
                            .style("fill", "#003082")
                            .attr("transform", function() { 
                                // rotate labels to be horizontal                            
                                return "rotate(" + (child.x-90) + ") translate(" + child.y + ") rotate(" + (90 + (-child.x)) + ") translate(0, 25)";
                            })
                            .raise();
                        
                        d3.select("#dendro-label-" + child.data.name)
                            .transition()
                            .duration(250)
                            .attr("opacity", 1)
                            .attr("font-size", "12px")
                            .attr("font-weight",700);
                        
                        child = parent;
                        parent = parent.parent;
                    }


                    svg.append("text")
                        .text(child.data.name)
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr("text-anchor", "middle")
                        .attr("font-size", "12px")
                        .attr("id", "dendro-label-" + child.data.name)
                        .attr("opacity", 0)
                        .style("fill", "#003082")
                        .attr("transform", function() { 
                            // rotate labels to be horizontal                            
                            return "rotate(" + (child.x-90) + ") translate(" + child.y + ") rotate(" + (90 + (-child.x)) + ") translate(0, 25)";
                        });
                
                    d3.select("#dendro-label-" + child.data.name)
                        .transition()
                        .duration(250)
                        .attr("opacity", 1)
                        .attr("font-size", "12px")
                        .attr("font-weight",700);

                })
                .on("mouseout", function(event, d) {
                    d3.selectAll("circle")
                        .filter(function(d) {
                            // returns true if d.id contains scatter-label-
                            return this.id.includes('dendro-node-');
                        })
                        .style("opacity", 1)
                        .transition()
                        .duration(250)
                        .attr("r", 3);

                    d3.selectAll("path")
                        .filter(function(d) {
                            // returns true if d.id contains scatter-label-
                            return this.id.includes('link-');
                        })
                        .transition()
                        .duration(250)
                        .style("opacity", 1);
                    
                    // remove the text label
                    d3.selectAll("text")
                        .filter(function(d) {
                            // returns true if d.id contains scatter-label-
                            return this.id.includes('dendro-label-');
                        })
                        .transition()
                        .duration(250)
                        .attr("opacity", 0)
                        .remove();
                })
                .transition()
                .duration(1000)
                .style("fill", "#f7c82d")
                .attr("stroke", "#003082")
                .attr("id", function(d) { return "dendro-node-" + d.data.name; })
                .attr("r", 3);

        // Highlight the root node
        svg.select("#" + station_code)
            .attr("r", 5)
            .style("fill", "darkgreen")
            .attr("stroke", "darkgreen")
        
        // remove the previous labels
        svg.selectAll("text").remove();
        text_labels = false;

        // Add the labels
        // svg.selectAll("g")
        //     .data(root.descendants())
        //     .join("g")
        //     .attr("transform", function(d) {
        //         return `rotate(${d.x-90})
        //         translate(${d.y})`;
        //     })
        //     .append("text")
        //         .text(function(d) { return (d.data.name)})
        //         .attr("dy", "0.31em")
        //         .attr("x", function(d) { return d.x < 180 === !d.children ? 9 : -9; })
        //         .style("font-size", "12px")
        //         .style("fill", "003082")
        //         .style("opacity", 0)
        //         .attr("id", function(d) { console.log("dendro-label" + d.data.name); return ("dendro-label" + d.data.name); })
        //         .attr("text-anchor", function(d)  { return d.x < 180 === !d.children ? "start" : "end"; })
        //         .attr("transform", function(d) { 
        //             // rotate labels to be horizontal
        //             let angle = d.x / 180 * Math.PI;
        //             let rad = d.y;
        //             let y = rad * Math.cos(angle);
        //             let x = rad * Math.sin(angle);
                    
        //             return "rotate(" + (90 + (-angle * 180 / Math.PI)) + ")";
        //         })
            
    });
}

d3.select('#dendro-station-search').on('keydown', function(e) {
    if (e.key === 'Enter')
    {
        let searchValue = this.value.toUpperCase();
        create_dendro(searchValue);
        create_barplot(searchValue);
    }
});

d3.select('#dendro-station-highlight-search').on('keydown', function(e)
{
    if (e.key === 'Enter')
    {
        let searchValue = this.value.toUpperCase();
        svg.select("#dendro-node-" + searchValue)
            .attr("r", 5)
            .style("fill", "darkred")
            .attr("stroke", "darkred")
    }
});

d3.select("#dendro-highlighting-clear-button").on("click", function() {
    svg.selectAll("circle")
        .filter(function(d) {
            // returns true if d.id contains scatter-label-
            return this.id.includes('dendro-node-');
        })
        .attr("r", 3)
        .style("fill", "#f7c82d")
        .attr("stroke", "#003082")
        .style("stroke-width", 2);

});