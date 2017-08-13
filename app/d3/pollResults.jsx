
import * as d3 from "d3";
const options = data.options

const count = options.length;


var margin = 50, h = 500 - 2*margin, w = 500 - 2*margin, bw = w / count/1.5;


const choices = options.map((a,i) => {
    return a.choice
});

const choicesRange = choices.map((a,i) =>{
    return i*(3*bw/2)+margin+bw/2
})
const results = options.map((a,i) => {
    return a.results
})

console.log(results);


var svg = d3.select('#chart').append('svg')
             .attr('height', h + 2*margin)
             .attr('width', w + 2*margin)

             
var y = d3.scaleLinear().domain([0,d3.max(results)]).range([h+margin,margin])

var x = d3.scaleOrdinal().domain(choices).range(choicesRange)

svg.append("g").attr("class", "xaxis").attr("transform", "translate("+(bw/2)+","+  (margin+h)+")").call(d3.axisBottom(x).ticks(count));
 
svg.append("g").attr("class","yaxis").attr("transform", "translate("+margin+","+0+")").call(d3.axisLeft(y).ticks(d3.max(results)));

var bar = svg.selectAll('.bar').data(options).enter().append('g').attr('class','bar')

var chart = bar.append("rect").attr("width", bw)
    .attr("x", (d) => {
        return x(d.choice)
    })
    .attr("y", (d) => {
        return y(d.results)
    })
    .attr("height", (d)=> {
        return h - y(d.results) +margin
    })
    
var bartext = bar.append('text')
    .attr("x", (d) => {
        return x(d.choice)+bw/2 -1
    })
    .attr("y", (d) => {
        return y(d.results) -5 
    })
    .text((d)=>{
        return d.results
    })