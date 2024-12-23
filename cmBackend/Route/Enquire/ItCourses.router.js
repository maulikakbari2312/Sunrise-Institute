const router = require("express").Router();
const itCoursesController = require("../../controllers/Enquire/ItCourses.controller");

router.post("/createItCourses/:admin/:branch", itCoursesController.createItCourses);
router.get("/findItCourses/:admin/:branch", itCoursesController.getItCourses);
router.post("/findFilteritCourses/:admin/:branch", itCoursesController.getFilteritCourses);
router.put("/editItCourses/:tokenId/:admin/:branch", itCoursesController.editItCourses);
router.put("/editStatusItCourses/:tokenId/:admin/:branch", itCoursesController.editStatusItCourses);
router.delete("/deleteItCourses/:tokenId/:admin/:branch", itCoursesController.deleteItCourses);

module.exports = router;
