

let width  = 450;
let height = 450;
let margin = 150;
let selectedStations = [];

// Load the specific dataset
d3.csv("data/station_features/station_service_disruption_delays_cancel_counts.csv").then(function(dataset) 
{   
    
    if (dataset.length === 0) return;
    let legendData = [dataset[0]];
    // Select the first row of the dataset

    // Define the features to be used
    let features = ["Number of Services", "Disruption Count", "Delay Count", "Cancel Count"];

    let features_nosc = features.filter(f => f !== "Station Code");

        // Initialize objects to store the min and max values for each feature
        let featureMinMax = features_nosc.reduce((acc, feature) => {
            acc[feature] = {min: Number.MAX_VALUE, max: Number.MIN_VALUE};
            return acc;
        }, {});
    
        // Iterate through the dataset to find the min and max values for each feature
        dataset.forEach(function(row) {
            features.forEach(function(feature) {
                //ignore the station code
                if (feature === "Station Code") return;
                let value = parseFloat(row[feature]) || 0;
                featureMinMax[feature].min = Math.min(featureMinMax[feature].min, value);
                featureMinMax[feature].max = Math.max(featureMinMax[feature].max, value);
            });
        });
    
        // Normalize the data
        dataset = dataset.map(row => {
            let normalizedRow = {};
            normalizedRow["Station Code"] = row["Station Code"];
            features.forEach(feature => {
                //leave the station code as it is
                
                normalizedRow[feature] = (parseFloat(row[feature]) - featureMinMax[feature].min) / 
                                        (featureMinMax[feature].max - featureMinMax[feature].min);
            });
            return normalizedRow;
        });


    // Initialize variables to store the min and max values
    let minValue = 0;
    let maxValue = 1;

    let data = [dataset[0]]

    let legendX = 50; // X position of the legend
    let legendY = 50; // Y position of the legend
    let legendRectSize = 20; // Size of the legend color boxes
    let legendSpacing = 5; // Spacing between boxes

    // Select the first four rows of the dataset for the legend
   
    let svg = d3.select("#stations-spider-chart").append("svg")
        .attr("width", width)
        .attr("height", height);

    // Now minValue and maxValue hold the minimum and maximum values across all features

    // Adjust the radial scale domain based on the min and max values
    let radialScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([0, (width - margin) / 2]);

    let colors = ["darkorange", "gray", "navy", "red", "green", "purple", "lightblue"];

    let legend = svg.selectAll('.legend')
    .data(legendData)
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', function(_, i) {
        let height = legendRectSize + legendSpacing;
        let offset = height * legendData.length / 2;
        let horz = legendX;
        let vert = legendY + i * height - offset;
        return 'translate(' + horz + ',' + vert + ')';
    });

    // Create colored rectangles
    legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', (_, i) => colors[i])
        .style('stroke', (_, i) => colors[i]);

    // Create text labels
    //print the station code

    legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function(d) {
            return d['Station Code']; // Replace 'Station Code' with the actual attribute name for station codes
        });

    // Calculate ticks based on the maxValue
    let numberOfTicks = 7; // for example, you can change this
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
    let labelCoord = angleToCoordinate(angle, maxValue + 0.1); // A little bit further than maxValue

    // Adjust the x-coordinate of the label based on the angle
    // The adjustment factor (e.g., 5, 10, etc.) can be changed as needed
    let adjustmentFactor = 50; // Adjust this value as needed
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
        .attr("stroke","black")
);

// draw axis label
svg.selectAll(".axislabel")
.data(featureData)
.join(
    enter => enter.append("text")
        .attr("x", d => d.label_coord.x)
        .attr("y", d => d.label_coord.y)
        .text(d => d.name)
);    

let line = d3.line()
    .x(d => d.x)
    .y(d => d.y);
    
//UPDATE CHART
function updateChart(){

    let filteredData = dataset.filter(d => selectedStations.includes(d['Station Code']));

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
        .attr("stroke", (_, i) => colors[i])
        .attr("fill", (_, i) => colors[i])
        .attr("stroke-opacity", 1)
        .attr("opacity", 0.5)
        .attr('id', d => 'spider-path-' + d['Station Code'] );

    paths.exit().remove();

    //let legendData = [dataPoint];
    let legend = svg.selectAll('.legend').data(filteredData);

    let legendEnter = legend.enter().append('g').attr('class', 'legend');

    legendEnter.merge(legend)
        .attr('transform', (_, i) => 'translate(50,' + (50 + i * 25) + ')');

    legendEnter.append('rect')
        .merge(legend.select('rect'))
        .attr('width', 20)
        .attr('height', 20)
        .style('fill', (_, i) => colors[i])
        .style('stroke', (_, i) => colors[i])
        .attr('id', d => 'spider-legend-' + d['Station Code'])
        .on('mouseover', function(event, i)
        {
            d3.selectAll('path')
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
                .attr('r', 10);
        })
        .on('mouseout', function(_, i)
        {
            d3.selectAll('path')
                .transition()
                .duration(300)
                .attr('opacity', 0.5);

            let path_id = "#scatter-node-"  + i['Station Code'];

            d3.select(path_id)
                .transition()
                .duration(300)
                .attr('r', 5);
        });

    legendEnter.append('text')
        .merge(legend.select('text'))
        .attr('x', 25)
        .attr('y', 15)
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

    d3.select('#stationSearch').on('keydown', function(e) {
        if (e.key === 'Enter')
        {
            let searchValue = this.value.toUpperCase();
            
            if (!selectedStations.includes(searchValue)) {
                selectedStations.push(searchValue);
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
                    .attr('fill', 'black')
                    .attr('font-weight', 'bold');

                let node_id = '#scatter-node-' + selectedStations[i];
                d3.select(node_id)
                    .transition()
                    .duration(290)
                    .attr('opacity', 1.0)
                    .style("fill", "darkred");
            }
        }
    });

    d3.select('#clearStations').on('click', function() {
        selectedStations = [];
        updateChart();

        d3.selectAll('text')
            .filter(function(d) {
                // returns true if d.id contains scatter-label-
                return this.id.includes('scatter-label-');
            })
            .transition()
            .duration(300)
            .attr('opacity', 0.0)
            .attr('fill', 'black')
            .attr('font-weight', 'normal');

        d3.selectAll('circle')
            .filter(function(d) {
                // returns true if d.id contains station-
                return this.id.includes('scatter-node-');
            })
            .transition()
            .duration(300)
            .style("fill", "#69b3a2")
            .attr('opacity', 1.0);
    });

    updateChart();




});

