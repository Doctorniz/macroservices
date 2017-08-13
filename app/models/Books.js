const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const bookSchema = new Schema ({
   BookName: String,
   BookAuthor: String,
   BookID: String,
   BookDescription: String,
   BookImage: String,
   owner: String,
   requestors: [String],
   tradeRequestAccepted: String
}, {timestamps: true});

const BookModel = mongoose.model('booksinfo', bookSchema);

module.exports = BookModel;