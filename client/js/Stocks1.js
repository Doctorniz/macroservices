//import * as d3 from "d3";
//import request from 'request';


var container = document.getElementById('stockContainer');
var stockForm = document.getElementById(('add-stock-form'))
var stockInput = document.getElementById('stock-input')
var stocksGraph = document.getElementById('stocksGraph')

var socket = io.connect();


stockForm.addEventListener("submit", (e) => {
    e.preventDefault()
    socket.emit('add stock', stockInput.value)
})

