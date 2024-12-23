const mongoose = require("mongoose");

const counterNumbersDetail = new mongoose.model('counterNumbersDetail', new mongoose.Schema({}, { strict: false })); // Set strict option to false

module.exports = counterNumbersDetail;
