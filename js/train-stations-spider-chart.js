let width = 700;
let height = 700;

d3.csv("data/disruptions-2022-geo.csv").then( function(data) 
{
    data = [];
    let features = [
        "N of Platforms",
        "N of Trains",
        "Avg. Delay",
        "N of Disruptions",
        "E"
    ];

    for (var i = 0; i < 3; i++){
        var point = {}
        //each feature will be a random number from 1-9
        features.forEach(f => point[f] = 1 + Math.random() * 8);
        data.push(point);
    }
    
    let svg = d3.select("#stations-spider-chart").append("svg")
        .attr("width", width)
        .attr("height", height);
    
    let radialScale = d3.scaleLinear()
        .domain([0,10])
        .range([0,250]);

    let ticks = [2,4,6,8,10];

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
        return {
            "name": f,
            "angle": angle,
            "line_coord": angleToCoordinate(angle, 10),
            "label_coord": angleToCoordinate(angle, 10.5)
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

    let colors = ["darkorange", "gray", "navy"];

    function getPathCoordinates(data_point)
    {
        let coordinates = [];
        for (var i = 0; i < features.length; i++){
            let ft_name = features[i];
            let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
            coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
        }
        return coordinates;
    }

    // draw the path element
    svg.selectAll("path")
    .data(data)
    .join(
        enter => enter.append("path")
            .datum(d => getPathCoordinates(d))
            .attr("d", line)
            .attr("stroke-width", 3)
            .attr("stroke", (_, i) => colors[i])
            .attr("fill", (_, i) => colors[i])
            .attr("stroke-opacity", 1)
            .attr("opacity", 0.5)
    );

});