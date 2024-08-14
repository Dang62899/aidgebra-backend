const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const postTestQuestionController = require("../../controllers/v2/posttest_question.controller");

router.get("/", auth, postTestQuestionController.all);
router.get("/paginate", auth, postTestQuestionController.paginate);
router.get("/:id", auth, postTestQuestionController.view);
router.post("/", auth, postTestQuestionController.create);
router.put("/:id", auth, postTestQuestionController.update);
router.delete("/:id", auth, postTestQuestionController.delete);

module.exports = router;
