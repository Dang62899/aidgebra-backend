const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const assesmentController = require("../../controllers/v2/assesment.controller");

router.get("/", auth, assesmentController.all);
router.get("/paginate", auth, assesmentController.paginate);
router.get("/:id", auth, assesmentController.view);
router.post("/", auth, assesmentController.create);
router.put("/:uuid", auth, assesmentController.update);
router.delete("/:id", auth, assesmentController.delete);

module.exports = router;
