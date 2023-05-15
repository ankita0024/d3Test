// let h = window.innerHeight;
// let w = window.innerWidth;

var margin = { top: 10, right: 10, bottom: 100, left: 40 },
  margin2 = { top: 430, right: 10, bottom: 20, left: 40 },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom,
  height2 = 500 - margin2.top - margin2.bottom;
let sources = [];

var myBrush;
var color = d3.scale.category10();
var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S");

let svg = d3
  .select("body")
  .append("svg")
  .attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom,
  });
svg
  .append("defs")
  .append("clipPath")
  .attr("id", "clip")
  .append("rect")
  .attr("width", width)
  .attr("height", height);
let x = d3.time.scale().range([0, width]);
let y = d3.scale.linear().range([height, 0]);

let x2 = d3.time.scale().range([0, width]);
let y2 = d3.scale.linear().range([height2, 0]);

let line = d3.svg
  .line()
  .x(function (d) {
    return x(d.date);
  })
  .y(function (d) {
    return y(d.value);
  })
  .defined(function (d) {
    return !isNaN(d.value);
  })
  .interpolate("linear");

let line2 = d3.svg
  .line()
  .x(function (d) {
    return x2(d.date);
  })
  .y(function (d) {
    return y2(d.value);
  })
  .defined(function (d) {
    return !isNaN(d.value);
  })
  .interpolate("linear");

let main = svg
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
let graph2 = svg
  .append("g")
  .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

// graph2.append('g')
//   .attr('class', 'x axis2')
//   .attr('transform', "translate(0," + height2 + ")")
//   .call(d3.svg.axis()
//         .scale(x2)
//         .orient('bottom'));

// let $data = main.append('path')
//   .attr('class', 'line data');

// let $averages_25 = main.append('path')
//   .attr('class', 'line average-25');

// let $averages_50 = main.append('path')
//   .attr('class', 'line average-50');

// let $tooltip = d3.select("body").append("div")
//   .attr("class", "tooltip")
//   .style("opacity", 0);

// let $data2 = graph2.append('path').attr('class', 'line');

// let legend = main.append('g')
//   .attr('transform', `translate(20, 30)`)
//   .selectAll('g')
//   .data([['X Axis', '#fff'], ['Y Axis', '#0ff'], ['Z Axis', '#ff0']])
//   .enter()
//   .append('g');

//   legend
//     .append('circle')
//     .attr('fill', d => d[1])
//     .attr('r', 5)
//     .attr('cx', 0)
//     .attr('cy', (d, i) => i * 15);

//   legend
//     .append('text')
//     .text(d => d[0])
//     .attr('transform', (d, i) => `translate(10, ${i * 15 + 4})`);

function tick() {
  color.domain(
    d3.keys(rls[0]).filter(function (key) {
      return key !== "date";
    })
  );
  rls.forEach(function (d) {
    d.date = new Date(d.date);
  });
  sources = color.domain().map(function (name) {
    return {
      name: name,
      values: rls.map(function (d) {
        return { date: d.date, value: +d[name] };
      }),
    };
  });
  x.domain(
    d3.extent(rls, function (d) {
      return d.date;
    })
  );
  y.domain([
    d3.min(sources, function (c) {
      return d3.min(c.values, function (v) {
        return v.value;
      });
    }),
    d3.max(sources, function (c) {
      return d3.max(c.values, function (v) {
        return v.value;
      });
    }),
  ]);
  x2.domain(x.domain());
  y2.domain(y.domain());

  var mainLineGroups = main.selectAll("g").data(sources).enter().append("g");

  mainLineGroups
    .append("path")
    .attr("class", "line")
    .attr("d", function (d) {
      return line(d.values);
    })
    .style("stroke", function (d) {
      return color(d.name);
    })
    .attr("clip-path", "url(#clip-path)");

  main
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.svg.axis().scale(x).orient("bottom"));

  main
    .append("g")
    .attr("class", "y axis")
    .call(d3.svg.axis().scale(y).orient("left"));

  var graphLineGroups = graph2.selectAll("g").data(sources).enter().append("g");

  graphLineGroups
    .append("path")
    .attr("class", "line")
    .attr("d", function (d) {
      return line2(d.values);
    })
    .style("stroke", function (d) {
      return color(d.name);
    })
    .attr("clip-path", "url(#clip-path)");
  
  // graph2.select(".x.axis2").remove();

  graph2
    .append("g")
    .attr("class", "x axis2")
    .attr("transform", "translate(0," + height2 + ")")
    .call(d3.svg.axis().scale(x2).orient("bottom"));

  myBrush = d3.svg
    .brush()
    .x(d3.scale.linear().range([0, width]))
    .on("brush", brushed);

  var begin = x2(
    new Date(x2.invert(x2.range()[1]).valueOf() - 1000 * 365 * 8 * 24 * 60 * 60)
  );
  var end = x2.range()[1];
  console.log("begin",begin);
  console.log("end-",end);

  graph2
    .append("g")
    .attr("class", "x brush")
    .call(myBrush)
    .selectAll("rect")
    .attr("y", 0)
    .attr("height", height2)
    .attr("x", begin)
    .attr("width", end - begin);
  refreshChart();
}

function refreshChart() {
  // sources.forEach(function (s) {
  //   var lastDate = new Date(
  //     s.values[s.values.length - 1].date.setMonth(
  //       s.values[s.values.length - 1].date.getMonth() + 1
  //     )
  //   );
  //   var value = s.values.shift().value;
  //   s.values.push({ date: lastDate, value: value });
  // });

  x2.domain([
    d3.min(sources, function (c) {
      return d3.min(c.values, function (v) {
        return v.date;
      });
    }),
    d3.max(sources, function (c) {
      return d3.max(c.values, function (v) {
        return v.date;
      });
    }),
  ]);

  y2.domain([
    d3.min(sources, function (c) {
      return d3.min(c.values, function (v) {
        return v.value;
      });
    }),
    d3.max(sources, function (c) {
      return d3.max(c.values, function (v) {
        return v.value;
      });
    }),
  ]);

  // var bs = myBrush.brushSelection();
  // if (bs) {
  //   x.domain([x2.invert(bs[0]), x2.invert(bs[1])]);
  // } else {
  //   x.domain(x2.domain());
  // }
  // y.domain(y2.domain());

  var updateMainData = main.selectAll("path.line").data(sources);
  updateMainData
    .enter()
    .append("path")
    .attr("class", "line")
    .style("stroke", function (d) {
      return color(d.name);
    })
    .attr("clip-path", "url(#clip)")
    .attr("d", function (d) {
      return line(d.values);
    });
  updateMainData
    .transition()
    .duration(500)
    .attr("d", function(d) {
      return line(d.values);
    })
    .style("stroke", function(d) {
      return color(d.name);
    });

  updateMainData.exit().remove();
  console.log("sources---", sources);

  var updateGraph2Data = graph2.selectAll("path.line").data(sources);
  updateGraph2Data
    .enter()
    .append("path")
    .attr("class", "line")
    .style("stroke", function (d) {
      return color(d.name);
    })
    .attr("clip-path", "url(#clip)")
    .attr("d", function (d) {
      return line2(d.values);
    });
  updateGraph2Data
    .transition() // animate any changes in data
    .duration(500)
    .attr("d", function(d) {
      return line(d.values);
    })
    .style("stroke", function(d) {
      return color(d.name);
    });

  updateGraph2Data.exit().remove();

  main.select(".x.axis").call(d3.svg.axis().scale(x).orient("bottom"));
  main.select(".y.axis").call(d3.svg.axis().scale(y).orient("left"));
  graph2.select(".x.axis2").call(d3.svg.axis().scale(x2).orient("bottom"));
};

setInterval(() => {
  if (recording && rls.length) {
    tick();
  }
}, 60);

// function brushed() {
//   let brushExtent = brushX.extent();
//   x.domain(brushExtent);

//   $data.attr("d", line);
//   $averages_25.attr("d", line);
//   $averages_50.attr("d", line);

//   x2.domain(brushExtent);
//   let brushedData = latestData.filter((d, i) => {
//     let xVal = i + time - num;
//     return x2(xVal) >= brushExtent[0] && x2(xVal) <= brushExtent[1];
//   });
//   let yDom = d3.extent(brushedData);
//   yDom[0] = Math.max(yDom[0] - 1, 0);
//   yDom[1] += 1;
//   y2.domain(yDom);

//   $brushedData.datum(brushedData).attr("d", line2);

//   $brush.call(brushX.extent([x.domain()[0], x.domain()[1]]));
// }
function brushed() {
  var s = myBrush.extent();

  x.domain(
    myBrush.empty()
      ? x2.domain()
      : [x2.invert(s[0]), x2.invert(s[1])]
  );

  main.selectAll("path.line").attr("d", function(d) {
    return line(d.values);
  });
  main.select(".x.axis").call(d3.svg.axis().scale(x).orient("bottom"));
  main.select(".y.axis").call(d3.svg.axis().scale(y).orient("left"));
}

Date.prototype.addMonths = function(months) {
  var dat = new Date(this.valueOf());
  dat.setMonth(dat.getMonth() + months);
  return dat;
};
