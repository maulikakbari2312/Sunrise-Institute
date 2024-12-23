const router = require("express").Router();
const enquireController = require("../../controllers/Enquire/enquireController.controller");

router.get("/findEnquire/:admin/:branch", enquireController.getEnquire);
router.post("/createSendEnquire/:admin/:branch", enquireController.createSendEnquire);
router.post("/findSendEnquire/:admin/:branch", enquireController.getSendEnquire);
router.put("/editSendEnquire/:tokenId/:admin/:branch", enquireController.editSendEnquire);
router.delete("/deleteSendEnquire/:tokenId/:admin/:branch", enquireController.deleteSendEnquire);

module.exports = router;