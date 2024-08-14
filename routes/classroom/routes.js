const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const classroom = require("../../controllers/classroom/classroom.controller");

router.post(
  "/class/:class/lesson/:lesson/pretest",
  auth,
  classroom.answerPretest
);
router.post(
  "/class/:class/lesson/:lesson/posttest",
  auth,
  classroom.answerPosttest
);

router.post(
  "/class/:class/lesson/:lesson/concept/:concept/assesment",
  auth,
  classroom.startAssesment
);

router.get(
  "/class/:class/lesson/:lesson/concept/:concept/assesment",
  auth,
  classroom.getAssesmentQuestions
);

router.post(
  "/class/:class/lesson/:lesson/concept/:concept/assesment/:assesment/submit",
  auth,
  classroom.submitAssesmentAnswer
);

router.get("/assessments/:id", auth, classroom.getAssesmentResults);
router.get("/pretest", auth, classroom.getPretestResults);
router.get("/posttest", auth, classroom.getPosttestResults);

module.exports = router;
