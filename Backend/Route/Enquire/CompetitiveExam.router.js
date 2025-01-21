require("dotenv").config();
const router = require("express").Router();
const competitiveExamController = require("../../controllers/Enquire/CompetitiveExam.controller");

router.post("/createCompetitiveExam/:admin/:branch", competitiveExamController.createCompetitiveExam);
router.get("/findCompetitiveExam/:admin/:branch", competitiveExamController.getCompetitiveExam);
router.post("/findFilterCompetitiveExam/:admin/:branch", competitiveExamController.getFilterCompetitiveExam);
router.put("/editCompetitiveExam/:tokenId/:admin/:branch", competitiveExamController.editCompetitiveExam);
router.put("/editStatusCompetitiveExam/:tokenId/:admin/:branch", competitiveExamController.editStatusCompetitiveExam);
router.delete("/deleteCompetitiveExam/:tokenId/:admin/:branch", competitiveExamController.deleteCompetitiveExam);

module.exports = router;
