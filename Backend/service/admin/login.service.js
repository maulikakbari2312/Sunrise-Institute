require("dotenv").config();
const message = require("../../common/error.message");
const logInDetail = require("../../model/admin/login.model");

exports.loginService = async (data, userToken) => {
    try {
        const getUser = await logInDetail.find();

        for (const ele of getUser) {
            if (ele.email.toLocaleLowerCase() === data.email.toLocaleLowerCase()) {
                return {
                    status: 400,
                    message: "User email cannot be the same!",
                };
            }
        }

        const detail = {
            name: data.name,
            password: data.password,
            email: data.email,
            phoneNumber: data.phoneNumber,
            role: data.role,
            branch: data.branch,
            token: userToken,
        };
        const createSuperAdmin = new logInDetail(detail);
        const createData = await createSuperAdmin.save();
        return {
            status: 200,
            message: message.USER_CREATED,
            data: createData,
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

exports.findUser = async (userData) => {
    try {
        const user = await logInDetail.findOne(userData);
        return user;
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

exports.findUserRoles = async () => {
    try {
        const user = await logInDetail.find();

        if (!user) {
            return {
                status: 400,
                message: message.USER_NOT_FOUND,
            };
        }
        const reverseduser = user.reverse();

        return reverseduser;
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

exports.editUserDetail = async (data, token) => {
    try {
        const getUserEmail = await logInDetail.findOne({ email: data.email });
        if (
            getUserEmail &&
            getUserEmail.tokenId !== token &&
            getUserEmail.email.toLocaleLowerCase() === data.email.toLocaleLowerCase()
        ) {
            return {
                status: 400,
                message: "User email cannot be the same!",
            };
        }

        const userData = {
            name: data.name,
            password: data.password,
            email: data.email,
            phoneNumber: data.phoneNumber,
            role: data.role,
            branch: data.branch,
        };

        const userToUpdate = await logInDetail.findOne({ tokenId: token });

        if (!userToUpdate) {
            return {
                status: 404,
                message: "User not found",
            };
        }

        userToUpdate.set(userData);

        // When updating records in MongoDB using Mongoose, the validation is not automatically triggered.
        //  However, you can manually trigger validation by calling the validate method on the instance before saving it.
        //  Here's an updated version of your code:

        const validationError = userToUpdate.validateSync();
        if (validationError) {
            const errorMessage =
                validationError.errors[Object.keys(validationError.errors)[0]].message;
            return {
                status: 400,
                message: errorMessage,
            };
        }
        const editUser = await userToUpdate.save();
        return {
            status: 200,
            message: "User data updated successfully",
            data: editUser,
        };
    } catch (error) {
        console.log("==error===", error);
        return {
            status: 500,
            message: "Internal Server Error",
        };
    }
};

exports.deleteUserDetail = async (whereCondition) => {
    try {
        const deleteUser = await logInDetail.deleteOne({
            tokenId: whereCondition,
        });
        if (!deleteUser) {
            return {
                status: 404,
                message: "Unable to delete User",
            };
        }
        return {
            status: 200,
            message: message.USER_DELETE,
            data: deleteUser,
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
