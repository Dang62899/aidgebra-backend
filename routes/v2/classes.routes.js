const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const classController = require("../../controllers/v2/classes.controller");

router.get("/", auth, classController.all);
router.get("/paginate", auth, classController.paginate);
router.get("/:id", auth, classController.view);
router.post("/", auth, classController.create);
router.put("/:id", auth, classController.update);
router.delete("/:id", auth, classController.delete);

module.exports = router;
