const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");
const { adminV2 } = require("../../models/v2/admin.schema");

// Initialize the admin account
router.get("/init", async (req, res) => {
  try {
    const bcrypt = require("bcrypt");

    const data = {
      email: "admin@example.com",
      password: "admin@example.com",
      fullname: "Admin",
      contact: "123456789",
    };

    const password = await bcrypt.hash(data.password, 10);

    const validateEmail = await adminV2.findOne({ email: data.email });
    if (validateEmail) throw "Email is already taken.";

    const entry = await adminV2.create([
      {
        email: data.email,
        password,
        fullname: data.fullname,
        contact: data.contact,
      },
    ]);
    return res.json({ status: true, data: entry });
  } catch (error) {
    console.log(error);
    return res.json({ status: false, error });
  }
});

// Gets the logged in user
router.get("/me", auth, async (req, res) => {
  try {
    return res.json({ status: true, data: req.user });
  } catch (error) {
    console.log(error);
    return res.json({ status: true, error });
  }
});

module.exports = router;
