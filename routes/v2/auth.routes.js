const express = require("express");
const router = express.Router();
const logged = require("../../middlewares/logged.middleware");
const authController = require("../../controllers/v2/auth.controller");

router.post("/register", logged, authController.register);
router.post("/login", logged, authController.login);
router.get("/verify", authController.verifyEmail)
router.get("/forgotpassword/link", authController.sendResetpasswordLink)
router.post("/forgotpassword/save", authController.forgotpassword)

module.exports = router;
