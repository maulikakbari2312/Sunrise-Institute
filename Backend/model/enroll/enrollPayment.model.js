const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const enrollPaymentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    course: {
        type: String,
        required: [true, "Course is required"],
    },
    totalFees: {
        type: Number,
        required: [true, "Total Fees is required"],
    },
    paymentType: {
        type: String,
        required: [true, "Payment Type is required"],
    },
    installment: {
        type: Number,
    },
    enrollDate: {
        type: String,
        required: [true, "Enroll Date is required"],
    },
    dob: {
        type: String,
    },
    mobileNumber: {
        type: Number,
    },
    email: {
        type: String,
    },
    allInstallmentDate: {
        type: Array,
    },
    userInstallmentDate: {
        type: Array,
    },
    courseDuration: {
        type: String,
    },
    nextInstallmentDate: {
        type: String,
    },
    pendingInstallmentDate: {
        type: Array,
    },
    duePendingInstallment: {
        type: Number,
    },
    totalPendingInstallment: {
        type: Number,
    },
    installmentAmount: {
        type: Number,
    },
    installmentDate: {
        type: String,
    },
    pendingFees: {
        type: Number,
    },
    discount: {
        type: Number,
    },
    partialPayment: {
        type: Number,
        default: 0,
    },
    payFees: {
        type: Number,
        required: [true, "Pay Fees is required"],
    },
    payInstallment: {
        type: Number,
    },
    enquireBranch: {
        type: String,
        required: [true, "Enquire Branch is required"],
    },
    enquireType: {
        type: String,
        required: [true, "Enquire Type is required"],
    },
    enquireDate: {
        type: String,
        required: [true, "Enquire Date is required"],
    },
    payInstallmentDate: {
        type: Array,
    },
    paymentReceiver: {
        type: Array,
    },
    paymentDetails: {
        type: Array,
    },
    paymentSlipNumber: {
        type: Array,
    },
    enrollNumber: {
        type: String,
    },
    paymentMethod: {
        type: Array,
    },
    tokenId: {
        type: String,
        required: [true, "User ID is required"],
        unique: true
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

const EnrollPaymentDetail = new mongoose.model("EnrollPaymentDetail", enrollPaymentSchema);
module.exports = EnrollPaymentDetail;
