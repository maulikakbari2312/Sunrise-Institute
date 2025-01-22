require("dotenv").config();
const router = require("express").Router();
const courseController = require("../../controllers/admin/Course.controller");

router.post("/course/:admin/:branch", courseController.createCourse);
router.get("/courseList/:admin/:branch", courseController.getCourse);
router.get("/findcourse/:course/:admin/:branch", courseController.getfilterCourse);
router.put("/editCourse/:tokenId/:admin/:branch", courseController.editCourse);
router.delete("/deleteCourse/:tokenId/:admin/:branch", courseController.deleteCourse);

module.exports = router;
