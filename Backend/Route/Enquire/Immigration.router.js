const router = require("express").Router();
const immigrationController = require("../../controllers/Enquire/Immigration.controller");

router.post("/createImmigration/:admin/:branch", immigrationController.createImmigration);
router.get("/findImmigration/:admin/:branch", immigrationController.getImmigration);
router.post("/findFilterImmigration/:admin/:branch", immigrationController.getFilterImmigration);
router.put("/editImmigration/:tokenId/:admin/:branch", immigrationController.editImmigration);
router.put("/editStatusImmigration/:tokenId/:admin/:branch", immigrationController.editStatusImmigration);
router.delete("/deleteImmigration/:tokenId/:admin/:branch", immigrationController.deleteImmigration);

module.exports = router;
