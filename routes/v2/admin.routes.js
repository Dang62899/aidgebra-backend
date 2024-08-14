const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const adminController = require("../../controllers/v2/admin.controller");

router.get("/", auth, adminController.all);
router.get("/paginate", auth, adminController.paginate);
router.get("/:id", auth, adminController.view);
router.post("/", auth, adminController.create);
router.put("/:id", auth, adminController.update);
router.delete("/:id", auth, adminController.delete);

module.exports = router;
