const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const studentController = require("../../controllers/v2/student.controller");

router.post("/class/join", auth, studentController.joinClass);
router.delete("/class/leave", auth, studentController.leaveClass);

router.post("/lectures", auth, studentController.changeLectureType);

router.get("/", auth, studentController.all);
router.get("/paginate", auth, studentController.paginate);
router.get("/:id", auth, studentController.view);
router.post("/", auth, studentController.create);
router.put("/:id", auth, studentController.update);
router.delete("/:id", auth, studentController.delete);

module.exports = router;
