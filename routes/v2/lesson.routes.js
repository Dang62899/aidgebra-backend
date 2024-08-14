const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const lessonRoutes = require("../../controllers/v2/lesson.controller");

router.get("/", auth, lessonRoutes.all);
router.get("/paginate", auth, lessonRoutes.paginate);
router.get("/:id", auth, lessonRoutes.view);
router.post("/", auth, lessonRoutes.create);
router.put("/:id", auth, lessonRoutes.update);
router.delete("/:id", auth, lessonRoutes.delete);

module.exports = router;
