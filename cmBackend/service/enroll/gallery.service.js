require("dotenv").config();
const mongoose = require("mongoose");
const message = require("../../common/error.message");
const galleryModelDetail = require("../../model/enroll/gallery.model");
const webCourseDetail = require("../../model/enroll/webCourse.model");
const contactModelDetail = require("../../model/enroll/contact.model");

exports.createGalleryDetail = async (data) => {
    try {

        const createDesignDetail = new galleryModelDetail(data);
        const detail = await createDesignDetail.save();
        return {
            status: 200,
            message: message.DATA_CREATE_SUCCESS,
        };
    } catch (error) {
        console.log("error", error);
        return {
            status: 500,
            message: "Internal Server Error",
        };
    }
};
exports.createContactDetail = async (data) => {
    try {

        const createDesignDetail = new contactModelDetail(data);
        await createDesignDetail.save();
        return {
            status: 200,
            message: message.DATA_CREATE_SUCCESS,
        };
    } catch (error) {
        console.log("error", error);
        return {
            status: 500,
            message: "Internal Server Error",
        };
    }
};

exports.createWebCourse = async (data) => {
    try {

        const createDesignDetail = new webCourseDetail(data);
        const detail = await createDesignDetail.save();
        return {
            status: 200,
            message: message.DATA_CREATE_SUCCESS,
        };
    } catch (error) {
        console.log("error", error);
        return {
            status: 500,
            message: "Internal Server Error",
        };
    }
};
exports.getGallery = async () => {
    try {

        const gallery = await galleryModelDetail.find();
        return gallery;
    } catch (error) {
        console.log("error", error);
        return {
            status: 500,
            message: "Internal Server Error",
        };
    }
};
exports.getContact = async () => {
    try {
        const gallery = await contactModelDetail.find();
        return gallery;
    } catch (error) {
        console.log("error", error);
        return {
            status: 500,
            message: "Internal Server Error",
        };
    }
};
exports.getWebCourse = async () => {
    try {

        const gallery = await webCourseDetail.find();
        return gallery;
    } catch (error) {
        console.log("error", error);
        return {
            status: 500,
            message: "Internal Server Error",
        };
    }
};
exports.editGallery = async (data, token) => {
    try {
        await galleryModelDetail.findOneAndUpdate(
            { tokenId: token },
            { $set: data },
            { new: true }
        );

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
exports.ediWebCourse = async (data, token) => {
    try {
        await webCourseDetail.findOneAndUpdate(
            { tokenId: token },
            { $set: data },
            { new: true }
        );

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

exports.deleteGallery = async (whereCondition) => {
    try {
        const deleteGallery = await galleryModelDetail.deleteOne({
            tokenId: whereCondition,
        });
        if (!deleteGallery) {
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
exports.deleteWebCourse = async (whereCondition) => {
    try {
        const deleteGallery = await webCourseDetail.deleteOne({
            tokenId: whereCondition,
        });
        if (!deleteGallery) {
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

exports.deleteContact = async (whereCondition) => {
    try {
        const deleteContact = await contactModelDetail.deleteOne({
            tokenId: whereCondition,
        });
        if (!deleteContact) {
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