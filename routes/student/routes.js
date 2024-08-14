const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const logged = require("../../middlewares/logged.middleware");
const account = require("../../controllers/student/account.controller");
const imageUploader = require("../../helpers/image-upload");

router.post("/register", logged, account.register);
router.post("/login", logged, account.login);

router.put("/update/password", auth, account.changePassword);
router.put("/update/profile", auth, account.changeProfile);
router.put("/update/picture", auth, imageUploader, account.changePicture);

router.post("/join/:code", auth, account.joinClass);
router.delete("/drop/:code", auth, account.dropClass);

router.get("/myclasses", auth, account.myClasses);
router.get("/myclasses/:class/info", auth, account.myClassInfo);

router.get("/paginate", auth, account.paginate);
router.get("/", auth, account.all);
router.post("/create", auth, account.create);
router.get("/:id", auth, account.view);

module.exports = router;
