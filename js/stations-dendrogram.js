import { create_barplot } from "./hopcount-barplot.js";

// set the dimensions and margins of the graph
const width = 680
const height = 680
const radius = width / 2 // radius of the dendrogram
let text_labels = false;
let selected_station = null;
let highlighted_stations = [];
let station_names = [];

d3.csv("data/station_features/station_service_disruption_delays_cancel_counts_with_names.csv").then(function(dataset) 
{   

for (let i = 0; i < dataset.length; i++)
{
    station_names.push(dataset[i]['Station Name']);
}

function searchStation(inputText, id_search, id_suggestion_box) {
    let suggestions = station_names.filter(stationName => 
        stationName.toLowerCase().startsWith(inputText.toLowerCase())
    );

    displaySuggestions(suggestions, id_search, id_suggestion_box);
}

function selectStation(name, id_search, id_suggestion_box) {
    console.log(name);
    
    if (id_search === 'dendro-station-search'){
        let searchValue = name.toUpperCase();

        console.log(searchValue);

        //put in a value all the rows that have station name = searchValue
        if (dataset.filter(d => d['Station Name'].toUpperCase() === searchValue).length === 0 ){
        }

        else{
            let searchCode = dataset.filter(d => d['Station Name'].toUpperCase() === searchValue)[0]['Station Code'];
            create_dendro(searchCode);
            create_barplot(searchCode);
        }
    }

    if (id_search === 'dendro-station-highlight-search'){
        let highlght_value = name.toUpperCase();
        console.log(highlght_value);

        //put in a value all the rows that have station name = searchValue
        if (dataset.filter(d => d['Station Name'].toUpperCase() === highlght_value).length === 0 ){
        }

        else{
            let highlght_code = dataset.filter(d => d['Station Name'].toUpperCase() === highlght_value)[0]['Station Code'];
            highlighted_stations.push(highlght_code);
            svg.select("#dendro-node-" + highlght_code)
                .attr("r", 5)
                .style("fill", "darkred")
                .attr("stroke", "darkred")
        }
    }


    d3.select("#" + id_suggestion_box).selectAll("div").remove();
    d3.select("#" + id_search).property("value", '');
}

function displaySuggestions(suggestions, id_search, id_suggestion_box) {
    d3.select("#" + id_suggestion_box).selectAll("div").remove();
    // Bind the suggestions to div elements
    let suggestionDivs = d3.select("#"+ id_suggestion_box)
        .selectAll("div")
        .data(suggestions);

    // Enter selection: Create new divs for new data
    suggestionDivs.enter()
        .append("div")
        .text(d => d)
        .on("click", function() {
            // Using datum() to retrieve the bound data
            let selectedStation = d3.select(this).datum();
            selectStation(selectedStation, id_search, id_suggestion_box);
        });

    // Exit selection: Remove divs for data that no longer exists
    suggestionDivs.exit().remove();
}

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
        // remove the nodes that are not part of the current tree
        svg.selectAll("circle")
            .filter(function(d) {
                // returns true if d.id contains scatter-label-
                return this.id.includes('dendro-node-');
            })
            .remove();
            
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
            .attr("opacity", 1)
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
                        //   .transition()
                        //   .duration(250)
                        .style("opacity", 0.1)
                        .filter(function(d) {
                            return d.data.name !== station_code && !highlighted_stations.includes(d.data.name);
                        })
                        .attr("r", 3);
                    
                    d3.select("#dendro-node-" + d.data.name)
                        //   .transition()
                        //   .duration(250)
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
                        //   .transition()
                        //   .duration(250)
                        .attr("opacity", 1)
                        .attr("font-size", "14px")
                        .attr("font-weight",700);

                    d3.selectAll("path")
                        .filter(function(d) {
                            // returns true if d.id contains scatter-label-
                            return this.id.includes('link-');
                        })
                        //   .transition()
                        //   .duration(250)
                        .style("opacity", 0.1);
                    
                    // select the parent node
                    let parent = d.parent;
                    let child = d;
                    while (child != null)
                    {
                        d3.select("#dendro-node-" + child.data.name)
                            //   .transition()
                            //   .duration(250)
                            .style("opacity", 1.0)
                            .attr("r", 5);
                        if (parent != null)
                        {
                            d3.select("#link-" + parent.data.name + "-" + child.data.name)
                                // .transition()
                                // .duration(250)
                                .style("opacity", 1);
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
                            })
                            .raise();
                        
                        d3.select("#dendro-label-" + child.data.name)
                            //   .transition()
                            //   .duration(250)
                            .attr("opacity", 1)
                            .attr("font-size", "12px")
                            .attr("font-weight",700);

                        
                        child = parent;
                        if (parent != null){
                            parent = parent.parent;
                        }
                    }

                })
                .on("mouseout", function(event, d) {
                    d3.selectAll("circle")
                        .filter(function(d) {
                            // returns true if d.id contains scatter-label-
                            return this.id.includes('dendro-node-');
                        })
                        .style("opacity", 1)
                        //   .transition()
                        //   .duration(250)
                        .filter(function(d) {
                            return d.data.name !== station_code && !highlighted_stations.includes(d.data.name);
                        })
                        .attr("r", 3);

                    d3.selectAll("path")
                        .filter(function(d) {
                            // returns true if d.id contains scatter-label-
                            return this.id.includes('link-');
                        })
                        //   .transition()
                        //   .duration(250)
                        .style("opacity", 1);
                    
                    // remove the text label
                    d3.selectAll("text")
                        .filter(function(d) {
                            // returns true if d.id contains scatter-label-
                            return this.id.includes('dendro-label-');
                        })
                        //   .transition()
                        //   .duration(250)
                        .attr("opacity", 0)
                        .remove();
                })
                .transition()
                .duration(1000)
                .style("fill", function(d)
                {
                    if (d.data.name === station_code) { return "darkgreen"; };
                    if (highlighted_stations.includes(d.data.name)) { return "darkred"; }
                    return "#f7c82d";
                })
                .attr("stroke", function(d)
                {
                    if (d.data.name === station_code) { return "darkgreen"; };
                    if (highlighted_stations.includes(d.data.name)) { return "darkred"; }
                    return "#003082";
                })
                .attr("id", function(d) { return "dendro-node-" + d.data.name; })
                .attr("r", function(d) 
                {
                    if (d.data.name === station_code) { return 5; };
                    if (highlighted_stations.includes(d.data.name)) { return 5; }
                    return 3;
                });
        
        
        // remove the previous labels
        svg.selectAll("text").remove();
        text_labels = false;
        
        
    });
}

d3.select('#dendro-station-search').on('input', function() {
    let inputText = this.value;
    if (inputText === "") {
        d3.select("#suggestion-box-root").selectAll("div").remove();
    } else {
        searchStation(inputText, 'dendro-station-search', 'suggestion-box-root');
    }

});

d3.select('#dendro-station-search').on('keydown', function(e) {
    if (e.key === 'Enter')
    {
        let searchValue = this.value.toUpperCase();
        //remove the value from the dendro-station-search
        d3.select("#dendro-station-search").property("value", '');
        //remove the suggestions
        d3.select("#suggestion-box-root").selectAll("div").remove();

        console.log(searchValue);

        //put in a value all the rows that have station name = searchValue
        if (dataset.filter(d => d['Station Name'].toUpperCase() === searchValue).length === 0 ){
        }

        else{
            let searchCode = dataset.filter(d => d['Station Name'].toUpperCase() === searchValue)[0]['Station Code'];
            create_dendro(searchCode);
            create_barplot(searchCode);
        }
    }
});

d3.select('#dendro-station-highlight-search').on('input', function() {
    let inputText = this.value;
    if (inputText === "") {
        d3.select("#suggestion-box-highlight").selectAll("div").remove();
    } else {
        searchStation(inputText, 'dendro-station-highlight-search', 'suggestion-box-highlight');
    }

});

d3.select('#dendro-station-highlight-search').on('keydown', function(e)
{
    if (e.key === 'Enter')
    {
        let highlght_value = this.value.toUpperCase();
        //remove the value from the dendro-station-highlight-search
        d3.select("#dendro-station-highlight-search").property("value", '');
        //remove the suggestions
        d3.select("#suggestion-box-highlight").selectAll("div").remove();

        console.log(highlght_value);

        //put in a value all the rows that have station name = searchValue
        if (dataset.filter(d => d['Station Name'].toUpperCase() === highlght_value).length === 0 ){
        }

        else{
            let highlght_code = dataset.filter(d => d['Station Name'].toUpperCase() === highlght_value)[0]['Station Code'];
            highlighted_stations.push(highlght_code);
            svg.select("#dendro-node-" + highlght_code)
                .attr("r", 5)
                .style("fill", "darkred")
                .attr("stroke", "darkred")
        }

    }
});

d3.select("#dendro-highlighting-clear-button").on("click", function() {
    highlighted_stations = [];

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

});