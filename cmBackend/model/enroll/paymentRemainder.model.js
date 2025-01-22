require("dotenv").config();
const mongoose = require("mongoose");

const paymentRemainder = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    course: {
        type: String,
        required: [true, "Course is required"],
    },
    reminderDate: {
        type: String,
        required: [true, "Reminder Date is required"],
    },
    enquireBranch: {
        type: String,
        required: [true, "Enquire Branch is required"],
    },
    tokenId: {
        unique: true,// Make the tokenId field unique
        type: String,
        required: [true, "user is required"],
    }
});

const paymentRemainderDetail = new mongoose.model("paymentRemainderDetail", paymentRemainder);
module.exports = paymentRemainderDetail;
