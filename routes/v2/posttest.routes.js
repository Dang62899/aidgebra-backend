const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const postTestV2 = require("../../controllers/v2/posttest.controller");

router.get("/", auth, postTestV2.all);
router.get("/paginate", auth, postTestV2.paginate);
router.get("/:id", auth, postTestV2.view);
router.post("/", auth, postTestV2.create);
router.delete("/:id", auth, postTestV2.delete);

module.exports = router;
