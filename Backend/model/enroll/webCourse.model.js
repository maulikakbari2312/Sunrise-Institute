const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// Import the Mixed type from Mongoose
const { Schema, model } = mongoose;
const { Mixed } = Schema.Types;

const webCourseSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
    },
    gallery: {
        type: String,
        required: [true, "Gallery is required"],
    },
    dailyHours: {
        type: Number,
        required: [true, "Daily Hours is required"],
    },
    courseDescription: {
        type: String,
        required: [true, "Course Description is required"],
    },
    duration: {
        type: Number,
        required: [true, "Duration is required"],
    },
    modules: {
        type: Mixed, // Use Mixed type for modules
        required: [true, "Modules is required"],
    },
    tokenId: {
        type: String,
        default: () => uuidv4(),
        required: false,
        unique: true, // Make the tokenId field unique
    },
});

const WebCourseDetail = model("WebCourseDetail", webCourseSchema); // Capitalize model name conventionally

module.exports = WebCourseDetail;
