const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const preTestV2 = require("../../controllers/v2/pretest.controller");

router.get("/", auth, preTestV2.all);
router.post("/submit", auth, preTestV2.all);
router.get("/paginate", auth, preTestV2.paginate);
router.get("/:id", auth, preTestV2.view);
router.post("/", auth, preTestV2.create);
router.delete("/:id", auth, preTestV2.delete);

module.exports = router;
