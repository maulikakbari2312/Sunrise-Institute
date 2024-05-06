const message = require("../../common/error.message");
const immigrationModel = require("../../model/Enquire/Immigration.model");
const itCoursesModel = require("../../model/Enquire/ItCourses.model");
const competitiveExamModel = require("../../model/Enquire/CompetitiveExam.model");
const CompleteEnrollDetail = require("../../model/enroll/completeEnroll.model");
const mongoose = require('mongoose');
const { v4: uuidv4 } = require("uuid");

const sendEnquireSchema = new mongoose.Schema({
    tokenId: { type: String, unique: true },
    // other fields...
}, { strict: false });

const SendEnquireModel = mongoose.model('SendEnquire', sendEnquireSchema); // defining the model

exports.findEnquire = async (isAdmin, isBranch) => {
    try {
        let query = {};
        let enquireBranchquery = {};
        if (isAdmin !== 'master') {
            // If the user is not an admin, retrieve data based on the specified branch
            query = { branch: isBranch };
            enquireBranchquery = { enquireBranch: isBranch }
        }

        // Use await to resolve the promises before using their results
        const immigrationStatus = await immigrationModel.find(query).then(data => data.map(item => item.status));
        const itCoursesStatus = await itCoursesModel.find(query).then(data => data.map(item => item.status));
        const competitiveExamStatus = await competitiveExamModel.find(query).then(data => data.map(item => item.status));
        const completeEnroll = await CompleteEnrollDetail.find(enquireBranchquery);
        // Combine all status values into a single array
        const allStatusValues = [...immigrationStatus, ...itCoursesStatus, ...competitiveExamStatus];

        // Count occurrences of each status
        const statusCounts = allStatusValues.reduce((acc, status) => {
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        // Return the counts for each status
        return {
            totalEnquire: allStatusValues.length,
            reject: statusCounts.reject || 0,
            enroll: statusCounts.enroll || 0,
            demo: statusCounts.demo || 0,
            pending: statusCounts.pending || 0,
            completeEnroll: completeEnroll.length,
        };
    } catch (error) {
        console.log('Error:', error);
        throw error;
    }
};

exports.createSendEnquireDetail = async (enquiryDetail) => {
    try {
        const createEnquiryDetail = new SendEnquireModel(enquiryDetail);
        const detail = await createEnquiryDetail.save();

        return {
            status: 200,
            message: 'Enquiry details saved successfully',
        };
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        return {
            status: 500,
            message: "Internal Server Error",
        };
    }
};


exports.findSendEnquire = async (staff) => {
    try {
        const getCourse = await SendEnquireModel.find({ enquiryTokenBy: staff });

        if (!getCourse || getCourse.length === 0) {
            return {
                status: 404,
                message: message.IMMIGRATION_NOT_FOUND,
            };
        }

        const reversedCourses = getCourse.reverse();

        return reversedCourses;
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

exports.editSendEnquireDetail = async (data, token) => {
    try {
        const editCourse = await SendEnquireModel.findOneAndUpdate(
            { tokenId: token },
            data,
            { new: true }
        );

        if (!editCourse) {
            return {
                status: 404,
                message: message.IMMIGRATION_NOT_FOUND,
            };
        }

        return {
            status: 200,
            message: message.IMMIGRATION_DATA_UPDATED,
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

exports.deleteSendEnquireDetail = async (whereCondition) => {
    try {
        const deleteCourse = await SendEnquireModel.deleteOne({
            tokenId: whereCondition,
        });
        if (!deleteCourse) {
            return {
                status: 404,
                message: "Unable to delete course",
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

