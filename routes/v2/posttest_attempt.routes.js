const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const postTestAttemptController = require("../../controllers/v2/posttest_attempt.controller");

router.get("/", auth, postTestAttemptController.all);
router.get("/paginate", auth, postTestAttemptController.paginate);
router.get("/:id", auth, postTestAttemptController.view);
router.post("/", auth, postTestAttemptController.create);
router.delete("/:id", auth, postTestAttemptController.delete);

module.exports = router;
