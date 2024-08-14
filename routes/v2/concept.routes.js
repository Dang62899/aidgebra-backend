const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const conceptController = require("../../controllers/v2/concept.controller");

router.get("/", auth, conceptController.all);
router.get("/paginate", auth, conceptController.paginate);
router.get("/:id", auth, conceptController.view);
router.post("/", auth, conceptController.create);
router.put("/:id", auth, conceptController.update);
router.delete("/:id", auth, conceptController.delete);

module.exports = router;
