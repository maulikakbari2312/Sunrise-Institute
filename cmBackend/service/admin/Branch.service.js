require("dotenv").config();
const message = require("../../common/error.message");
const branchModel = require("../../model/admin/Branch.modal");


exports.createBranchDetail = async (branch) => {
    try {
        const createBranchDetail = new branchModel(branch);
        const detail = await createBranchDetail.save();

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


exports.findBranch = async () => {
    try {
        const getBranch = await branchModel.find();

        if (!getBranch || getBranch.length === 0) {
            return {
                status: 404,
                message: message.IMMIGRATION_NOT_FOUND,
            };
        }
        const reversedBranchs = getBranch.reverse();

        return reversedBranchs;

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

exports.findfilterBranch = async (branch) => {
    try {
        const getBranch = await branchModel.find({ branchType: branch });

        if (!getBranch || getBranch.length === 0) {
            return {
                status: 404,
                message: message.IMMIGRATION_NOT_FOUND,
            };
        }
        const reversedBranchs = getBranch.reverse();

        return reversedBranchs;
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

exports.editBranchDetail = async (data, token) => {
    try {
        const editBranch = await branchModel.findOneAndUpdate(
            { tokenId: token },
            data,
            { new: true }
        );

        if (!editBranch) {
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

exports.deleteBranchDetail = async (whereCondition) => {
    try {
        const deleteBranch = await branchModel.deleteOne({
            tokenId: whereCondition,
        });
        if (!deleteBranch) {
            return {
                status: 404,
                message: "Unable to delete branch",
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
