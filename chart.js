
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
                
                if (data.length < 100)
                {
                    data.push({
                        nAdd : +d["Additives N"],
                        brand : d["Brands"],
                        productName : d["Product Name"],
                        group : d["Groupes"],
                        country : d["Countries Fr (group)"],
                        y : counts[num]
                        });
                }
            }
        })
        
        var categories = dc.barChart("#categories");
        var scatter = dc.dataTable("#scatter")
        //var detail = dc.pieChart("#detail");
        var country = dc.pieChart("#country");
           
        var ndx = crossfilter(data),
            addDim = ndx.dimension(function(d) {return +d.nAdd}),
            catDim = ndx.dimension(function(d) {return d.group}),
            countryDim = ndx.dimension(function(d) { return d.country;}),
            addGroup = addDim.group(),
            catGroup = catDim.group(),
            countryGroup = countryDim.group(),
            counts = catGroup.reduceCount().all(),
            countByGroup = {};

        Array.prototype.slice.call(counts).forEach(function(d) { countByGroup[d.key] = d.value; })
    
        var catMean = catGroup.reduceSum(function(d) {
            return +d.nAdd / countByGroup[d.group]; 
        });

        country
        .width(400)
        .height(400)
        .dimension(countryDim)
        .group(countryGroup)
        .innerRadius(50)
        .controlsUseVisibility(true);

        categories
            .dimension(catDim)            
            .group(catGroup)
            .width(750)
            .height(500)
            .elasticX(true)
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .controlsUseVisibility(true)
            .barPadding(0.1)
            .outerPadding(0.05)
            .yAxisLabel('Nombre moyen additifs')
            .ordering(function(d) { return -d.value;}); 
        
        scatter
            .dimension(addDim)
            .group(function(d) { return d.productName;})
            .width(700)
            .height(1000)
            .sortBy(function(d) { return +d.nAdd; })
            .showGroups(false)
            .columns([{
                        label: 'Nom du produit',
                        format: function(d) {
                            return  d.productName;
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
                              return d.brand;
                          }
                      }]);

        //scatter.render();
        dc.renderAll();
        //brands.xAxis().tickFormat(function(d) {return d*10}); // convert back to base unit
        //brands.yAxis.ticksFormat(function(d) {return d});


        
    }
)

 