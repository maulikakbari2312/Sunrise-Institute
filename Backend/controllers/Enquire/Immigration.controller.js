const { verifyUser } = require("../../common/utils");
const immigrationService = require("../../service/Enquire/Immigration.service");
exports.createImmigration = async (req, res) => {
    const headers = req.headers["access_token"];
    const uservalid = await verifyUser(headers);
    if (uservalid == true) {
        const isAdmin = req.params.admin
        const isBranch = req.params.branch
        try {
            const immigrationData = await immigrationService.createImmigrationDetail(
                req.body,
                isAdmin,
                isBranch
            );

            if (!immigrationData) {
                throw new Error("Please enter valid immigration information!");
            }

            res.status(immigrationData.status).send(immigrationData);
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

exports.getImmigration = async (req, res) => {
    const headers = req.headers["access_token"];
    const uservalid = await verifyUser(headers);
    if (uservalid == true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findImmigration = await immigrationService.findImmigration(isAdmin, isBranch);
            const response = {
                pageItems: findImmigration,
                message: `Total ${findImmigration.length || 0} available`,
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
exports.getFilterImmigration = async (req, res) => {
    const headers = req.headers["access_token"];
    const uservalid = await verifyUser(headers);
    if (uservalid == true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findImmigration = await immigrationService.findFilterImmigration(req.body, isAdmin, isBranch);
            const response = {
                pageItems: findImmigration,
                message: `Total ${findImmigration.length || 0} available`,
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

exports.editImmigration = async (req, res) => {
    const headers = req.headers["access_token"];
    const uservalid = await verifyUser(headers);
    if (uservalid == true) {
        try {
            const isAdmin = req.params.admin
            const isBranch = req.params.branch
            const token = req.params.tokenId;
            const editImmigrationData = await immigrationService.editImmigrationDetail(
                req.body,
                token,
                isAdmin,
                isBranch
            );

            res.status(editImmigrationData.status).send(editImmigrationData);
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
exports.editStatusImmigration = async (req, res) => {
    const headers = req.headers["access_token"];
    const uservalid = await verifyUser(headers);
    if (uservalid == true) {
        try {
            const isAdmin = req.params.admin
            const isBranch = req.params.branch
            const token = req.params.tokenId;
            const editImmigrationData = await immigrationService.editStatusImmigrationDetail(
                { status: req.body.status },
                token,
                isAdmin,
                isBranch
            );

            res.status(editImmigrationData.status).send(editImmigrationData);
        } catch (error) {
            console.log(error);
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

exports.deleteImmigration = async (req, res) => {
    const headers = req.headers["access_token"];
    const uservalid = await verifyUser(headers);
    if (uservalid == true) {
        try {
            const isAdmin = req.params.admin
            const isBranch = req.params.branch
            const token = req.params.tokenId;
            const deleteImmigrationData = await immigrationService.deleteImmigrationDetail(
                token,
                isAdmin,
                isBranch
            );

            res.status(deleteImmigrationData.status).send(deleteImmigrationData);
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
