require("dotenv").config();
const router = require("express").Router();
const enrollController = require("../../controllers/branch/Branch.controller");

router.get("/getBranchStaff/:admin/:branch", enrollController.getBranchStaff);

module.exports = router;