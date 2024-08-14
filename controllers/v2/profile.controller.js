const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { adminV2 } = require("../../models/v2/admin.schema");
const { teacherV2 } = require("../../models/v2/teacher.schema");
const { studentV2 } = require("../../models/v2/student.schema");

const profileController = {
  changeUserDetails: async (req, res) => {
    try {
      const data = req.body;
      const user = req.user;

      if (!data.email) throw "Email is required";
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

      // Excempt the user's email from the validation update
      const filterSelfEmail = {
        email: data.email,
        _id: {
          $ne: user.id,
        },
      };

      // The data to update
      const updateData = {
        id: { _id: user.id },
        payload: {
          email: data.email,
          fullname: data.fullname,
          firstname: data.firstname,
          middlename: data.middlename || "",
          lastname: data.lastname,
          contact: data.contact,
        },
        options: { new: true, runValidators: true },
      };

      let entry = null;
      let validateEmail = null;

      switch (user.role.toUpperCase()) {
        case "ADMIN":
          validateEmail = await adminV2.findOne(filterSelfEmail).lean();
          if (validateEmail) throw "Email is already in use";

          entry = await adminV2.findOneAndUpdate(
            updateData.id,
            updateData.payload,
            updateData.options
          );
          break;
        case "TEACHER":
          validateEmail = await teacherV2.findOne(filterSelfEmail).lean();
          if (validateEmail) throw "Email is already in use";

          entry = await teacherV2.findOneAndUpdate(
            updateData.id,
            updateData.payload,
            updateData.options
          );
          break;
        case "STUDENT":
          validateEmail = await studentV2.findOne(filterSelfEmail).lean();
          if (validateEmail) throw "Email is already in use";

          entry = await studentV2.findOneAndUpdate(
            updateData.id,
            updateData.payload,
            updateData.options
          );
          break;
        default:
          throw "Role is not valid!";
          break;
      }

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },

  changePicture: async (req, res) => {
    try {
      const user = req.user;
      const role = user.role;
      const avatar = req.files[0] || [];

      // Check if avatar is empty
      if (avatar.length == 0) throw "Avatar is required";

      // Check if the file is an image or not
      if (avatar.mimetype.split("/")[0] !== "image")
        throw "File is not an image";

      // update the user avatar
      let entry = null;
      switch (role.toUpperCase()) {
        case "ADMIN":
          entry = await adminV2.findOneAndUpdate(
            { _id: user.id },
            { avatar: avatar },
            { new: true }
          );
          break;
        case "TEACHER":
          entry = await teacherV2.findOneAndUpdate(
            { _id: user.id },
            { avatar: avatar },
            { new: true }
          );
          break;
        case "STUDENT":
          entry = await studentV2.findOneAndUpdate(
            { _id: user.id },
            { avatar: avatar },
            { new: true }
          );
          break;
        default:
          throw "Role is not valid!";
          break;
      }

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },

  changePassword: async (req, res) => {
    try {
      const user = req.user;
      const data = req.body;

      if (!data.new_password) throw "Please enter your new password";
      if (!data.confirm_password) throw "Please confirm new password";
      if (data.confirm_password != data.new_password)
        throw "Passwords do not match!";

      // check if password is alpha numeric and between 8 to 20 characters
      if (data.password.length < 8 || data.password.length > 20)
        throw "Password must be between 8 and 20 characters!";

      const isAlphaNumeric = (str) => /^[a-zA-Z0-9]+$/.test(str);
      if (!isAlphaNumeric(data.password))
        throw "Password can only contain letters and numbers!";

      const password = await bcrypt.hash(data.new_password, 10);

      // update the password
      let entry = null;
      switch (user.role.toUpperCase()) {
        case "ADMIN":
          entry = await adminV2.findOneAndUpdate(
            { _id: user.id },
            { password: password },
            { new: true }
          );
          break;
        case "TEACHER":
          entry = await teacherV2.findOneAndUpdate(
            { _id: user.id },
            { password: password },
            { new: true }
          );
          break;
        case "STUDENT":
          entry = await studentV2.findOneAndUpdate(
            { _id: user.id },
            { password: password },
            { new: true }
          );
          break;
        default:
          throw "Role is not valid!";
          break;
      }

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
};

module.exports = profileController;
