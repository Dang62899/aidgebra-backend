const express = require("express");
const router = express.Router();
const auth = require("../../../../../middlewares/auth.middleware");
const logged = require("../../../../../middlewares/logged.middleware");
const lecture = require("../../../../../controllers/class/lecture.controller");

router.get("/", auth, lecture.all);
router.post("/", auth, lecture.create);
router.get("/:id", auth, lecture.view);
router.put("/:id", auth, lecture.update);

module.exports = router;
