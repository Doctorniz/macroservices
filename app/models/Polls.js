const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const pollSchema = new Schema ({
   question: String,
   options: [{choice: {type: String, index: true}, results: {type: Number, index: true}}],
   optionsLength: Number,
   user: String,
   slug: String
   
}, {timestamps: true});

const PollModel = mongoose.model('polls', pollSchema);

module.exports = PollModel;