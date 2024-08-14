const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const teacherController = require("../../controllers/v2/teacher.controller");

router.post("/student/approve", auth, teacherController.approveStudent);
router.post("/student/drop", auth, teacherController.dropStudent);

router.get("/", auth, teacherController.all);
router.get("/paginate", auth, teacherController.paginate);
router.get("/:id", auth, teacherController.view);
router.post("/", auth, teacherController.create);
router.put("/:id", auth, teacherController.update);
router.delete("/:id", auth, teacherController.delete);

module.exports = router;
