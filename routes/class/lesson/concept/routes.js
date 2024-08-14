const express = require("express");
const router = express.Router();
const auth = require("../../../../middlewares/auth.middleware");
const logged = require("../../../../middlewares/logged.middleware");
const concept = require("../../../../controllers/class/concept.controller");

router.get("/", auth, concept.all);
router.post("/create", auth, concept.create);

router.put("/swap", auth, concept.swap);

router.get("/:id", auth, concept.view);
router.put("/:id", auth, concept.update);

module.exports = router;
