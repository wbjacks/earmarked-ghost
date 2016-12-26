(function (d3, Math, parseInt, setInterval) {
var containerHeight = parseInt(d3.select('.header-image').style('height').slice(0, -2)), // TODO: pad?
    containerWidth = parseInt(d3.select('.header-image').style('width').slice(0, -2)),
    H = 1,
    MAX_STEPS = 4,
    lineData = [],
    maxY = 0,
    lineFunction = d3.line()
    .x(function(d) {return d.x})
    .y(function(d) {
        return maxY === 0 ? containerHeight : containerHeight - ((d.y / maxY) * (containerHeight - 8));
    })
    .curve(d3.curveLinear);
    //.curve(d3.curveCatmullRom.alpha(1));


// Ugh global objects
function resetLineData() {
    var rangeStep = containerWidth / Math.pow(2, MAX_STEPS) + 1;
    lineData = _.range(0, containerWidth + rangeStep, rangeStep).map(function(val) {
        return {
            x: val,
            y: 0
        };
    });
}

function makeLine(data) {
        d3.select('.header-image')
        .transition()
        .duration(5000)
        .select('path')
        .attr('d', lineFunction(data))
        .attr('stroke', 'gray')
        .attr('stroke-width', 1)
        .attr('fill', 'none');
}

function makeMpd(data, step, scale) {
    var frozenRanges = [],
        indexStep = (data.length - 1) * Math.pow(2, -(step - 1));
    for (var i = 0; i <= data.length - indexStep; i += indexStep) {
        var beginning = frozenRanges.length === 0 ?
                0 : frozenRanges[frozenRanges.length - 1][1],
            end = beginning + indexStep,
            mid = ((end - beginning) / 2) + beginning;

        frozenRanges.push([beginning, mid]);
        frozenRanges.push([mid, end]);

        // Add midpoint offset
        data[mid].y += (containerHeight * Math.random() * scale);

        // Hold maxY for scaling
        maxY = Math.max(maxY, Math.max(data[beginning].y, Math.max(data[end].y, data[mid].y)));
    }
    
    // Calculate interpolation
    _(frozenRanges).each(function(range) {
        for (var i = range[0] + 1; i < range[1]; i++) {
            var p1 = data[range[0]], p2 = data[range[1]];
            data[i].y = p1.y + ((p2.y - p1.y) / (p2.x - p1.x)) * (data[i].x - p1.x);
        }
    });
}

(function() {
    var tick = function() {
        if (step <= MAX_STEPS) {
            makeMpd(lineData, step, scale);
            makeLine(lineData);
            scale *= Math.pow(2, -H);
            step++;
        }
        else {
            scale = 1, step = 1, maxY = 0;
            resetLineData();
            makeLine(lineData);
        }
    };

    // Start with step 0
    resetLineData();
    d3.select(".header-image").append("svg")
        .attr("height", containerHeight)
        .attr("width", containerWidth)
        .append('path')
        .attr('d', lineFunction(lineData))
        .attr('stroke', 'gray')
        .attr('stroke-width', 1)
        .attr('fill', 'none');

    // Don't wait for step 1
    var scale = 1, step = 1;
    tick();
    setInterval(tick, 5000);
})();
})(d3, Math, parseInt, setInterval);
