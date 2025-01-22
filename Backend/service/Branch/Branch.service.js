require("dotenv").config();
const message = require("../../common/error.message");
const logInDetail = require("../../model/admin/login.model");

exports.findBranchStaff = async (isAdmin, isBranch) => {
    try {
        let query = {};

        // If the user is not an admin, retrieve data based on the specified branch
        if (isAdmin !== 'master') {
            query.branch = isBranch;
        }

        const branchMembers = await logInDetail.find(query);
        if (!branchMembers || branchMembers.length === 0) {
            return {
                status: 404,
                message: message.IMMIGRATION_NOT_FOUND,
            };
        }
        const names = branchMembers.map(member => ({ label: member.name, value: member.email }))

        return names;
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
