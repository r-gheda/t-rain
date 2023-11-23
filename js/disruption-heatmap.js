let x_domain_bottom = 30429;
let x_domain_top = 309128;
let y_domain_bottom = 276165;
let y_domain_top = 609034;

// set the dimensions and margins of the graph
let margin = {top: 0, right: 0, bottom: 0, left: 0},
width = 550 - margin.left - margin.right,
height = (width * (y_domain_top - y_domain_bottom) / (x_domain_top - x_domain_bottom)) - margin.top - margin.bottom;

// append the svg object to the body of the page
let svg = d3.select("#disr-heatmap")
.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// read data
d3.csv("data/disruptions-2022-geo.csv").then( function(data) {

// Add X axis
let x = d3.scaleLinear()
    .domain([x_domain_bottom, x_domain_top])
    .range([ margin.left, width - margin.right ]);

let xgen = d3.axisBottom(x)
    .ticks(0);

    
svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(xgen);
    
svg.select(".domain")
    .attr("opacity",".0");

// Add Y axis
let y = d3.scaleLinear()
    .domain([y_domain_bottom, y_domain_top])
    .range([ height - margin.bottom, margin.top ]);

svg.append("g")
    .call(d3.axisLeft(y))
    .attr("opacity", ".0");


// Prepare a color palette
let color = d3.scaleLinear()
    .domain([0, 1]) // Points per square pixel.
    .range(["white", "#FF6600"])

// compute the density data
let densityData = d3.contourDensity()
    .x(function(d) { return x(d.x); })
    .y(function(d) { return y(d.y); })
    .size([width, height])
    .bandwidth(20)
    (data)
    
// show the shape!
svg.insert("g", "g")
    .selectAll("path")
    .data(densityData)
    .enter().append("path")
    .attr("d", d3.geoPath())
    .attr("fill", function(d) { return color(d.value); })
})

function normalize_coordinates_x(x)
{
    return width * (x - x_domain_bottom) / (x_domain_top - x_domain_bottom);
}

function normalize_coordinates_y(y)
{
    return height - (height * (y - y_domain_bottom) / (y_domain_top - y_domain_bottom));
}

function normalize_coordinates(x, y, name_var)
{
    return { x: normalize_coordinates_x(x), y: normalize_coordinates_y(y), name: name_var };
}

const locations = [
    normalize_coordinates(84277.99700000137,446959.6020000018,'Delft'),
    normalize_coordinates(121860.19999999925,488006.5, 'Amsterdam Centraal'),
    normalize_coordinates(136044.60599999875,455672.31599999964, 'Utrecht Centraal'),
    normalize_coordinates(91862.17399999872,437774.2890000008, 'Rotterdam Centraal'),
    normalize_coordinates(112377.12999999896,480358.21599999815, 'Schiphol Airport'),
    normalize_coordinates(82104.65399999917,455332.3759999983, 'Den Haag Centraal'),
    normalize_coordinates(177424.90100000054,317875.55000000075, 'Maastricht'),
    normalize_coordinates(161551.2049999982,383796.2250000015, 'Eindhoven Centraal'),
    normalize_coordinates(209579.60399999842,375390.243999999,'Venlo'),
    normalize_coordinates(233603.33999999985,581086.0949999988, 'Groningen'),
    normalize_coordinates(105421.83999999985,424528.1099999994, 'Dordrecht'),
    normalize_coordinates(108263.39999999851,447890.19999999925, 'Gouda'),
    normalize_coordinates(148539.0,411325.0,'\'s-Hertogenbosch'),
    normalize_coordinates(112887.829,400891.08300000057, 'Breda'),
    normalize_coordinates(90607.0, 395039.0, 'Roosendaal'),
    normalize_coordinates(196364.94799999893,322507.0859999992, 'Heerlen'),
    normalize_coordinates(177102.46499999985,362199.8379999995, 'Weert'),
    normalize_coordinates(153854.01000000164,462814.186999999, 'Amersfoort Centraal'),
    normalize_coordinates(257562.26799999923,471534.86300000176, 'Enschede'),
    normalize_coordinates(202723.989,502201.27899999917, 'Zwolle'),
    normalize_coordinates(190217.2809999995,444188.3579999991, 'Arnhem Centraal'),
    normalize_coordinates(190416.24799999967,552862.4840000011, 'Heerenveen'),
    normalize_coordinates(111185.65500000119,516904.6090000011, 'Alkmaar')
    // Add more data points as needed
  ];
  
const labelsGroup = svg.append('g');

  // Add location labels
labelsGroup.selectAll('text')
    .data(locations)
    .enter().append('text')
    .attr('x', d => d.x)
    .attr('y', d => d.y - 6)
    .text(d => d.name)
    .attr('font-size', '10px')
    .attr('fill', 'black')
    .attr('text-anchor', 'middle');

const pointsGroup = svg.append('g');

pointsGroup.selectAll('circle')
    .data(locations)
    .enter().append('circle')
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', 2) // Adjust the radius as needed
    .attr('fill', 'black'); // Adjust the fill color as needed
