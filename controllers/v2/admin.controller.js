const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { adminV2 } = require("../../models/v2/admin.schema");

const adminController = {
  all: async (req, res) => {
    try {
      let filter = {};

      const entry = await adminV2.find(filter);

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  paginate: async (req, res) => {
    const page = req.query.page || 1;

    try {
      const options = {
        sort: { createdAt: "desc" },
        page,
        limit: req.query.count || 10,
      };

      let query = {};

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

      const entry = await adminV2.paginate(query, options);

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  view: async (req, res) => {
    try {
      const entry = await adminV2.findOne({ _id: req.params.id });

      if (!entry) throw "Admin not found";

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  create: async (req, res) => {
    try {
      const data = req.body;

      if (req.user.role != "ADMIN") throw "You are not an admin";

      if (!data.password) throw "Password is required!";
      if (data.password != data.confirm_password) throw "Password not match!";
      if (!data.email) throw "Email is required!";
      if (!data.fullname) throw "Username is required!";
      if (!data.firstname) throw "First Name is required!";
      if (!data.lastname) throw "Last Name is required!";
      if (!data.contact) throw "Contact is required!";

      // check if names are alpha only
      const isAlphaOnly = (str) => /^[a-zA-Z ]+$/.test(str);

      if (!isAlphaOnly(data.firstname))
        throw "First name can only contain letters!";
      if (!isAlphaOnly(data.lastname))
        throw "Last name can only contain letters!";

      if (data.middlename != "" && !isAlphaOnly(data.middlename))
        throw "Middle name can only contain letters!";

      // check if contact number is valid
      const isValidNumber = (number) => /^\d{9}$/.test(number);
      if (!isValidNumber(data.contact))
        throw "Contact number format is invalid!";

      // check if password is alpha numeric and between 8 to 20 characters
      if (data.password.length < 8 || data.password.length > 20)
        throw "Password must be between 8 and 20 characters!";

      const isAlphaNumeric = (str) => /^[a-zA-Z0-9]+$/.test(str);
      if (!isAlphaNumeric(data.password))
        throw "Password can only contain letters and numbers!";

      const password = await bcrypt.hash(data.password, 10);

      const validateEmail = await adminV2.findOne({ email: data.email });
      if (validateEmail) throw "Email is already taken.";

      const entry = await adminV2.create({
        email: data.email,
        password,
        fullname: data.fullname,
        firstname: data.firstname,
        middlename: data.middlename || "",
        lastname: data.lastname,
        contact: data.contact,
      });

      if (!entry) throw "Admin not created";

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  update: async (req, res) => {
    try {
      const data = req.body;

      if (req.user.role != "ADMIN") throw "You are not an admin";

      if (!data.email) throw "Email is required!";
      if (!data.fullname) throw "Username is required!";
      if (!data.firstname) throw "First Name is required!";
      if (!data.lastname) throw "Last Name is required!";
      if (!data.contact) throw "Contact is required!";
      if (!data.status) throw "Status is requried!";

      // check if names are alpha only
      const isAlphaOnly = (str) => /^[a-zA-Z ]+$/.test(str);

      if (!isAlphaOnly(data.firstname))
        throw "First name can only contain letters!";
      if (!isAlphaOnly(data.lastname))
        throw "Last name can only contain letters!";

      if (data.middlename != "" && !isAlphaOnly(data.middlename))
        throw "Middle name can only contain letters!";

      // check if contact number is valid
      const isValidNumber = (number) => /^\d{9}$/.test(number);
      if (!isValidNumber(data.contact))
        throw "Contact number format is invalid!";

      const entry = await adminV2.findOneAndUpdate(
        { _id: req.params.id },
        {
          email: data.email,
          fullname: data.fullname,
          firstname: data.firstname,
          middlename: data.middlename || "",
          lastname: data.lastname,
          contact: data.contact,
          status: data.status,
        },
        { new: true, runValidators: true }
      );

      if (!entry) throw "Admin not found";

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  delete: async (req, res) => {
    try {
      if (req.user.role != "ADMIN") throw "You are not an admin";

      if (!req.params.id) throw "Id is required";

      if (req.params.id == req.user.id) throw "You can't delete yourself";

      // check the email is equal to the main admin's email before deleting
      const superAdmin = await adminV2.findOne({ email: "admin@example.com" });
      if (req.params.id == superAdmin.id)
        throw "You can't delete the main admin";

      const entry = await adminV2.deleteOne({ _id: req.params.id });

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
};

module.exports = adminController;
