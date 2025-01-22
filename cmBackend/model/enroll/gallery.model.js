require("dotenv").config();
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const galleryModel = new mongoose.Schema({
    gallery: {
        type: String,
        required: [true, "Image is required"],
    },
    tokenId: {
        type: String,
        default: () => uuidv4(),
        required: false,
        unique: true, // Make the tokenId field unique
    },
});

const galleryModelDetail = new mongoose.model("galleryModelDetail", galleryModel);
module.exports = galleryModelDetail;
