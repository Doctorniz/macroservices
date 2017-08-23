const mongoose = require('mongoose');
const request = require('request');

const Books = require('../models/Books');

var Googlekey ='AIzaSyD7jrJ1GBKQh97oiEJ2LI5R_W6ctVsfQbg';

exports.allBooks = (req, res) => {
    var allBooks = Books.find({}, (err,books) =>{
        if(err) return res.render("Books", {loggedIn: req.session.user, error: "Error finding book", inboxOutbox: req.session.inboxOutbox})
        req.session.back = req.originalUrl;
        res.render('Books', {
            Books: books,
            loggedIn: req.session.user,
            inboxOutbox: req.session.inboxOutbox
        })
    })
    //res.render('allBooks');
}

exports.myBooks = (req, res) => {
    if(!req.session.user) return res.redirect('/login');
    var myBooks = Books.find({owner: req.session.user}, (err,books) =>{
        if(err) return res.render("Books", {loggedIn: req.session.user, error: "Error finding book", inboxOutbox: req.session.inboxOutbox})
        req.session.back = req.originalUrl;
        res.render('Books', {
            Books: books,
            loggedIn: req.session.user,
            inboxOutbox: req.session.inboxOutbox
        })
    })
}



exports.addBookStart = (req, res) => {
    req.session.back = req.originalUrl;
    res.render('addBook', {
        loggedIn: req.session.user,
        inboxOutbox: req.session.inboxOutbox
    });
}

exports.displayPrevSearch = (req, res) => {
    if(req.session.bookData && req.session.bookSearchTerm) {
        req.session.back = req.originalUrl;
        res.render('addBook', {
            BookData: req.session.bookData,
            loggedIn: req.session.user,
            bookSearchTerm: req.session.bookSearchTerm,
            inboxOutbox: req.session.inboxOutbox
        }) 
    } else {
        req.session.back = req.originalUrl;
        res.render('addBook', {
            loggedIn: req.session.user,
            inboxOutbox: req.session.inboxOutbox
        })
    }
}

exports.searchBooks = (req, res) => {
    var bookSearchTerm = req.body.bookSearch;
    var uri = 'https://www.googleapis.com/books/v1/volumes?q='+bookSearchTerm+'&key='+Googlekey;
    request({uri}, async (err, Data) => {
        if(err) return res.send(err);
        var data = JSON.parse(Data.body)
        var BookData = []
       var arrLength = data.totalItems < 5 ? data.totalItems : 5;
       for(let i = 0; i < arrLength; i++) {
          let BookImage = data.items[i].volumeInfo.imageLinks ? data.items[i].volumeInfo.imageLinks.thumbnail : ''
          let BookDescription = data.items[i].volumeInfo.description ? data.items[i].volumeInfo.description : ''
          let BookAuthor = data.items[i].volumeInfo.authors ? data.items[i].volumeInfo.authors[0] : 'No author'
          await BookData.push( {
            BookName: data.items[i].volumeInfo.title,
            BookAuthor,
            BookID: data.items[i].id,
            BookDescription,
            BookImage
          })
        }
        req.session.bookData = BookData;
        req.session.bookSearchTerm = bookSearchTerm;
        req.session.back = req.originalUrl;
        res.render('addBook', {
            BookData,
            loggedIn: req.session.user,
            bookSearchTerm,
            inboxOutbox: req.session.inboxOutbox
        });
    })
}

exports.addBook = async (req, res) => {
    if(!req.session.user) return res.redirect('/login');
    var object = JSON.parse(req.body.BookData)
    object.owner = req.session.user ? req.session.user : 0
    object.requestors = [];
    
    var dataSave = await new Books(object);
    await dataSave.save(err => {
        if(err) return res.render("addBook", {
            loggedIn: req.session.user,
            inboxOutbox: req.session.inboxOutbox
        })
    })
    return res.redirect('/books');
    
}

exports.requestBook = async (req, res) => {
    var Book = JSON.parse(req.body.BookData)

    
    var requestBook = await Books.findOneAndUpdate({BookID:Book.BookID, owner:Book.owner}, 
    {$push: {requestors: req.session.user}}, (err, db) => {
        if(err) return res.send("err" + err)
        res.redirect('/books')
    });
}

exports.removeRequest = async (req, res) => {
    var Book = JSON.parse(req.body.BookData)
    var requestBook = await Books.findOneAndUpdate({BookID:Book.BookID, owner:Book.owner}, 
    {$pull: {requestors: req.session.user}}, (err, db) => {
        if(err) return res.send("err" + err)
        res.redirect('/books')
    });
}
    
exports.requestInbox = (req, res) => {
    if(!req.session.user) return res.redirect('/login');
    var myInRequests = Books.find({owner: req.session.user, requestors: {$exists: true}}, (err,books) =>{
        if(err) return res.send("error finding book")
        res.render('Books', {
            Books: books,
            loggedIn: req.session.user,
            inboxOutbox: req.session.inboxOutbox
        })
    })
}

exports.requestOutbox = (req, res) => {
    if(!req.session.user) return res.redirect('/login');
    var myOutRequests = Books.find({requestors: {$in: [req.session.user]}}, (err,books) =>{
        if(err) return res.send("error finding book")
        res.render('Books', {
            Books: books,
            loggedIn: req.session.user,
            inboxOutbox: req.session.inboxOutbox
        })
    })
}

exports.deleteBook = (req, res) => {
    var Book = JSON.parse(req.body.BookData)
    var deleteBook = Books.findOneAndRemove({owner: req.session.user, BookID:Book.BookID }, (err,book) =>{
        if(err) return res.send("error deleting book")
        res.redirect('/mybooks');
    })
}

exports.inboxOutbox = async (req,res, next) => {
    if (!req.session.user) return next();
    var inboxOutbox = Books.find({}, (err, books) => {
        var inOutObj = {
            requestsIn: 0,
            requestsOut: 0
        }
        books.forEach(async (book) => {
            if(book.owner === req.session.user && book.requestors.length > 0 && !book.tradeRequestAccepted) {
                inOutObj.requestsIn = inOutObj.requestsIn + book.requestors.length  
            }
            if(book.requestors.includes(req.session.user) && !book.tradeRequestAccepted) {
                inOutObj.requestsOut = inOutObj.requestsOut + 1
            }
        })
        req.session.inboxOutbox =  inOutObj
        next();
    })
}

exports.tradeRequests = (req, res) => {
    if(!req.session.user) return res.redirect('/login');
    var myInRequests = Books.find({owner: req.session.user, requestors: {$exists: true}}, (err,books) =>{
        if(err) return res.send("error finding book")
        res.render('tradeRequests', {
            Books: books,
            loggedIn: req.session.user,
            inboxOutbox: req.session.inboxOutbox
        })
    })
}

exports.acceptTrade = (req, res) => {
    Books.findOneAndUpdate({_id: req.body.BookDBID}, 
    {"$set": { "tradeRequestAccepted": req.body.requestor}},
    (err, db) => {
        if(err) return res.send("err " + err );
        return res.redirect('/requestInbox');
    })
}