const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const competitiveExamSchema = new mongoose.Schema({
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
    education: {
        type: String,
        required: [true, "Education is required"],
    },
    bachelor: {
        type: String,
    },
    master: {
        type: String,
    },
    educationother: {
        type: String,
    },
    gpsc: {
        type: String,
    },
    psi: {
        type: String,
    },
    class3: {
        type: String,
    },
    reference: {
        type: Array,
        required: [true, "Reference is required"],
    },
    referenceName: {
        type: String,
    },
    suggestedCourse: {
        type: Array,
        required: [true, "Suggested Course is required"],
    },
    enquiryTokenBy: {
        type: String,
        required: [true, "enquiry Token By is required"],
    },
    remark: {
        type: String,
    },
    branch: {
        type: String,
        required: [true, "Branch is required"],
    },
    tokenId: {
        type: String,
        unique: true // Make the tokenId field unique
    },
});

const CompetitiveExamDetail = new mongoose.model("CompetitiveExamDetail", competitiveExamSchema);
module.exports = CompetitiveExamDetail;
