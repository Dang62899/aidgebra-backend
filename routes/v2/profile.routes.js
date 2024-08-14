const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const profileController = require("../../controllers/v2/profile.controller");
const imageUploader = require("../../helpers/image-upload");

router.put("/info/update", auth, profileController.changeUserDetails);
router.put("/password/update", auth, profileController.changePassword);
router.put(
  "/avatar/update",
  auth,
  imageUploader,
  profileController.changePicture
);

module.exports = router;
