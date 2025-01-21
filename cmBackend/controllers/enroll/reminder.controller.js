require("dotenv").config();
const { verifyUser } = require("../../common/utils");
const reminder = require("../../service/enroll/reminderDate.service");
exports.createReminder = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        const isAdmin = req.params.admin
        const isBranch = req.params.branch
        try {
            const reminderData = await reminder.createReminder(
                req.body,
                isAdmin,
                isBranch
            );

            if (!reminderData) {
                throw new Error("Please enter valid Reminder information!");
            }

            res.status(reminderData.status).send(reminderData);
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

exports.getReminder = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findReminder = await reminder.getReminder(isAdmin, isBranch);
            const response = {
                pageItems: findReminder,
                message: `Total ${findReminder.length || 0} available`,
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

exports.deleteReminder = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin
            const isBranch = req.params.branch
            const token = req.params.tokenId;
            const deleteReminderData = await reminder.deleteReminder(
                token,
                isAdmin,
                isBranch
            );

            res.status(deleteReminderData.status).send(deleteReminderData);
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
