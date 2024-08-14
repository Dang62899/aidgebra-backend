const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { admin } = require("../../models/admin/admin.schema");
const mongoose = require("mongoose");

const adminController = {
  paginate: async (req, res) => {
    const page = req.query.page || 1;

    try {
      if (req.user.role != "ADMIN") throw "You are not an admin";

      const options = {
        sort: { createdAt: "desc" },
        page,
        limit: req.body.count || 25,
      };

      let query = {
        role: req.body.role,
        status: req.body.status || "",
      };

      if (req.query.search) {
        let regex = new RegExp(req.query.search, "i");
        query = {
          ...query,
          $and: [
            {
              $or: [{ fullname: regex }, { email: regex }],
            },
          ],
        };
      }

      if (!req.query.roles) delete query["role"];
      if (!req.query.status || req.query.status == "ALL")
        delete query["status"];

      const entry = await admin.paginate(query, options);

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  all: async (req, res) => {
    try {
      if (req.user.role != "ADMIN") throw "You are not an admin";

      const entry = await admin.find({});

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  view: async (req, res) => {
    try {
      if (req.user.role != "ADMIN") throw "You are not an admin";

      const entry = await admin.findOne({ _id: req.params.id });

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  changeUserDetails: async (req, res) => {
    try {
      const data = req.body;
      if (!data.id) throw "User id is required";
      if (!data.email) throw "Email is required";
      if (!data.fullname) throw "Fullname is required";

      if (req.user.role != "ADMIN") throw "You are not an admin";

      const validateEmail = await admin.findOne({
        email: data.email,
        _id: {
          $ne: data.id,
        },
      });

      if (validateEmail) throw "Email is already taken.";

      const entry = await admin.findOneAndUpdate(
        { _id: data.id },
        {
          email: data.email,
          fullname: data.fullname,
          role: data.role || "ADMIN",
          status: data.status || "ACTIVE",
        },
        { new: true }
      );

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  changeProfile: async (req, res) => {
    try {
      const data = req.body;
      if (!data.email) throw "Email is required";
      if (!data.fullname) throw "Fullname is required";

      if (req.user.role != "ADMIN") throw "You are not an admin";

      const validateEmail = await admin.findOne({
        email: data.email,
        _id: {
          $ne: req.user.id,
        },
      });

      if (validateEmail) throw "Email is already taken.";

      const entry = await admin.findOneAndUpdate(
        { _id: req.user.id },
        {
          email: data.email,
          fullname: data.fullname,
//           contact: data.contact,
        },
        { new: true }
      );

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  changePassword: async (req, res) => {
    try {
      const data = req.body;

      if (req.user.role != "ADMIN") throw "You are not an admin";

      if (!data.new_password) throw "Please enter your new Password";
      if (!data.confirm_password) throw "Please confirm new password";
      if (data.confirm_password != data.new_password)
        throw "Password not match!";

      const password = await bcrypt.hash(data.new_password, 10);

      const entry = await admin.findOneAndUpdate(
        { _id: req.user.id },
        { password },
        { new: true }
      );

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  create: async (req, res) => {
    const data = req.body;
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // if (req.user.role != "ADMIN") throw "You are not an admin";

      if (!data.password) throw "Password is required!";
      if (data.password != data.confirm_password) throw "Password not match!";
      if (!data.email) throw "Email is required!";
      if (!data.fullname) throw "Fullname is required!";

      const password = await bcrypt.hash(data.password, 10);

      const validateEmail = await admin.findOne({ email: data.email });
      if (validateEmail) throw "Email is already taken.";

      const entry = await admin.create(
        [
          {
            email: data.email,
            password,
            fullname: data.fullname,
            role: data.role || "ADMIN",
          },
        ],
        { session }
      );

      await session.commitTransaction();
      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      return res.json({ status: false, error });
    } finally {
      session.endSession();
    }
  },
  login: async (req, res) => {
    try {
      if (req.islogged == true)
        throw "You are already logged in, Logout first to change accounts";

      if (!req.body.email) throw "Email is required!";
      if (!req.body.password) throw "Password is required!";

      const plainTextPassword = req.body.password;

      const entry = await admin.findOne({ email: req.body.email }).lean();

      if (!entry) throw "Invalid credentials";
      if (entry.status != "ACTIVE") throw "Your account is deactivated";

      if (await bcrypt.compare(plainTextPassword, entry.password)) {
        const token = jwt.sign(
          {
            id: entry._id,
            email: entry.email,
            role: entry.role,
            fullname: entry.fullname,
            refreshToken: entry.refreshToken,
            status: entry.status,
          },
          process.env.JWT_SECRET
        );

        res.cookie("token", token, {
          httpOnly: true,
          // secure : true,
          // signed : true
        });
        console.log(token);
        return res.json({ status: true, token: token });
      } else {
        return res.json({ status: false, error: "Incorrect password" });
      }
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
};

module.exports = adminController;
