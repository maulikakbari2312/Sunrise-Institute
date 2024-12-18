const mongoose = require("mongoose");

const counterNumbers = new mongoose.Schema({
    enquireNumber: {
        type: Number,
        default: 0,
    },
    enrollNumber: {
        type: Number,
        default: 0,
    },
    paymentNumber: {
        type: Number,
        default: 0,
    },
    abc: {
        type: Number,
        default: 0,
    },
    sf: {
        type: Number,
        default: 0,
    },
    abcCn: {
        type: Number,
        default: 0,
    },
    sfCn: {
        type: Number,
        default: 0,
    }
});

const counterNumbersDetail = mongoose.model("counterNumbersDetail", counterNumbers);
module.exports = counterNumbersDetail;
