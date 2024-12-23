const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const paymentSlip = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    course: {
        type: String,
        required: [true, "Course is required"],
    },
    payInstallmentFees: {
        type: Number,
        required: [true, "Pay Installment Fees is required"],
    },
    payFeesDate: {
        type: String,
        required: [true, "Pay Fees Date is required"],
    },
    payFeesFormatFeesDate: {
        type: String,
        required: [true, "Pay Fees Date is required"],
    },
    paymentDetails: {
        type: String,
    },
    payInstallment: {
        type: String,
        required: [true, "Pay Installment is required"],
    },
    paymentReceiver: {
        type: String,
        required: [true, "Pay Installment Fees is required"],
    },
    paymentSlipNumber: {
        unique: true, // Make the tokenId field unique
        type: String,
        required: [true, "Payment Slip Number is required"],
    },
    payInstallmentNumbers: {
        type: Array,
        required: [true, "Pay Installment Number is required"],
    },
    payInstallmentDate: {
        type: Array,
        required: [true, "Pay Installment Date is required"],
    },
    installmentAmount: {
        type: String,
        required: [true, "Installment Amount is required"],
    },
    paymentMethod: {
        type: String,
        required: [true, "Payment Method is required"],
    },
    enquireBranch: {
        type: String,
        required: [true, "Enquire Branch is required"],
    },
    enquireType: {
        type: String,
        required: [true, "Enquire Type is required"],
    },
    state: {
        type: String,
        required: [true, "State is required"],
    },
    filterNone: {
        type: Boolean,
        default: false
    },
    tokenId: {
        type: String,
        required: [true, "user is required"],
    },
    grossPayment: {
        type: Number,
    },
    sGst: {
        type: Number,
    },
    cGst: {
        type: Number,
    },
});

const paymentSlipDetail = new mongoose.model("paymentSlipDetail", paymentSlip);
module.exports = paymentSlipDetail;
