
var http = require('http');
var path = require('path');
const cookieParser = require('cookie-parser');
var express = require('express');
var socketio = require('socket.io');
var app = express();
var router = require('./app/routes/index');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var request = require('request')

require('dotenv').config({ path: 'variables.env' });

mongoose.connect(process.env.DATABASE, (err,db) => {
  if (err) return console.log("error: " + err);
  else console.log("MongoDB connected")
});

app.set('views', path.join(__dirname, 'app/views')); // this is the folder where we keep our pug files
app.set('view engine', 'pug');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

  
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie:{
        httpOnly:false,
        expires:false
    }
}));



app.use(express.static(path.join(__dirname, 'client')));



app.use('/', router);



var server = app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  console.log("App started at ", process.env.IP  + ":" + process.env.PORT);
});

var io = socketio.listen(server);

//scoket.broadcast to get all update or use setting up on connection function emit

let connections = [];
let stocks = [];
var api1 = 'https://www.quandl.com/api/v3/datatables/WIKI/PRICES.json?ticker=',
    api2 = '&qopts.columns=date,open&api_key=JnksNi4hmrCc4xvZQ8nG';

io.on('connection', (socket) => {
  connections.push(socket)
  socket.emit('connected', stocks);
  console.log(connections.length + " connected following connect")
  
  socket.on('disconnect', (data) => {
    connections.splice(connections.indexOf(socket), 1)
    console.log(connections.length + " connected following disconnect")
  })
  
  socket.on('test', (a) => console.log(a));
  
  socket.on('add stock', (ticker) => {
    var uri = api1 + ticker + api2;
    request({uri}, (err, docs, body) => {
        if(err) console.log(err);
        var data = JSON.parse(body);
       if(data.datatable.data.length < 1 || !data.datatable) {
         socket.emit("errormsg", "No such ticker", (err, db) => {
         if (err) console.log (err);
       })}
       if(data.datatable.data.length > 0) {
         stocks.push(ticker);
         console.log("Monitoring " + stocks)
         socket.emit("addtickerbutton", ticker);
         socket.emit("addtickergraph", {
           ticker,
           data: data.datatable.data
         })
         
         
         
       }
    })
    
  })
  
  socket.on('remove stock', (ticker) => {
    stocks.splice(stocks.indexOf(ticker), 1);
    console.log("Monitoring " + stocks)
    socket.emit('removetickerbutton', ticker);
  })
  
})






