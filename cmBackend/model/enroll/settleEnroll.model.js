const mongoose = require("mongoose");

const SettleEnrollDetail = new mongoose.model('SettleEnrollDetail', new mongoose.Schema({}, { strict: false })); // Set strict option to false

module.exports = SettleEnrollDetail;