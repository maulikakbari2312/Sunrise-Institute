const { verifyUser } = require("../../common/utils");
const competitiveExamService = require("../../service/Enquire/CompetitiveExam.service");
exports.createCompetitiveExam = async (req, res) => {
    const headers = req.headers["Access_token"];
    const uservalid = await verifyUser(headers);
    if (uservalid == true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const competitiveExamData = await competitiveExamService.createCompetitiveExamDetail(
                req.body,
                isAdmin,
                isBranch
            );

            if (!competitiveExamData) {
                throw new Error("Please enter valid competitiveExam information!");
            }

            res.status(competitiveExamData.status).send(competitiveExamData);
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

exports.getCompetitiveExam = async (req, res) => {
    const headers = req.headers["Access_token"];
    const uservalid = await verifyUser(headers);
    if (uservalid == true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findCompetitiveExam = await competitiveExamService.findCompetitiveExam(isAdmin, isBranch);
            const response = {
                pageItems: findCompetitiveExam,
                message: `Total  ${findCompetitiveExam.length} available`,
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
exports.getFilterCompetitiveExam = async (req, res) => {
    const headers = req.headers["Access_token"];
    const uservalid = await verifyUser(headers);
    if (uservalid == true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findCompetitiveExam = await competitiveExamService.findFilterCompetitiveExam(req.body, isAdmin, isBranch);
            const response = {
                pageItems: findCompetitiveExam,
                message: `Total  ${findCompetitiveExam.length || 0} available`,
            };
            res.status(200).send(response);
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

exports.editCompetitiveExam = async (req, res) => {
    const headers = req.headers["Access_token"];
    const uservalid = await verifyUser(headers);
    if (uservalid == true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const token = req.params.tokenId;
            const editCompetitiveExamData = await competitiveExamService.editCompetitiveExamDetail(
                req.body,
                token,
                isAdmin,
                isBranch
            );

            res.status(editCompetitiveExamData.status).send(editCompetitiveExamData);
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

exports.editStatusCompetitiveExam = async (req, res) => {
    const headers = req.headers["Access_token"];
    const uservalid = await verifyUser(headers);
    if (uservalid == true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const token = req.params.tokenId;
            const editCompetitiveExam = await competitiveExamService.editStatusCompetitiveExamDetail(
                { status: req.body.status },
                token,
                isAdmin,
                isBranch
            );

            res.status(editCompetitiveExam.status).send(editCompetitiveExam);
        } catch (error) {
            if (error.name === "ValidationError") {
                const errorMessages = Object.values(error.errors).map(
                    (err) => err.message
                );
                res.status(400).json({ errorMessages });
            } else {
                res.status(500).json({ error: "Internal Server Error" });
            }
            console.log('====================================');
            console.log(error);
            console.log('====================================');
        }
    }
    else {
        res.status(401).json({ message: "User Not Valid" });
    }
};

exports.deleteCompetitiveExam = async (req, res) => {
    const headers = req.headers["Access_token"];
    const uservalid = await verifyUser(headers);
    if (uservalid == true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const token = req.params.tokenId;
            const deleteCompetitiveExamData = await competitiveExamService.deleteCompetitiveExamDetail(
                token,
                isAdmin,
                isBranch
            );

            res.status(deleteCompetitiveExamData.status).send(deleteCompetitiveExamData);
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
