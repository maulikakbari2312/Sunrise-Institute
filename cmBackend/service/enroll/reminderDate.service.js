require("dotenv").config();
const { default: mongoose } = require("mongoose");
const message = require("../../common/error.message");
const enrollModel = require("../../model/enroll/enrollPayment.model");
const CompleteEnrollDetail = require("../../model/enroll/completeEnroll.model");
const axios = require('axios');
const logInDetail = require("../../model/admin/login.model");
const paymentRemainderDetail = require("../../model/enroll/paymentRemainder.model");

exports.createReminder = async (reminder, isAdmin, isBranch) => {
    try {
        // Include isBranch in the reminder object
        const userExist = await paymentRemainderDetail.findOne({ tokenId: reminder.tokenId })
        if (userExist) {
            return {
                status: 402,
                message: message.UNIQUE_USER,
            };
        }
        const createReminder = new paymentRemainderDetail(reminder);
        const detail = await createReminder.save();
        return {
            status: 200,
            message: message.DATA_ADD,
        };
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');

        if (error instanceof mongoose.Error.ValidationError) {
            const errorMessages = [];

            // Loop through the validation errors and push corresponding messages
            for (const key in error.errors) {
                if (error.errors.hasOwnProperty(key)) {
                    errorMessages.push({
                        field: key,
                        message: error.errors[key].message,
                    });
                }
            }

            return {
                status: 400,
                message: "Validation Error",
                errors: errorMessages,
            };
        } else {
            console.error(error);  // Log the unexpected error for further investigation
            return {
                status: 500,
                message: "Internal Server Error",
            };
        }
    }
};

exports.getReminder = async (isAdmin, isBranch) => {
    try {
        let query = {};
        if (isAdmin !== 'master') {
            // If the user is not an admin, retrieve data based on the specified branch
            query = { enquireBranch: isBranch };
        }

        query.reminderDate = { $lte: new Date().toISOString() }; // Selects documents where reminderDate is less than or equal to the current date
        const getImmigration = await paymentRemainderDetail.find(query);
        if (!getImmigration || getImmigration.length === 0) {
            return {
                status: 404,
                message: message.IMMIGRATION_NOT_FOUND,
            };
        }

        const reversedImmigration = getImmigration.reverse();

        return reversedImmigration;
    } catch (error) {
        console.log('====================================');
        console.log(error, error instanceof mongoose.Error.ValidationError);
        console.log('====================================');

        if (error instanceof mongoose.Error.ValidationError) {
            const errorMessages = [];

            // Loop through the validation errors and push corresponding messages
            for (const key in error.errors) {
                if (error.errors.hasOwnProperty(key)) {
                    errorMessages.push({
                        field: key,
                        message: error.errors[key].message,
                    });
                }
            }

            return {
                status: 400,
                message: "Validation Error",
                errors: errorMessages,
            };
        } else {
            console.error(error);  // Log the unexpected error for further investigation
            return {
                status: 500,
                message: "Internal Server Error",
            };
        }
    }
};

exports.deleteReminder = async (whereCondition) => {
    try {
        const deleteImmigration = await paymentRemainderDetail.deleteOne({
            tokenId: whereCondition,
        });
        if (!deleteImmigration) {
            return {
                status: 404,
                message: "Unable to delete reminder",
            };
        }
        return {
            status: 200,
            message: message.IMMIGRATION_DELETE,
        };
    } catch (error) {
        console.log('====================================');
        console.log(error, error instanceof mongoose.Error.ValidationError);
        console.log('====================================');

        if (error instanceof mongoose.Error.ValidationError) {
            const errorMessages = [];

            // Loop through the validation errors and push corresponding messages
            for (const key in error.errors) {
                if (error.errors.hasOwnProperty(key)) {
                    errorMessages.push({
                        field: key,
                        message: error.errors[key].message,
                    });
                }
            }

            return {
                status: 400,
                message: "Validation Error",
                errors: errorMessages,
            };
        } else {
            console.error(error);  // Log the unexpected error for further investigation
            return {
                status: 500,
                message: "Internal Server Error",
            };
        }
    }
};
