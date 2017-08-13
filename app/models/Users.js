const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const userSchema = new Schema ({
   username: String,
   password: String,
   email: String,
   city: String,
   country: String
}, {timestamps: true});

const UserModel = mongoose.model('votingusers', userSchema);

module.exports = UserModel;