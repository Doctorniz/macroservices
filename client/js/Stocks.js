//import * as d3 from "d3";
//import request from 'request';


var container = document.getElementById('stockContainer');
var stockForm = document.getElementById(('add-stock-form'))
var stockInput = document.getElementById('stock-input')
var stocksGraph = document.getElementById('stocksGraph')
var includedStocks = document.getElementById('includedStocks')
var errorDiv = document.getElementById('errorDiv');
var timeButtons = document.querySelectorAll('.timeButton');

var socket = io.connect();


var margin = {
    top: 10,
    bottom: 30,
    left: 20,
    right: 20,
}, h = 400, w = 400;



var Today = new Date();

let xaxisRange = [Today.getTime()-31536000000, Today.getTime()]

var layout = {
    title: "NASDAQ",
    xaxis: {
        title: "Date",
        type: 'date',
        range: xaxisRange,
        titlefont: {
            family: "Baloo",
            size: 24
        }
    },
    yaxis: {
        title: "Share Price",
        titlefont: {
            family: "Baloo",
            size: 24
        }
        },
    font: {
        family: "Exo",
        size: 18
    },
    titlefont: {
    family: "Baloo",
    size: 30
    },
    showlegend: true
    
}

let removeTickerButton = (e) => {
    e.preventDefault();
    socket.emit('remove stock', e.srcElement.value)
}

let addTickerButton = (doc) => {
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
}


stockForm.addEventListener("submit", (e) => {
    e.preventDefault()
    socket.emit('add stock', stockInput.value)
    stockInput.value = ""
})

timeButtons.forEach((timeButton) => {
    timeButton.addEventListener("click", (e) => {
    Plotly.relayout(stocksGraph, {
        'xaxis.range': [Today.getTime()-e.target.value, Today.getTime()]
    })
   
    
}
)}
);

socket.on('connected', (stocks) => {
    
    console.log(stocks);
    let traces = stocks.map((stock) => {
        addTickerButton(stock.ticker);
        return {
           x:stock.timeRange, y: stock.priceRange, name: stock.ticker,
        type: "scatter" 
        }
    })
    Plotly.plot( stocksGraph, traces, layout, {showLink: false})

    })
  

socket.on("errormsg", (doc) => {
    errorDiv.innerHTML = doc
});


socket.on("addtickerbutton", (doc) => {
    addTickerButton(doc);
    
})


socket.on('removetickerbutton', (ticker) => {
    var elementToDelete = document.getElementById('tickerbutton'+ticker)
    elementToDelete.remove();
})

socket.on("addtickergraph", async (tickerData) => {
    var ticker = tickerData.stock.ticker,
        timeRange = tickerData.stock.timeRange,
        priceRange = tickerData.stock.priceRange;
    
    let stockTrace = {
        x:timeRange, y: priceRange, name: ticker,
        type: "scatter"
    }
    Plotly.addTraces( stocksGraph, [stockTrace])

})

socket.on("removetickergraph", async (ticker) => {
    
    
    var index = stocksGraph.data.map((stock) => stock.name).indexOf(ticker);
    
   Plotly.deleteTraces( stocksGraph, index)

})