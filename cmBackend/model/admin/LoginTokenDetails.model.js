const mongoose = require("mongoose");

const LoginTokenDetails = new mongoose.model('LoginTokenDetails', new mongoose.Schema({}, { strict: false })); // Set strict option to false

module.exports = LoginTokenDetails;