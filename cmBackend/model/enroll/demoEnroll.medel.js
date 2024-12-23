const mongoose = require("mongoose");

const demoEnrollSchema = new mongoose.Schema({
    demoDate: {
        type: String,
        required: [true, "Demo Date is required"],
    },
    tokenId: {
        type: String,
        required: [true, "User ID is required"],
        unique: true
    },
});

const DemoEnrollDetail = new mongoose.model("DemoEnrollDetail", demoEnrollSchema);
module.exports = DemoEnrollDetail;
