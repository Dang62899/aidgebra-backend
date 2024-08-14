const express = require("express");
const router = express.Router();
const auth = require("../../../../middlewares/auth.middleware");
const logged = require("../../../../middlewares/logged.middleware");
const pretest = require("../../../../controllers/class/pretest.controller");

router.get("/", auth, pretest.all);
router.post("/", auth, pretest.create);
router.get("/:id", auth, pretest.view);
router.put("/:id", auth, pretest.update);

module.exports = router;
