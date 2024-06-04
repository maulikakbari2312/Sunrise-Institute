const { verifyUser } = require("../../common/utils");
const enquireService = require("../../service/Enquire/Enquire.service");
exports.getEnquire = async (req, res) => {
    const headers = req.headers["Access_token"];
    const uservalid = await verifyUser(headers);
    if (uservalid == true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findEnquire = await enquireService.findEnquire(isAdmin, isBranch);
            const response = {
                pageItems: findEnquire,
                message: `Total ${findEnquire.length || 0} available`,
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

exports.deleteSendEnquire = async (req, res) => {
    const headers = req.headers["Access_token"];
    const uservalid = await verifyUser(headers);
    if (uservalid == true) {
        try {
            const isAdmin = req.params.admin
            const isBranch = req.params.branch
            const token = req.params.tokenId;
            const deleteSendEnquireData = await enquireService.deleteSendEnquireDetail(
                token,
            );

            res.status(deleteSendEnquireData.status).send(deleteSendEnquireData);
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


exports.editSendEnquire = async (req, res) => {
    const headers = req.headers["Access_token"];
    const uservalid = await verifyUser(headers);
    if (uservalid == true) {
        try {
            const isAdmin = req.params.admin
            const isBranch = req.params.branch
            const token = req.params.tokenId;
            const editSendEnquireData = await enquireService.editSendEnquireDetail(
                req.body,
                token,
            );

            res.status(editSendEnquireData.status).send(editSendEnquireData);
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

exports.createSendEnquire = async (req, res) => {
    const headers = req.headers["Access_token"];
    const uservalid = await verifyUser(headers);
    if (uservalid == true) {
        const isAdmin = req.params.admin
        const isBranch = req.params.branch
        try {
            const enrollData = await enquireService.createSendEnquireDetail(
                req.body
            );

            if (!enrollData) {
                throw new Error("Please enter valid enroll information!");
            }

            res.status(enrollData.status).send(enrollData);
        } catch (error) {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
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

exports.getSendEnquire = async (req, res) => {
    const staff = req.body.staff;
    const headers = req.headers["Access_token"];
    const uservalid = await verifyUser(headers);
    if (uservalid == true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findSendEnquire = await enquireService.findSendEnquire(staff);
            const response = {
                pageItems: findSendEnquire,
                message: `Total ${findSendEnquire.length || 0} available`,
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
        res.status(401).json(uservalid);
    }
};