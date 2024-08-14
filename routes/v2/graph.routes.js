const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const graph = require("../../controllers/v2/graph");

router.get("/concept/answers/incorrectly", graph.incorrectAnswerConcept);
router.get("/question/answers/incorrectly", graph.incorrectAnswerQuestion);

module.exports = router;
