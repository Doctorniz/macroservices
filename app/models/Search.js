const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const shortSchema = new Schema ({
   terms: String,
   time: {
      type: Date,
      default: Date.now
   }
   
    
});

const ModelClass = mongoose.model('searchterms', shortSchema);

module.exports = ModelClass;