const { verifyUser } = require("../../common/utils");
const branchStaffService = require("../../service/Branch/Branch.service");
exports.getBranchStaff = async (req, res) => {
    const headers = req.headers["access_token"];
    const uservalid = await verifyUser(headers);
    if (uservalid == true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findBranchStaff = await branchStaffService.findBranchStaff(isAdmin, isBranch);
            const response = {
                pageItems: findBranchStaff,
                message: `Total ${findBranchStaff.length || 0} available`,
            };
            res.status(200).send(response);
        } catch (error) {
            if (error.name === "ValidationError") {
                const errorMessages = Object.values(error.errors).map(
                    (err) => err.message
                );
                res.status(400).json({ errorMessages });
            } else {
                res.status(500).json({ error: "Internal Server Error" });
            }
        }
    }
    else {
        res.status(401).json({ message: "User Not Valid" });
    }
};