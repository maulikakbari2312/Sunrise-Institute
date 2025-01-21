require("dotenv").config();
const mongoose = require("mongoose");
const validator = require("validator");
const { v4: uuidv4 } = require("uuid");

const logInSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: function (password) {
                const uppercaseRegex = /[A-Z]/;
                const numberRegex = /[0-9]/;
                const specialCharRegex = /[!@#$%^&*()_+[\]{};:'",.<>?\\|~`-]/;

                if (
                    uppercaseRegex.test(password) &&
                    numberRegex.test(password) &&
                    specialCharRegex.test(password)
                ) {
                    return true;
                } else {
                    throw new Error("Password must contain at least one uppercase letter, one number, and one special character.");
                }
            },
        },
    },
    email: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email");
            }
        },
    },
    phoneNumber: {
        type: Number,
        min: 10,
        required: true,
    },
    role: {
        type: String,
        required: true,
        default: null,
    },
    branch: {
        type: String,
        required: true,
        default: null,
    },
    token: {
        type: String,
        required: false,
    },
    tokenId: {
        type: String,
        default: () => uuidv4(),
        required: false,
        unique: true, // Make the tokenId field unique
    },
});

const logInDetail = new mongoose.model("LogInDetail", logInSchema);
module.exports = logInDetail;
