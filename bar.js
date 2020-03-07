'use strict';
(function() {
    let data = '';
    const colors = ['#FFD700', '#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '	#8B008B', '#FF1493', 'black', '#696969']
    let margin = {
        top: 50,
        right: 20,
        bottom: 50,
        left: 220
    }
    let tinyScales = {
        width: 600,
        height: 600,
        margin: 70,
    }

    window.onload = () => {
        d3.csv('data/top.csv')
            .then((res) => {
                data = res;
                for(let item in data) {
                    data[item].YEAR = Math.round(data[item].YEAR)
                }
                handleData(data)
            })
    }
    function handleData(data) {
        var yearDrop = d3.select("body").append("select").attr("class", "year-drop")
        yearDrop.append('option')
                  .data(data)
                  .text('All Years')
                  .attr('value', 'All')
                  .enter()
        yearDrop.selectAll("option.state")
                .data(d3.map(data, (d) => {return d.YEAR}).keys())
                .enter()
                .append("option")
                .text((d) => { return d});
        let groupEmployer = filterData('All', data);
        console.log(groupEmployer)
        plotBar(groupEmployer)
        yearDrop.on('change', function() {
            let selectedYear = d3.select(this).property("value");
            groupEmployer = filterData(selectedYear, data)
            plotBar(groupEmployer, selectedYear)
        })

    }
    function filterData(selectedYear, data) {
        let employerToPass = {}
        let groupEmployer = [];
        let filtered = data;
        if(selectedYear !== 'All') {
            filtered = filtered.filter((each) => each.YEAR == selectedYear);
        }
        for(let i = 0; i < filtered.length; i++) {
            let each = filtered[i];
            if (!employerToPass[each['EMPLOYER_NAME']]) {
                employerToPass[each['EMPLOYER_NAME']] = 0;
            }
            if(each['CASE_STATUS'] == 'CERTIFIED') {
                employerToPass[each['EMPLOYER_NAME']]++;
            }
        }
        for (let key in  employerToPass) {
            let eachMap = {}
            eachMap['employer'] = key
            eachMap['pass'] = employerToPass[key]
            groupEmployer.push(eachMap)
        }
        groupEmployer = groupEmployer.sort((a, b) => {
            return d3.ascending(a.pass, b.pass)
        })
        return groupEmployer
    }
    function plotBar(groupEmployer, selectedYear) {
        var width = 1300 - margin.left - margin.right // count of pass
        var height = 700 - margin.top - margin.bottom // employer names
        var color = d3.scaleOrdinal().range(colors);
        d3.select('#chart').selectAll('svg').remove();
        let title = ''
        if(selectedYear === 'All') {
            title = 'Companies that Successfully Sponsored Most H1B Visas from 2011 - 2016'
        } else {
            title = 'Companies that Successfully Sponsored Most H1B Visas in ' + selectedYear
        }
        var svg = d3.select("#chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        // employer names
        var y = d3.scaleBand()
            .rangeRound([0, height])
            .padding(0.1)
            .domain(groupEmployer.map((d) => {
                return d.employer
            }))
        // count of pass
        var x = d3.scaleLinear()
                .rangeRound([width, 0])
                .domain([d3.max(groupEmployer, function (d) {
                    return d.pass
                }), 0]);
        svg.append("text")
            .attr('class', 'title')
            .attr('x', 150)
            .attr('y', -20)
            .attr('font-size', '20pt')
            .text(title)
        svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .append('text')
                .attr("fill", "#000")
                .attr('x', 1000)
                .attr('y', 50)
                .attr('font-size', '15px')
                .attr("text-anchor", "end")
                .text("Count of Successful Cases");
        svg.append("g")
                .call(d3.axisLeft(y))
        
        let toolTip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

        let pieChart = toolTip.append('svg')
                            .attr('width', tinyScales.width)
                            .attr('height', tinyScales.height)
        svg.selectAll(".bar")
                .data(groupEmployer)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", 7)
                .attr("y", function (d) {
                    return y(d.employer);
                })
                .attr("height", y.bandwidth())
                .attr("width", function (d) {
                    return x(d.pass);
                })
                .style("fill", function(d, i) {
                    return color(i);
                  })
                .on('mouseover', (d) => {
                    pieChart.selectAll("*").remove()
                    toolTip.transition()
                            .duration(200)
                            .style("opacity", .9);
                            plotIncrease(data, d, pieChart)
                    toolTip.style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");

                })
                .on("mouseout", (d) => {
                    toolTip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

    }
    function plotIncrease(data, d, pieChart) {
        let companyData = data.filter((each) => each.EMPLOYER_NAME == d.employer)
        let stat = {2011: 0, 2012: 0, 2013: 0, 2014: 0, 2015: 0, 2016: 0}
        for(let i in companyData) {
            if(companyData[i]['CASE_STATUS'] === 'CERTIFIED') {
                stat[companyData[i]['YEAR']]++
            }
        }
        let statArray = []
        for(let key in stat) {
            let eachYear = {}
            eachYear['YEAR'] = key
            eachYear['passed'] = stat[key]
            statArray.push(eachYear)
        }
        let limits = {
            passed_min: d3.min(statArray.map((each) => each.passed)),
            passed_max: d3.max(statArray.map((each) => each.passed))
        }
        console.log(limits)
        let year_scale = d3.scaleLinear()
            .range([tinyScales.margin, tinyScales.width - tinyScales.margin])
            .domain([2010, 2017])
        let passed_scale = d3.scaleLinear()
            .range([tinyScales.margin, tinyScales.height - tinyScales.margin])
            .domain([limits.passed_max + 1000, 0]);
        let year_plot = d3.axisBottom().scale(year_scale).ticks(6);
        pieChart.append("g")
                .attr('transform','translate(0, ' + (tinyScales.height - tinyScales.margin) + ')')
                .call(year_plot)
                
        let passed_plot = d3.axisLeft().scale(passed_scale);
        pieChart.append('g')
                    .attr('transform', 'translate(' + tinyScales.margin + ', 0)')
                    .call(passed_plot)
        pieChart.append("path")
                    .datum(statArray)
                    .attr("fill", "none")
                    .attr("stroke", "steelblue")
                    .attr("stroke-width", 1.5)
                    .attr("d", d3.line()
                        .x((d) => { return year_scale(d.YEAR) })
                        .y((d) => { return passed_scale(d.passed) }))
        pieChart.append('text')
                    .attr('x', (tinyScales.width - 2 * tinyScales.margin) / 2 - 150)
                    .attr('y', tinyScales.margin / 2 + 10)
                    .style('font-size', '12pt')
                    .text("Successful H1B Cases from " + d.employer.substring(0, d.employer.indexOf(' ')) + " over 2011 - 2016");
        pieChart.append('text')
                    .attr('x', (tinyScales.width - 2 * tinyScales.margin) / 2 + 250)
                    .attr('y', tinyScales.height - 20)
                    .style('font-size', '15pt')
                    .text("Year");
        pieChart.append('text')
                    .attr('transform', 'translate( 15,' + (tinyScales.height / 2 + 50) + ') rotate(-90)')
                    .style('font-size', '15pt')
                    .text("Successful Cases");
    }
})()