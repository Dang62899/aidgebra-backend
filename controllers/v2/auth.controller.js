const { adminV2 } = require("../../models/v2/admin.schema");
const { teacherV2 } = require("../../models/v2/teacher.schema");
const { studentV2 } = require("../../models/v2/student.schema");
const dateDifference = require("../../helpers/dateDifference")
const sendMail = require("../../helpers/email.config")

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const timer = 300000 // 5 minutes
const BASE_URL = 'https://aid-gebra-demo.herokuapp.com' 

const authController = {
  login: async (req, res) => {
    try {
      if (req.islogged == true)
        throw "You are already logged in, Logout first to change accounts";

      if (!req.body.email) throw "Email is required!";
      if (!req.body.password) throw "Password is required!";
      if (!req.body.role) throw "Role is required!";

      const plainTextPassword = req.body.password;

      // Get The Role
      const role = req.body.role.toUpperCase();
      let entry = null;
      switch (role) {
        case "ADMIN":
          entry = await adminV2.findOne({ email: req.body.email }).lean();
          break;
        case "TEACHER":
          entry = await teacherV2.findOne({ email: req.body.email }).lean();
          break;
        case "STUDENT":
          entry = await studentV2.findOne({ email: req.body.email }).lean();
          break;
        default:
          throw "Role is not valid!";
          break;
      }

      if (!entry) throw "Invalid credentials";
      if (entry.status != "ACTIVE") throw "Your account is deactivated";
      if (role != "ADMIN" && !entry.isVerified) throw "Please verify your email"

      if (await bcrypt.compare(plainTextPassword, entry.password)) {
        const token = jwt.sign(
          {
            id: entry._id,
            email: entry.email,
            role: role,
            fullname: entry.fullname,
            firstname: entry.firstname,
            middlename: entry.middlename,
            lastname: entry.lastname,
            contact: entry.contact,
            avatar: entry.avatar,
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
        return res.json({
          status: true,
          data: entry,
          token: token,
          role: role,
        });
      } else {
        return res.json({ status: false, error: "Invalid Credentials" });
      }
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  register: async (req, res) => {

    const session = await mongoose.startSession();

    try {

      session.startTransaction();
      const data = req.body;

      if (req.islogged == true)
        throw "You are already logged in, Logout first to create a new account";

      if (!data.password) throw "Password is required!";
      if (data.password != data.confirm_password)
        throw "Password does not match!";
      if (!data.email) throw "Email is required!";
      if (!data.fullname) throw "fullname is required!";
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

      // Hash Password
      const password = await bcrypt.hash(data.password, 10);

      // Format Data
      const userInfo = {
        email: data.email,
        password,
        fullname: data.fullname,
        firstname: data.firstname,
        middlename: data.middlename || "",
        lastname: data.lastname,
        contact: data.contact,
      };

      // Create User
      let entry = null;
      let entryRole = null;

      switch (req.body.role.toUpperCase()) {
        case "TEACHER":
          entryRole = await teacherV2.find({ email: req.body.email }, null, {session}).lean();
          if (entryRole.length) throw "Email is already taken.";

          entry = await teacherV2.create([userInfo], {session});

          break;
        case "STUDENT":
          entryRole = await studentV2.find({ email: req.body.email }, null, {session}).lean();
          if (entryRole.length) throw "Email is already taken.";
          entry = await studentV2.create([userInfo], {session});

          break;
        default:
          throw "Role is not valid!";
          break;
      }

      let info = await sendMail({
        to: entry[0].email, // list of receivers
        subject: "AidGebra Account Email Verification", // Subject line
        html: `
            <center>
              <h1 style="margin-bottom:10px;">Welcome to AidGebra!</h1>
              <p style="opacity:.8">To confirm your registration with this email for an AidGebra account, kindly click the button below:</p> <br/>

              <a href="${BASE_URL}/verify/email?id=${entry[0]._id}&role=${req.body.role.toUpperCase()}" style="color:white;text-decoration:none;padding:15px 20px;border-radius:10px;background-color:#00203F">
                VERIFY
              </a>
            </center>
        `, // html body
      })

      if (!info.status) throw info.error

      let token = null;
      if (entry) {
        token = jwt.sign(
          {
            id: entry[0]._id,
            email: entry[0].email,
            role: req.body.role.toUpperCase(),
            fullname: entry[0].fullname,
            firstname: entry[0].firstname,
            middlename: entry[0].middlename,
            lastname: entry[0].lastname,
            contact: entry[0].contact,
            avatar: entry[0].avatar,
            refreshToken: entry.refreshToken,
            status: entry[0].status,
          },
          process.env.JWT_SECRET
        );

        res.cookie("token", token, {
          httpOnly: true,
          // secure : true,
          // signed : true
        });
      }

      await session.commitTransaction();
      return res.json({
        status: true,
        data: entry[0],
        token: token,
        role: req.body.role.toUpperCase(),
      });
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      return res.json({ status: false, error });
    } finally {
      session.endSession();
    }
  },
  verifyEmail : async (req, res) => {
    try{
      if(!req.query.role) throw "missing params"
      if(!req.query.id) throw "missing params"

      let entry = ''

      if(req.query.role == "TEACHER"){
        entry = await teacherV2.findOneAndUpdate(
          {_id : req.query.id},
          {isVerified : true},
          {new : true}
        )
      }
      else if(req.query.role == "STUDENT"){
        entry = await studentV2.findOneAndUpdate(
          {_id : req.query.id},
          {isVerified : true},
          {new : true}
        )
      }
      else {
        throw "Invalid"
      }

      return res.json({status: true, data :"Email is verified"})
    }
    catch(error){
      console.log(error)
      return res.json({status : false, error})
    }
  },
  sendResetpasswordLink : async (req,res) => {
    try{
      if(!req.query.role) throw "missing params"
      if(!req.query.email) throw "Email is required"

      let info = await sendMail({
        to: req.query.email, // list of receivers
        subject: "Password reset on AidGebra account",
        html: `
            <center>
              <h1 style="margin-bottom:10px;">Reset Password</h1>
              <p style="opacity:.8">Kindly click the button below to reset your password on your AidGebra account.</p> <br/>
              <small style="opacity:.5; margin-top:5px;">if you did not request for a password reset, please disregard this email.</small> <br/><br/><br/>

              <a href="${BASE_URL}/forgotpassword/change?email=${req.query.email}&role=${req.query.role.toUpperCase()}" style="color:white;text-decoration:none;padding:15px 20px;border-radius:10px;background-color:#00203F">
                Reset password
              </a>
            </center>
        `, // html body
      })

      if (!info.status) throw info.error

      return res.json({status: true, data : "Sent"})
    }
    catch(error){
      console.log(error)
      return res.json({status: false, error})
    }
  },
  forgotpassword : async (req, res) => {
    try{
      if(!req.query.role) throw "missing params"
      if(!req.query.email) throw "missing params"

      if(!req.body.password) throw "Password is required"
      if(!req.body.repassword) throw "Please confirm your password"

      let entry = ''

      // check if password is alpha numeric and between 8 to 20 characters
      if (req.body.password.length < 8 || req.body.password.length > 20)  
        throw "Password must be between 8 and 20 characters!";

      const isAlphaNumeric = (str) => /^[a-zA-Z0-9]+$/.test(str);
      if (!isAlphaNumeric(req.body.password))
        throw "Password can only contain letters and numbers!";

      const password = await bcrypt.hash(req.body.password, 10);

      if(req.query.role == "TEACHER"){
        entry = await teacherV2.findOneAndUpdate(
          {email : req.query.email},
          {password},
          {new : true}
        )
      }
      else if(req.query.role == "STUDENT"){
        entry = await studentV2.findOneAndUpdate(
          {email : req.query.email},
          {password},
          {new : true}
        )
      }
      else {
        throw "Invalid"
      }

      return res.json({status: true, data : entry})
    }
    catch(error){
      console.log(error)
      return res.json({status: false, error})
    }
  }
};

module.exports = authController;
