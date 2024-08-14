const express = require("express");
const router = express.Router();
const auth = require("../../../../../middlewares/auth.middleware");
const logged = require("../../../../../middlewares/logged.middleware");
const question = require("../../../../../controllers/class/question.controller");

router.get("/", auth, question.all);
router.post("/", auth, question.create);
router.get("/:id", auth, question.view);
router.put("/:id", auth, question.update);
router.delete("/:id", auth, question.delete);

module.exports = router;
