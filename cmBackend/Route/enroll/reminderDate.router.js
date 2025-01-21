require("dotenv").config();
const router = require("express").Router();
const reminderDate = require("../../controllers/enroll/reminder.controller");

router.post("/createReminder/:admin/:branch", reminderDate.createReminder);
router.get("/findReminder/:admin/:branch", reminderDate.getReminder);
router.delete("/deleteReminder/:tokenId/:admin/:branch", reminderDate.deleteReminder);

module.exports = router;
