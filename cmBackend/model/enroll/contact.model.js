const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const contactModel = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
    },
    subject: {
        type: String,
        required: [true, "Subject is required"],
    },
    message: {
        type: String,
        required: [true, "Message is required"],
    },
    tokenId: {
        type: String,
        default: () => uuidv4(),
        required: false,
        unique: true, // Make the tokenId field unique
    },
});

const contactModelDetail = new mongoose.model("contactModelDetail", contactModel);
module.exports = contactModelDetail;
