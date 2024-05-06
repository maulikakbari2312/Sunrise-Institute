const mongoose = require("mongoose");

const counterNumbers = new mongoose.Schema({
    enquireNumber: {
        type: Number,
    },
    enrollNumber: {
        type: Number,
    },
    paymentNumber: {
        type: Number,
    },
});

const counterNumbersDetail = new mongoose.model("counterNumbersDetail", counterNumbers);
module.exports = counterNumbersDetail;
