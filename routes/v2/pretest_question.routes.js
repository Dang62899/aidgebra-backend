const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const preTestQuestionController = require("../../controllers/v2/pretest_question.controller");

router.get("/", auth, preTestQuestionController.all);
router.get("/:id", auth, preTestQuestionController.view);
router.post("/", auth, preTestQuestionController.create);
router.put("/:id", auth, preTestQuestionController.update);
router.delete("/:id", auth, preTestQuestionController.delete);

module.exports = router;
