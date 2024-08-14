const express = require("express");
const router = express.Router();
const auth = require("../../../../middlewares/auth.middleware");
const logged = require("../../../../middlewares/logged.middleware");
const posttest = require("../../../../controllers/class/posttest.controller");

router.get("/", auth, posttest.all);
router.post("/", auth, posttest.create);
router.get("/:id", auth, posttest.view);
router.put("/:id", auth, posttest.update);

module.exports = router;
