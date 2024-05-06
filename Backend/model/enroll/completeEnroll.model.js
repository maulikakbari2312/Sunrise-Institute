const mongoose = require("mongoose");

const CompleteEnrollDetail = new mongoose.model('CompleteEnrollDetail', new mongoose.Schema({}, { strict: false })); // Set strict option to false

module.exports = CompleteEnrollDetail;
