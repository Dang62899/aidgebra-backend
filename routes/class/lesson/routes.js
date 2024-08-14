const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const logged = require("../../../middlewares/logged.middleware");
const lesson = require("../../../controllers/class/lesson.controller");

router.get("/", auth, lesson.all);
router.post("/create", auth, lesson.create);

router.put("/swap", auth, lesson.swap);

router.get("/:id", auth, lesson.view);
router.put("/:id", auth, lesson.update);

module.exports = router;
