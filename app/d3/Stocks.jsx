import * as d3 from "d3";

var container = document.getElementById('stockContainer');
var stockForm = document.getElementById(('add-stock-form'))
var stockInput = document.getElementById('stock-input')
var stocksGraph = document.getElementById('stocksGraph')
var includedStocks = document.getElementById('includedStocks')
var errorDiv = document.getElementById('errorDiv')

var date = new Date();


var socket = io.connect();


let removeTickerButton = (e) => {
    e.preventDefault();
    //console.log(e);
    console.log(date.getMonth()+1 + "," + date.getFullYear());
    socket.emit('remove stock', e.srcElement.value)
}

stockForm.addEventListener("submit", (e) => {
    e.preventDefault()
    
    socket.emit('add stock', stockInput.value)
})

socket.on("errormsg", (doc) => {
    errorDiv.innerHTML = doc
});

socket.on("addtickerbutton", (doc) => {
    
    let tickerButton = document.createElement("div")
    tickerButton.setAttribute("id","tickerbutton"+doc)
    tickerButton.setAttribute("class", "tickerButton")
    //tickerButton.setAttribute('onSubmit', removeTickerButton())
    
    let tickerButtonText = document.createElement('span');
    tickerButtonText.setAttribute("class", "tickerButtonText")
    tickerButtonText.innerHTML = doc;
    
    let tickerSubmit = document.createElement("button");
    tickerSubmit.setAttribute("class", "tickerDelete")
    tickerSubmit.name = "tickerDelete"
    tickerSubmit.value = doc;
    tickerSubmit.innerHTML = "X"
    tickerSubmit.addEventListener("click", (e) => {
        removeTickerButton(e);
    })
    
    includedStocks.appendChild(tickerButton);
    tickerButton.appendChild(tickerButtonText);
    tickerButton.appendChild(tickerSubmit);
    
})


socket.on('removetickerbutton', (ticker) => {
    var elementToDelete = document.getElementById('tickerbutton'+ticker)
    elementToDelete.remove();
})

socket.on('connected', (stocks) => {
    
    console.log(stocks);
    var svg = d3.select('#stocksGraph').append("div");
})
  
