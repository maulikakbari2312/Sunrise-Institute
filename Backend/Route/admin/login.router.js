require("dotenv").config();
const router = require("express").Router();
const logInController = require("../../controllers/admin/login.controller");

router.post("/signUp/:admin/:branch", logInController.signUp);
router.get("/UserList", logInController.getUsers);
router.post("/logIn", logInController.logIn);
router.put("/editUserList/:tokenId", logInController.editUser);
router.delete("/deleteUserList/:tokenId/:admin/:branch", logInController.deleteUser);

module.exports = router;
