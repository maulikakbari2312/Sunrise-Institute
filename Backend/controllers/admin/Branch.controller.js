require("dotenv").config();
const { verifyUser } = require("../../common/utils");
const branchService = require("../../service/admin/Branch.service");
exports.createBranch = async (req, res) => {
    const isAdmin = req.params.admin
    const isBranch = req.params.branch
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const branchData = await branchService.createBranchDetail(
                req.body,
                isAdmin,
                isBranch
            );

            if (!branchData) {
                throw new Error("Please enter valid branch information!");
            }

            res.status(branchData.status).send(branchData);
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
    } else {
        res.status(401).json({ message: "User Not Valid" });
    }
};

exports.getBranch = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findBranch = await branchService.findBranch(isAdmin, isBranch);
            const response = {
                pageItems: findBranch,
                message: `Total ${findBranch.length || 0} available`,
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
    } else {
        res.status(401).json({ message: "User Not Valid" });
    }
};
exports.getfilterBranch = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const branch = req.params.branch;
            const findBranch = await branchService.findfilterBranch(branch);
            const response = {
                pageItems: findBranch,
                message: `Total ${findBranch.length || 0} available`,
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

exports.editBranch = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin
            const isBranch = req.params.branch
            const token = req.params.tokenId;
            const editBranchData = await branchService.editBranchDetail(
                req.body,
                token,
                isAdmin,
                isBranch
            );

            res.status(editBranchData.status).send(editBranchData);
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

exports.deleteBranch = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin
            const isBranch = req.params.branch
            const token = req.params.tokenId;
            const deleteBranchData = await branchService.deleteBranchDetail(
                token,
                isAdmin,
                isBranch
            );

            res.status(deleteBranchData.status).send(deleteBranchData);
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