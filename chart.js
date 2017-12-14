function multikey(x,y) {
    return x + 'x' + y;
}
function splitkey(k) {
    return k.split('x');
}
function stack_second(group) {
    return {
        all: function() {
            var all = group.all(),
                m = {};
            // build matrix from multikey/value pairs
            all.forEach(function(kv) {
                var ks = splitkey(kv.key);
                m[ks[0]] = m[ks[0]] || {};
                m[ks[0]][ks[1]] = kv.value;
            });
            // then produce multivalue key/value pairs
            return Object.keys(m).map(function(k) {
                return {key: k, value: m[k]};
            });
        }
    };
}
function sel_stack(i) {
    return function(d) {
        return d.value[i];
    };
}
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
                if (data.length < 10)
                {
                    data.push({
                        nAdd : +d["Additives N"],
                        brand : d["Brands"],
                        productName : d["Product Name"],
                        group : d["Groupes"],
                        country : d["Countries Fr (group)"],
                        y : +counts[num]
                        });
                }
            }
        })

        var w = 300
        var h = 300
        
        var categories = dc.barChart("#categories");
        var scatter = dc.barChart("#scatter")
        //var detail = dc.scatterPlot("#detail");
        //var country = dc.scatterPlot("#country");
           
        var ndx = crossfilter(data);
        
        var addDim = ndx.dimension(function(d) {return multikey(d.nAdd, '1');}),
            addGroup = addDim.group();
            stackedGroup = stack_second(addGroup)
            catDim = ndx.dimension(function(d) {return d.group}),
            catGroup = catDim.group(),
            counts = catGroup.reduceCount().all(),
            countByGroup = {};

        Array.prototype.slice.call(counts).forEach(function(d) { countByGroup[d.key] = d.value; })
    
        var catMean = catGroup.reduceSum(function(d) {
            return +d.nAdd / countByGroup[d.group]; 
        });

        categories
            .elasticX(true)
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .controlsUseVisibility(true)
            .barPadding(0.1)
            .outerPadding(0.05)
            .dimension(catMean)            
            .group(catGroup)
            .ordering(function(d) { return -d.value;}); 
        
        var xScale = d3.scale.linear()
        .domain([
            d3.min([0,d3.min(data, function (d) { return d.nAdd })]),
            d3.max([0,d3.max(data, function (d) { return d.nAdd })])
            ]);
        scatter
            .x(xScale)
            .brushOn(false)
            .dimension(addDim)
            .group(stackedGroup, "1", sel_stack('1'));
        
        scatter.render();
        //dc.renderAll();
        //brands.xAxis().tickFormat(function(d) {return d*10}); // convert back to base unit
        //brands.yAxis.ticksFormat(function(d) {return d});


        
    }
)

 