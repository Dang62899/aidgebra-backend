const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const logged = require("../../middlewares/logged.middleware");
const account = require("../../controllers/admin/account.controller");

router.post("/login", logged, account.login);

router.put("/update/password", auth, account.changePassword);
router.put("/update/profile", auth, account.changeProfile);
router.put("/update/user/details", auth, account.changeUserDetails);

router.get("/paginate", auth, account.paginate);
router.get("/", auth, account.all);
router.post("/create", auth, account.create);

router.get("/:id", auth, account.view);

module.exports = router;
