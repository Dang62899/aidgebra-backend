const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const conceptQuestionController = require("../../controllers/v2/concept_question.controller");

router.get("/", auth, conceptQuestionController.all);
router.get("/paginate", auth, conceptQuestionController.paginate);
router.get("/:id", auth, conceptQuestionController.view);
router.post("/", auth, conceptQuestionController.create);
router.put("/:id", auth, conceptQuestionController.update);
router.delete("/:id", auth, conceptQuestionController.delete);

module.exports = router;
