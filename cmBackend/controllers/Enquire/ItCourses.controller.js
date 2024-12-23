const { verifyUser } = require("../../common/utils");
const itCoursesService = require("../../service/Enquire/ItCourses.service");
exports.createItCourses = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const itCoursesData = await itCoursesService.createItCoursesDetail(
                req.body,
                isAdmin,
                isBranch
            );

            if (!itCoursesData) {
                throw new Error("Please enter valid itCourses information!");
            }

            res.status(itCoursesData.status).send(itCoursesData);
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

exports.getItCourses = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findItCourses = await itCoursesService.findItCourses(isAdmin, isBranch);
            const response = {
                pageItems: findItCourses,
                message: `Total  ${findItCourses.length} available`,
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

exports.getFilteritCourses = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findItCourses = await itCoursesService.findFilterItCourses(req.body, isAdmin, isBranch);
            const response = {
                pageItems: findItCourses,
                message: `Total  ${findItCourses.length || 0} available`,
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

exports.editItCourses = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const token = req.params.tokenId;
            const editItCoursesData = await itCoursesService.editItCoursesDetail(
                req.body,
                token,
                isAdmin,
                isBranch
            );

            res.status(editItCoursesData.status).send(editItCoursesData);
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

exports.editStatusItCourses = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const token = req.params.tokenId;
            const editImmigrationData = await itCoursesService.editStatusItCoursesDetail(
                { status: req.body.status },
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
            console.log('====================================');
            console.log(error);
            console.log('====================================');
        }
    }
    else {
        res.status(401).json({ message: "User Not Valid" });
    }
};

exports.deleteItCourses = async (req, res) => {
    const headers = req.headers["authorization"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const token = req.params.tokenId;
            const deleteItCoursesData = await itCoursesService.deleteItCoursesDetail(
                token,
                isAdmin,
                isBranch
            );

            res.status(deleteItCoursesData.status).send(deleteItCoursesData);
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
