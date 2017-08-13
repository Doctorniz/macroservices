const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const gymSchema = new Schema ({
   gymName: String,
   gymGoogleID: String,
   users: [ String ]
}, {timestamps: true});

const GymModel = mongoose.model('gyminfo', gymSchema);

module.exports = GymModel;