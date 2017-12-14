
var scatter;
var ndx;
d3.csv('data.csv', 
function (odata) {
    var obligKey = ["Additives N", "Brands", "Product Name", "Groupes", "Countries Fr (group)"]
    var counts = {}
    var data = [];
    odata.forEach(function (d)
        {
            var allPresent = true;
            obligKey.forEach(function (o) { if (d[o] == '') { allPresent = false}})
            
            if (allPresent)
            {
                num = +d["Additives N"]
                counts[num] = counts[num] ? counts[num] + 1 : 1;
                
                
                data.push({
                    nAdd : +d["Additives N"],
                    brand : d["Brands"],
                    productName : d["Product Name"],
                    group : d["Groupes"],
                    country : d["Countries Fr (group)"],
                    y : counts[num]
                    });
            
            }
        })
        
        var categories = dc.rowChart("#categories");
        scatter = dc.dataTable("#scatter")
        var detail = dc.scatterPlot("#detail");
        var country = dc.pieChart("#country");
           
        ndx = crossfilter(data);
        var scatterDim = ndx.dimension(function(d) {return [+d.nAdd, +d.y, d]})
            addDim = ndx.dimension(function(d) {return +d.nAdd}),
            catDim = ndx.dimension(function(d) {return d.group}),
            countryDim = ndx.dimension(function(d) { return d.country;}),
            yDim3 = ndx.dimension(function(d) {return 1}),
            yDim = ndx.dimension(function(d) {return +d.y}),
            yGroup = yDim.group(),
            addGroup = addDim.group(),
            catGroup = catDim.group(),
            countryGroup = countryDim.group(),
            countsCat = catGroup.reduceCount().all(),
            countByGroup = {};

        Array.prototype.slice.call(countsCat).forEach(function(d) { countByGroup[d.key] = d.value; })
    
        var catMean = catGroup.reduceSum(function(d) {
            return +d.nAdd / countByGroup[d.group]; 
        });

        
        var xScale = d3.scale.linear()
            .domain([
                d3.min([0,d3.min(data,function (d) { return d.nAdd })]),
                d3.max([0,d3.max(data,function (d) { return d.nAdd })])
                ])
            
        function updateY()
        {
            counts = {}
            var ar= scatterDim.top(Infinity)
            ar.forEach(function(d) 
            {
                num = +d.nAdd
                counts[num] = counts[num] ? counts[num] + 1 : 1;
                d.y = counts[num]
            })

            countryGroup = countryDim.group(),
            countsCat = catGroup.reduceCount().all(),
            countByGroup = {};

            Array.prototype.slice.call(countsCat).forEach(function(d) { countByGroup[d.key] = d.value; })


            // function(d) {
            //     console.log(d)
            //     num = d.key[2].nAdd;
            //     counts[num] = counts[num] ? counts[num] + 1 : 1;
            //     d.key[1] = counts[num]}
        }
        var needUpdate = false

        detail
            .width(650)
            .height(400)
            .x(xScale)
            .brushOn(false)
            .symbolSize(8)
            .clipPadding(15)
            .dimension(scatterDim)
            .excludedOpacity(0.7)
            .keyAccessor(function(d) { return d.key[2].nAdd; })
            .valueAccessor(function(d) { return d.key[2].y;})
            .title(function(p){ var d = p.key[2];
                return "Nom: " + d.productName + 
            "\nMarque: " + d.brand +
            "\nCatégorie: " + d.group +
            "\nOrigine: " + d.country + "" })
            .group(scatterDim.group())
            .elasticY(true)
            .xAxisLabel("Nombre additifs")
            .on("filtered", updateY())
            .yAxisLabel("Nombre produits")

            


        country
            .width(200)
            .height(300)
            .dimension(countryDim)
            .group(countryGroup)
            .innerRadius(30)
            .on("filtered", function(chart, filter) { updateY()})
            .controlsUseVisibility(true)

        categories
            .dimension(catMean)            
            .group(catGroup)
            .width(350)
            .height(300)
            .elasticX(true)
            .valueAccessor(function(d) {return d.value/countByGroup[d.key]})
            // .elasticX(true)
            // .x(d3.scale.ordinal())
            // .xUnits(dc.units.ordinal)
            .controlsUseVisibility(true)
            .gap(0.1)
            .ordering(function(d) { return -d.value;})
            .on("filtered", function(chart, filter) { updateY()})

        scatter
            .dimension(addDim)
            .group(function(d) { return d.productName;})
            .width(720)
            .height(480)
            .sortBy(function(d) { return d.nAdd; })
            .showGroups(false)
            .ordering(function(d) { return d.nAdd; })
            .size(Infinity).columns([{
                        label: 'Nom du produit',
                        format: function(d) {
                            name = d.productName.substring(0, 20)
                            if (d.productName.length > 20)
                                name += "..."
                            return  name;
                            }
                        },
                      {
                          label: 'Categorie',
                          format: function(d) {
                              return d.group;
                          }
                      },
                      {
                        label: 'Nombre additifs',
                        format: function(d) {
                            return "  " + d.nAdd;
                        }
                      },
                      {
                          label: 'Marque',
                          format: function(d) {
                              name = d.brand.substring(0, 10)
                            if (d.brand.length > 10)
                                name += "..."
                            return  name;
                          }
                      }]);


        //scatter.render();
        dc.renderAll();

        categories.svg()
            .append("text")
                .attr("class", "x-axis-label")
                .attr("text-anchor", "middle")
                .attr("x", categories.width()/2)
                .attr("y", categories.height() - 3.0)
                .attr("font-size", "0.7em")
                .text("Nombre moyen d'additifs");

        next()
        last()
        update()
        display()
        //brands.xAxis().tickFormat(function(d) {return d*10}); // convert back to base unit
        //brands.yAxis.ticksFormat(function(d) {return d});


        
    })

var ofs = 0, pag = 17;
function display() {
    d3.select('#begin')
        .text(ofs);
    d3.select('#end')
        .text(ofs+pag-1);
    d3.select('#last')
        .attr('disabled', ofs-pag<0 ? 'true' : null);
    d3.select('#next')
        .attr('disabled', ofs+pag>=ndx.size() ? 'true' : null);
    d3.select('#size').text(ndx.size());
}
function update() {
    scatter.beginSlice(ofs);
    scatter.endSlice(ofs+pag);
    display();
}
function next() {
    ofs += pag;
    update();
    scatter.redraw();
}
function last() {
    ofs -= pag;
    update();
    scatter.redraw();
}



 