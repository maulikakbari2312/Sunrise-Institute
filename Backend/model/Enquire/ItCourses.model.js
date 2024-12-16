const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const itCoursesSchema = new mongoose.Schema({
    enquire: {
        type: String,
        required: [true, "Enquire is required"],
    },
    enquireDate: {
        type: String,
    },
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    dob: {
        type: String,
        required: [true, "D.O.B is required"],
    },
    status: {
        type: String,
    },
    enquireFor: {
        type: Array,
        required: [true, "Enquire For is required"],
    },
    mobileNumber: {
        type: Number,
        required: [true, "Mobile Number is required"],
    },
    parentMobileNumber: {
        type: Number,
        required: [true, "Parent Mobile Number is required"],
    },
    email: {
        type: String,
    },
    address: {
        type: String,
        required: [true, "Address is required"],
    },
    state: {
        type: String,
        required: [true, "State is required"],
    },
    education: {
        type: String,
        required: [true, "Education is required"],
    },
    suggestedCourse: {
        type: Array,
        required: [true, "Suggested Course is required"],
    },
    enquiryTokenBy: {
        type: String,
        required: [true, "enquiry Token By is required"],
    },
    reference: {
        type: Array,
        required: [true, "Reference is required"],
    },
    referenceName: {
        type: String,
    },
    branch: {
        type: String,
        required: [true, "Branch is required"],
    },
    remark: {
        type: String,
    },
    tokenId: {
        type: String,
        unique: true,
    },
});

const ItCoursesDetail = new mongoose.model("ItCoursesDetail", itCoursesSchema);
module.exports = ItCoursesDetail;
