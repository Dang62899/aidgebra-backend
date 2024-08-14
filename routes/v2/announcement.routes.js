const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const announcementController = require("../../controllers/v2/annoucement.controller");

router.get("/init", auth, announcementController.init);
router.get("/", auth, announcementController.view);
router.put("/", auth, announcementController.update);

module.exports = router;
