const router = require("express").Router();
const courseController = require("../../controllers/admin/Branch.controller");

router.post("/branch/:admin/:branch", courseController.createBranch);
router.get("/branchList/:admin/:branch", courseController.getBranch);
router.put("/editBranch/:tokenId/:admin/:branch", courseController.editBranch);
router.delete("/deleteBranch/:tokenId/:admin/:branch", courseController.deleteBranch);

module.exports = router;
