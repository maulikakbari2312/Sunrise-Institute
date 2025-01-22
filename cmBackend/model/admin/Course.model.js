require("dotenv").config();
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        required: [true, "Course Name is required"],
    },
    courseType: {
        type: String,
        required: [true, "Course Type is required"],
    },
    courseDuration: {
        type: Number,
        required: [true, "Course Duration is required"],
    },
    fees: {
        type: Number,
        required: [true, "Fees For is required"],
    },
    hsn:{
        type: String,
        required: [true, "HSN is required"],
    },
    tokenId: {
        type: String,
        default: () => uuidv4(),
        required: false,
        unique: true, // Make the tokenId field unique
    },
});

const CourseDetail = new mongoose.model("CourseDetail", courseSchema);
module.exports = CourseDetail;
