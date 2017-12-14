function zoom() {
    svg.select(".x.axis").call(xAxis);
    svg.select(".y.axis").call(yAxis);

    svg.selectAll(".dot")
        .attr("transform", transform);
  }
d3.csv('data.csv', 
function (odata) {
    var data = []
    var obligKey = ["Additives N", "Brands", "Product Name", "Groupes", "Countries Fr (group)"]

    var counts = {} 
    odata.forEach(function (d)
        {
            var allPresent = true;
            obligKey.forEach(function (o) { if (d[o] == '') { allPresent = false}})
            
            if (allPresent)
            {
                el = {
                nAdd : +d["Additives N"],
                brand : d["Brands"],
                productName : d["Product Name"],
                group : d["Groupes"],
                country : d["Countries Fr (group)"]
                }
                num = el.nAdd
                counts[num] = counts[num] ? counts[num] + 1 : 1;
                el["y"] = counts[num]
                data.push(el);
            }
        })


    var body = d3.select('body')
	var margin = { top: 50, right: 50, bottom: 50, left: 50 }
	var h = 500 - margin.top - margin.bottom
	var w = 500 - margin.left - margin.right

    var fisheye = d3.fisheye.circular()
        .radius(200)
        .distortion(2);

    var formatPercent = d3.format('.2')
    var xScale = d3.scale.linear()
    .domain([
    	d3.min([0,d3.min(data,function (d) { return d.nAdd })]),
    	d3.max([0,d3.max(data,function (d) { return d.nAdd })])
    	])
    .range([0,w])
    
    
    var yScale = d3.scale.linear()
    .domain([
    	d3.min([0,d3.min(data,function (d) { return d.y;})]),
    	d3.max([0,d3.max(data,function (d) { return d.y;})])
    	])
    .range([h,0])
    var svg = body.append('svg')
	    .attr('height',h + margin.top + margin.bottom)
	    .attr('width',w + margin.left + margin.right)
	  .append('g')
	    .attr('transform','translate(' + margin.left + ',' + margin.top + ')')
	// X-axis
	var xAxis = d3.svg.axis()
	  .scale(xScale)
	  .tickFormat(formatPercent)
	  .ticks(5)
	  .orient('bottom')
    // Y-axis
	var yAxis = d3.svg.axis()
	  .scale(yScale)
	  .tickFormat(formatPercent)
	  .ticks(5)
	  .orient('left')

    var zoomBeh = d3.behavior.zoom()
      .x(xScale)
      .y(yScale)
      .scaleExtent([0, 500])
      .on("zoom", zoom);

    var r0 = '5';
    var r1 = '15'


    var circles = svg.selectAll('circle')
      .data(data)
      .enter()
    .append('circle')
      .attr('cx',function (d) { return xScale(d.nAdd) })
      .attr('cy',function (d) { return yScale(d.y) })
      .attr('r', r0)
      .attr('stroke','black')
      .attr('stroke-width',1)
      //.attr('fill',function (d,i) { return colorScale(i) })
  //  .on('mouseover', function () {
  //      d3.select(this)
  //        .transition()
  //        .duration(500)
  //        .attr('r',r1)
  //        .attr('fill', 'red')
  //        .attr('stroke-width',3)
  //          this.parentNode.appendChild(this);
  //  })
    .on("mousemove", function() {
          fisheye.focus(d3.mouse(this));

          d3.select(this).each(function(d) { d.fisheye = fisheye(d); })
              .attr("cx", function(d) { return xScale(d.nAdd); })
              .attr("cy", function(d) { return yScale(d.fisheye.y); })
	      .attr('fill', 'red')
              .attr("r", function(d) { return r1; });
	      this.parentNode.appendChild(this);
  })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(500)
          .attr('r',r0)
          .attr('zIndex', 0)
          .attr('stroke-width',1)
      })
    .append('title') // Tooltip
      .text(function (d) { return "Produit: " +d.productName +
                           '\nMarque: ' + d.brand+
                           '\nCatégorie: ' + d.group })
});

