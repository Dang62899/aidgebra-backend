const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const lectureController = require("../../controllers/v2/lecture.controller");

router.get("/", auth, lectureController.all);
router.get("/paginate", auth, lectureController.paginate);
router.get("/:id", auth, lectureController.view);
router.post("/", auth, lectureController.create);
router.put("/:id", auth, lectureController.update);
router.delete("/:id", auth, lectureController.delete);

module.exports = router;
