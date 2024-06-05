const { verifyUser } = require("../../common/utils");
const courseService = require("../../service/admin/Course.service");
exports.createCourse = async (req, res) => {
    const isAdmin = req.params.admin
    const isBranch = req.params.branch
    const headers = req.headers["access_token"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const courseData = await courseService.createCourseDetail(
                req.body,
                isAdmin,
                isBranch
            );

            if (!courseData) {
                throw new Error("Please enter valid course information!");
            }

            res.status(courseData.status).send(courseData);
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

exports.getCourse = async (req, res) => {
    const headers = req.headers["access_token"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin;
            const isBranch = req.params.branch;
            const findCourse = await courseService.findCourse(isAdmin, isBranch);
            const response = {
                pageItems: findCourse,
                message: `Total ${findCourse.length || 0} available`,
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
exports.getfilterCourse = async (req, res) => {
    const headers = req.headers["access_token"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const course = req.params.course;
            const findCourse = await courseService.findfilterCourse(course);
            const response = {
                pageItems: findCourse,
                message: `Total ${findCourse.length || 0} available`,
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

exports.editCourse = async (req, res) => {
    const headers = req.headers["access_token"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin
            const isBranch = req.params.branch
            const token = req.params.tokenId;
            const editCourseData = await courseService.editCourseDetail(
                req.body,
                token,
                isAdmin,
                isBranch
            );

            res.status(editCourseData.status).send(editCourseData);
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

exports.deleteCourse = async (req, res) => {
    const headers = req.headers["access_token"];
    const uservalid = await verifyUser(headers);
    if (uservalid === true) {
        try {
            const isAdmin = req.params.admin
            const isBranch = req.params.branch
            const token = req.params.tokenId;
            const deleteCourseData = await courseService.deleteCourseDetail(
                token,
                isAdmin,
                isBranch
            );

            res.status(deleteCourseData.status).send(deleteCourseData);
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