const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const monitoring = require("../../controllers/monitoring/monitoring.controller");

router.get("/class/:class/concepts", auth, monitoring.classMonitoringConcepts);
router.get(
  "/class/:class/questions",
  auth,
  monitoring.classMonitoringQuestions
);
router.get(
  "/class/:class/student/:student/",
  auth,
  monitoring.studentMonitoring
);

module.exports = router;
