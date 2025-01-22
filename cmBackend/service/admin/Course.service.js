require("dotenv").config();
const message = require("../../common/error.message");
const courseModel = require("../../model/admin/Course.model");


exports.createCourseDetail = async (course) => {
    try {
        const createCourseDetail = new courseModel(course);
        const detail = await createCourseDetail.save();

        return {
            status: 200,
            message: message.ENQUIRE_IMMIGRATION_CREATED,
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


exports.findCourse = async () => {
    try {
        const getCourse = await courseModel.find();

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

exports.findfilterCourse = async (course) => {
    try {
        const getCourse = await courseModel.find({ courseType: course });

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

exports.editCourseDetail = async (data, token) => {
    try {
        const editCourse = await courseModel.findOneAndUpdate(
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

exports.deleteCourseDetail = async (whereCondition) => {
    try {
        const deleteCourse = await courseModel.deleteOne({
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
