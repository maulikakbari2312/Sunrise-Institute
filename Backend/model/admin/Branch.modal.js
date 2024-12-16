const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const branchSchema = new mongoose.Schema({
    branchName: {
        type: String,
        required: [true, "Branch Name is required"],
    },
    branchAddress: {
        type: String,
        required: [true, "Branch Address is required"],
    },
    branchPhoneNumber: {
        type: Number,
        required: [true, "Branch Phone Number is required"],
    },
    branchGSTNumber: {
        type: String,
        required: [true, "Branch GST Number is required"],
    },
    igst: {
        type: Number,
        required: [true, "IGST is required"],
    },
    cgst: {
        type: Number,
        required: [true, "CGST is required"],
    },
    sgst: {
        type: Number,
        required: [true, "SGST is required"],
    },
    pan: {
        type: String,
        required: [true, "PAN is required"],
    },
    tokenId: {
        type: String,
        default: () => uuidv4(),
        required: false,
        unique: true, // Make the tokenId field unique
    },
});

const BranchDetail = new mongoose.model("BranchDetail", branchSchema);
module.exports = BranchDetail;
