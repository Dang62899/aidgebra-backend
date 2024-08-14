const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const logged = require("../../middlewares/logged.middleware");
const classes = require("../../controllers/class/classes.controller");

router.get("/paginate", auth, classes.paginate);
router.get("/", auth, classes.all);
router.post("/create", auth, classes.create);

router.get("/:id", auth, classes.view);
router.put("/:id", auth, classes.update);

module.exports = router;
