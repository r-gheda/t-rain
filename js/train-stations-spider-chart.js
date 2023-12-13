

let width  = 400;
let height = 400;
let margin = 150;
let selectedStations = [];
let station_names = [];
let station_color_mapping = {};
let compare_stations = [];


// Load the specific dataset
d3.csv("data/station_features/station_service_disruption_delays_cancel_counts_with_names.csv").then(function(dataset) 
{   
    //fill the station_names array with all the "Station Name"
    for (let i = 0; i < dataset.length; i++)
    {
        station_names.push(dataset[i]['Station Name']);
    }

    function searchStation(inputText) {
        let suggestions = station_names.filter(stationName => 
            stationName.toLowerCase().startsWith(inputText.toLowerCase())
        );
        displaySuggestions(suggestions);
    }

    function selectStation(name) {
        
        let searchValue = name.toUpperCase();

        //remove the text from the search bar
        d3.select('#stationSearch').property('value', '');


        //put in a value all the rows that have station name = searchValue
        if (dataset.filter(d => d['Station Name'].toUpperCase() === searchValue).length === 0 ){

        }
        else{
        let searchCode = dataset.filter(d => d['Station Name'].toUpperCase() === searchValue)[0]['Station Code'];
        
        if (!selectedStations.includes(searchCode)) {
            selectedStations.push(searchCode);
            
            updateChart();

            d3.selectAll('circle').filter(function(d) {
                // returns true if d.id contains station-
                return this.id.includes('scatter-node-') && !selectedStations.includes(d['Station Code']);
            }
            )
            .attr('opacity', 1.0)
            .lower();


            let label_id = '#scatter-label-' + searchCode;
            d3.select(label_id)
                .transition()
                .duration(300)
                .attr('opacity', 1.0)
                .attr('fill', '#003082')
                .attr('font-weight', 'bold')
                
            let node_id = '#scatter-node-' + searchCode;
            d3.select(node_id)
                .transition()
                .duration(290)
                .attr('opacity', 1.0)
                .style("fill", station_color_mapping[searchCode])
            
        }

    }


        d3.select("#suggestion-box").selectAll("div").remove();
    }
    
    function displaySuggestions(suggestions) {

        // Remove all existing suggestions
        d3.select("#suggestion-box").selectAll("div").remove();
        // Bind the suggestions to div elements
        let suggestionDivs = d3.select("#suggestion-box")
            .selectAll("div")
            .data(suggestions);
        
        // Enter selection: Create new divs for new data
        suggestionDivs.enter()
            .append("div")
            .text(d => d)
            .on("click", function() {
                // Using datum() to retrieve the bound data
                let selectedStation = d3.select(this).datum();
                selectStation(selectedStation);
            });
    
        // Exit selection: Remove divs for data that no longer exists
        suggestionDivs.exit().remove();
    }
    
    
    if (dataset.length === 0) return;
    // Select the first row of the dataset

    // Define the features to be used
    let features = ["Number of Services", "Disruption Count", "Delay Count", "Cancel Count"];

    let features_nosc = features.filter(f => f !== "Station Code" && f !== "Station Name");

        // Initialize objects to store the min and max values for each feature
        let featureMinMax = features_nosc.reduce((acc, feature) => {
            acc[feature] = {min: Number.MAX_VALUE, max: Number.MIN_VALUE};
            return acc;
        }, {});
    
        // Iterate through the dataset to find the min and max values for each feature
        dataset.forEach(function(row) {
            features.forEach(function(feature) {
                //ignore the station code
                if (feature === "Station Code" || feature === "Station Name") return;
                let value = parseFloat(row[feature]) || 0;
                featureMinMax[feature].min = Math.min(featureMinMax[feature].min, value);
                featureMinMax[feature].max = Math.max(featureMinMax[feature].max, value);
            });
        });
    
        // Normalize the data
        dataset = dataset.map(row => {
            let normalizedRow = {};
            normalizedRow["Station Code"] = row["Station Code"];
            normalizedRow["Station Name"] = row["Station Name"];
            features.forEach(feature => {
                //leave the station code as it is
                
                normalizedRow[feature] = (parseFloat(row[feature]) - featureMinMax[feature].min) / 
                                        (featureMinMax[feature].max - featureMinMax[feature].min);
            });
            return normalizedRow;
        });


    // Initialize variables to store the min and max values
    
    let maxValue = 1;

    let legendRectSize = 10; // Size of the legend color boxes

    // Select the first four rows of the dataset for the legend
   
    let svg = d3.select("#stations-spider-chart").append("svg")
        .attr("width", width)
        .attr("height", height);

    // Now minValue and maxValue hold the minimum and maximum values across all features

    // Adjust the radial scale domain based on the min and max values
    let radialScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([0, (width - margin) / 2]);

    let colors = ["darkorange", "blue", "red", "green", "purple", "lightblue", "pink", "brown"];
    
    // Calculate ticks based on the maxValue
    let numberOfTicks = 5; // for example, you can change this
    let tickStep = maxValue / numberOfTicks;
    let ticks = d3.range(0, maxValue + tickStep, tickStep); // Generate tick values

    svg.selectAll("circle")
    .data(ticks)
    .join(
        enter => enter.append("circle")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("fill", "none")
            .attr("stroke", "gray")
            .attr("r", d => radialScale(d))
    );

function angleToCoordinate(angle, value)
{
    let x = Math.cos(angle) * radialScale(value);
    let y = Math.sin(angle) * radialScale(value);
    return {"x": width / 2 + x, "y": height / 2 - y};
}



let featureData = features.map((f, i) => {
    let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
    let labelCoord = angleToCoordinate(angle, maxValue + 0.2); // A little bit further than maxValue

    // Adjust the x-coordinate of the label based on the angle
    // The adjustment factor (e.g., 5, 10, etc.) can be changed as needed
    let adjustmentFactor = 0; // Adjust this value as needed
    labelCoord.x -= adjustmentFactor;

    return {
        "name": f,
        "angle": angle,
        "line_coord": angleToCoordinate(angle, maxValue),
        "label_coord": labelCoord
    };
});

// draw axis line
svg.selectAll("line")
.data(featureData)
.join(
    enter => enter.append("line")
        .attr("x1", width / 2)
        .attr("y1", height / 2)
        .attr("x2", d => d.line_coord.x)
        .attr("y2", d => d.line_coord.y)
        .attr("stroke","#003082")
        );
        
        // draw axis label
        svg.selectAll(".axislabel")
        .data(featureData)
        .join(
            enter => enter.append("text")
            .attr("x", d => d.label_coord.x)
            .attr("y", d => d.label_coord.y)
            .text(d => d.name)
            .attr("font-size", "12px") // Adjust font size here
            .attr("fill", "#003082") // Optional: Set the font color
            .attr("text-anchor", "middle")
            .attr("transform", function (data, i) 
            {
                if (data.name == "Number of Services" || data.name == "Delay Count")
                {
                    return;
                }

                if (data.name == "Cancel Count")
                {
                    return "rotate(90 " + data.label_coord.x + "," + data.label_coord.y + ")";
                }

                if (data.name == "Disruption Count")
                {
                    return "rotate(270 " + data.label_coord.x + "," + data.label_coord.y + ")";
                }
            })
);    

let line = d3.line()
    .x(d => d.x)
    .y(d => d.y);

//initialize available_colors as a copy of colors
let available_colors = colors.slice();

//UPDATE CHART
function updateChart(){

    let filteredData = dataset.filter(d => selectedStations.includes(d['Station Code']));
    filteredData.forEach((d, i) => {
        if (!station_color_mapping[d['Station Code']]){
            station_color_mapping[d['Station Code']] = available_colors[i % colors.length];
            //remove the color from available_colors
            available_colors.splice(i % colors.length, 1);
        }
    });

    // Update the path (chart)
    let paths = svg.selectAll("path")
        .data(filteredData);

    paths.enter()
        .append("path")
        .merge(paths)
        .transition()
        .duration(1000) // Transition duration
        .attr("d", d => getPathCoordinates(d))
        .attr("stroke-width", 3)
        .attr("stroke", d => station_color_mapping[d['Station Code']])
        .attr("fill", d => station_color_mapping[d['Station Code']])
        .attr("stroke-opacity", 1)
        .attr('opacity', 0.4)
        .attr('id', d => 'spider-path-' + d['Station Code'] );

    paths.exit().remove();

    //let legendData = [dataPoint];
    let legend = svg.selectAll('.legend').data(filteredData);

    let legendEnter = legend.enter().append('g').attr('class', 'legend');

    legendEnter.merge(legend)
        .attr('transform', (_, i) => 'translate(50,' + (30 + i * 15) + ')');

    legendEnter.append('rect')
        .merge(legend.select('rect'))
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', d => station_color_mapping[d['Station Code']])
        .style('stroke', d => station_color_mapping[d['Station Code']])
        .attr('id', d => 'spider-legend-' + d['Station Code'])
        .on('mouseover', function(event, i)
        {
            d3.selectAll('path')
                .filter(function(d) {
                    // returns true if d.id contains spider-path-
                    return this.id.includes('spider-path-');
                })
                .transition()
                .duration(250)
                .attr('opacity', 0);
            
            let path_id = '#spider-path-' + i['Station Code'];

            d3.select(path_id)
                .transition()
                .duration(300)
                .attr('opacity', 0.7);

            path_id = "#scatter-node-"  + i['Station Code'];

            d3.select(path_id)
                .transition()
                .duration(300)
                .attr('r', 8);

            path_id = "#scatter-label-"  + i['Station Code'];

            d3.select(path_id)
                .transition()
                .duration(300)
                .attr('opacity', 1.0)
                .attr('fill', '#003082')
                .style('font-size', '15px')
                .attr('font-weight', 'bold');
        })
        .on('mouseout', function(_, i)
        {
            d3.selectAll('path')
                .filter(function(d) {
                    // returns true if d.id contains spider-path-
                    return this.id.includes('spider-path-');
                })
                .transition()
                .duration(300)
                .attr('opacity', 0.4);

            let path_id = "#scatter-node-"  + i['Station Code'];

            d3.select(path_id)
                .transition()
                .duration(300)
                .attr('r', 3.5);
            
            console.log(i['Station Code']);
            

            path_id = "#scatter-label-"  + i['Station Code'];

            d3.select(path_id)
                .transition()
                .duration(300)
                .attr('opacity', 1.0)
                .attr('fill', '#003082')
                .style('font-size', '11px')
                .attr('font-weight', 'bold');
        });

    legendEnter.append('text')
        .merge(legend.select('text'))
        .attr('x', 15)
        .attr('y', 10)
        .attr('font-size', '13px')
        .text(d => d['Station Code']);

    legend.exit().remove();

}
    //UPDATE CHART END

    // Adjust the getPathCoordinates function as earlier
    function getPathCoordinates(data_point) {
        let coordinates = [];
        for (var i = 0; i < features.length; i++) {
            let ft_name = features[i];
            let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
            let value = parseFloat(data_point[ft_name]) || 0;
            coordinates.push(angleToCoordinate(angle, value));
        }
        return line(coordinates);  // Convert coordinates to SVG path string
    }

    d3.select('#stationSearch').on('input', function() {
        let inputText = this.value;
        if (inputText === "") {
            d3.select("#suggestion-box").selectAll("div").remove();
        } else {
            searchStation(inputText);
        }

    });

    d3.select('#stationSearch').on('keydown', function(e) {
        if (e.key === 'Enter')
        {   
            
            let searchValue = this.value.toUpperCase();
            //remove the text from the search bar
            d3.select('#stationSearch').property('value', '');
            //remove all suggestionDivs
            d3.select("#suggestion-box").selectAll("div").remove();
            //strip searchValue of whitespace

            //put in a value all the rows that have station name = searchValue
            if (dataset.filter(d => d['Station Name'].toUpperCase() === searchValue).length === 0 ){

            }
            else{
            let searchCode = dataset.filter(d => d['Station Name'].toUpperCase() === searchValue)[0]['Station Code'];
            
            if (!selectedStations.includes(searchCode)) {
                selectedStations.push(searchCode);
                updateChart();
            }
            d3.selectAll('text')
            .filter(function(d) {
                // returns true if d.id contains scatter-label-
                return this.id.includes('scatter-label-');
            })
            .transition()
            .duration(300)
            .attr('opacity', 0.0);
        
        d3.selectAll('circle')
            .filter(function(d) {
                // returns true if d.id contains station-
                return this.id.includes('scatter-node-');
            })
            .transition()
            .duration(300)
            .attr('opacity', 0.05);
        
            for (let i = 0; i < selectedStations.length; i++)
            {

                let label_id = '#scatter-label-' + selectedStations[i];
                d3.select(label_id)
                    .transition()
                    .duration(300)
                    .attr('opacity', 1.0)
                    .attr('fill', '#003082')
                    .attr('font-weight', 'bold');

                let node_id = '#scatter-node-' + selectedStations[i];
                d3.select(node_id)
                    .transition()
                    .duration(290)
                    .attr('opacity', 1.0)
                    .style("fill", station_color_mapping[selectedStations[i]]);
            }

            
        }

        }
    });

    d3.select('#clearStations').on('click', function() {
        selectedStations = [];
        available_colors = colors.slice();
        station_color_mapping = {};
        updateChart();

        d3.selectAll('text')
            .filter(function(d) {
                // returns true if d.id contains scatter-label-
                return this.id.includes('scatter-label-');
            })
            .transition()
            .duration(300)
            .attr('opacity', 0.0)
            .attr('fill', '#003082')
            .attr('font-weight', 'normal');

        d3.selectAll('circle')
            .filter(function(d) {
                // returns true if d.id contains station-
                return this.id.includes('scatter-node-');
            })
            .transition()
            .duration(300)
            .style("fill", "#f7c82d")
            .attr('opacity', 1.0);
    });


    updateChart();




});

