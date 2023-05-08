let h = window.innerHeight;
let w = window.innerWidth;

let time = 0;
let num = 100;
var margin = { top: 10, right: 10, bottom: 100, left: 40 },
  margin2 = { top: 430, right: 10, bottom: 20, left: 40 },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom,
  height2 = 500 - margin2.top - margin2.bottom;

let data = [0];
let latestData = [0];
let latestAverages_25 = [0];
let latestAverages_50 = [0];
let averages_25 = [0];
let averages_50 = [0];


let svg = d3.select('body').append('svg')
  .attr({width:  width + margin.left + margin.right, height: height + margin.top + margin.bottom});

let x = d3.scale.linear().range([0, w - 40]);
let y = d3.scale.linear().range([height, 0]);

let x2 = d3.scale.linear().range([0, w - 40]);
let y2 = d3.scale.linear().range([height2, 0]);

let line = d3.svg.line()
  .x((d, i) => x(i + time - num))
  .y(d => y(d));

let line2 = d3.svg.line()
.x((d, i) => x2(i))
.y(d => y2(d));

let xAxis = d3.svg.axis()
  .scale(x)
  .orient('bottom');

let yAxis = d3.svg.axis()
  .scale(y)
  .orient('left');

let main = svg.append("g").attr('transform', "translate(" + margin.left + "," + margin.top + ")");
let graph2 = svg.append('g').attr('transform', "translate(" + margin2.left + "," + margin2.top + ")");

let $xAxis = main.append('g')
  .attr('class', 'x axis')
  .attr('transform', "translate(0," + height + ")")
  .call(xAxis);

let $yAxis = main.append('g')
  .attr('class', 'y axis')
  .call(yAxis);

graph2.append('g')
  .attr('class', 'x axis2')
  .attr('transform', "translate(0," + height2 + ")")
  .call(d3.svg.axis()
        .scale(x2)
        .orient('bottom'));

let $data = main.append('path')
  .attr('class', 'line data');

let $averages_25 = main.append('path')
  .attr('class', 'line average-25');

let $averages_50 = main.append('path')
  .attr('class', 'line average-50');

let $tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

let $data2 = graph2.append('path').attr('class', 'line');

let legend = main.append('g')
  .attr('transform', `translate(20, 30)`)
  .selectAll('g')
  .data([['X Axis', '#fff'], ['Y Axis', '#0ff'], ['Z Axis', '#ff0']])
  .enter()
  .append('g');

  legend
    .append('circle')
    .attr('fill', d => d[1])
    .attr('r', 5)
    .attr('cx', 0)
    .attr('cy', (d, i) => i * 15);

  legend
    .append('text')
    .text(d => d[0])
    .attr('transform', (d, i) => `translate(10, ${i * 15 + 4})`);

function tick() {
  time++;
  data = rls.x;
  averages_25 = rls.y;
  averages_50 = rls.z;

  if (time > num) {
    latestData = data.slice(-num);
    latestAverages_25 = averages_25.slice(-num);
    latestAverages_50 = averages_50.slice(-num);
  }
}

function update() {
  x.domain([time - num, time]);
  let yDom = d3.extent(latestData);
  yDom[0] = Math.max(yDom[0] - 1, 0);
  yDom[1] += 1;
  y.domain(yDom);

  x2.domain(x.domain());
  y2.domain(y.domain());

  $xAxis
    .call(xAxis);

  $yAxis
    .call(yAxis);

  $data
    .datum(latestData)
    .attr('d', line);
    // .on("mouseover", function(d) {
    //   $tooltip.style("opacity", 1); // Make tooltip visible
    // })
    // .on("mouseout", function(d) {
    //   $tooltip.style("opacity", 0); // Hide tooltip
    // })
    // .on('mousemove', function() {
    //   let xPos = d3.mouse(this)[0];
    //   let xIndex = Math.round(x.invert(xPos - 30)) - time + num;
    //   let yValue = latestData[xIndex];
    //   showTooltip(xPos, y(yValue), yValue);
    // })
    // .on('mouseout', hideTooltip);

  $averages_25
    .datum(latestAverages_25)
    .attr('d', line);

  $averages_50
    .datum(latestAverages_50)
    .attr('d', line);

    $data2.datum(latestData).attr('d', line);
}

update();

setInterval(() => {
    if(recording && rls.x.length && rls.y.length && rls.z.length){
        tick();
        update();
    }
  
}, 60);

// Add brush
let brushX = d3.svg.brush()
  .x(x2)
  .on('brush', brushed);

graph2.append("g")
  .attr("class", "brush")
  .call(brushX)
  .selectAll("rect")
  .attr("y", 0)
  .attr("height", height2 + 7);

let $brushedData = svg.append('path')
  .attr('class', 'brushed-data');

function brushed() {
  let brushExtent = brushX.extent();
  x.domain(brushExtent);

  $data.attr('d', line);
  $averages_25.attr('d', line);
  $averages_50.attr('d', line);

  x2.domain(brushExtent);
  let brushedData = latestData.filter((d, i) => {
    let xVal = i + time - num;
    return x2(xVal) >= brushExtent[0] && x2(xVal) <= brushExtent[1];
  });
  let yDom = d3.extent(brushedData);
  yDom[0] = Math.max(yDom[0] - 1, 0);
  yDom[1] += 1;
  y2.domain(yDom);

  $brushedData.datum(brushedData)
    .attr('d', line2);

  $brush.call(brushX.extent([x.domain()[0], x.domain()[1]]));
}

function showTooltip(xPos, yPos, value) {
  $tooltip
    .html("Values: " + value)
    .style('left', `${xPos}px`)
    .style('top', `${yPos}px`)
    .transition()
    .duration(50)
    .style('opacity', 1);
}

function hideTooltip() {
  $tooltip
    .transition()
    .duration(50)
    .style('opacity', 0);
}

