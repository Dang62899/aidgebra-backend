const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const preTestResultController = require("../../controllers/v2/pretest_result.controller");

router.get("/", auth, preTestResultController.all);
router.get("/paginate", auth, preTestResultController.paginate);
router.get("/:id", auth, preTestResultController.view);
router.post("/", auth, preTestResultController.create);
router.delete("/:id", auth, preTestResultController.delete);

module.exports = router;
