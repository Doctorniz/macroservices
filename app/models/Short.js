const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const shortSchema = new Schema ({
   original: String,
   short: String
   
    
}, {timestamps: true});

const ModelClass = mongoose.model('shorturl', shortSchema);

module.exports = ModelClass;