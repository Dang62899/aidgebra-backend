const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { student } = require("../../models/student/student.schema");
const { classes } = require("../../models/classes/classes.schema");
const mongoose = require("mongoose");

const studentController = {
  changePicture: async (req, res) => {
    try {
      const avatar = req.files[0] || [];

      if (req.user.role != "STUDENT") throw "You are not a student";

      const entry = await student.findOneAndUpdate(
        { _id: req.user.id },
        { avatar },
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
      //       if (!data.contact) throw "Contact Number is required";

      if (req.user.role != "STUDENT") throw "You are not a student";

      const validateEmail = await student.findOne({
        email: data.email,
        _id: {
          $ne: req.user.id,
        },
      });

      if (validateEmail) throw "Email is already taken.";

      const entry = await student.findOneAndUpdate(
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

      if (req.user.role != "STUDENT") throw "You are not a student";

      if (!data.new_password) throw "Please enter your new Password";
      if (!data.confirm_password) throw "Please confirm new password";
      if (data.confirm_password != data.new_password)
        throw "Password not match!";

      const password = await bcrypt.hash(data.new_password, 10);

      const entry = await student.findOneAndUpdate(
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
  register: async (req, res) => {
    const data = req.body;
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      if (req.islogged == true)
        throw "You are already logged in, Logout first to create a new account";

      if (!data.password) throw "Password is required!";
      if (data.password != data.confirm_password) throw "Password not match!";
      if (!data.email) throw "Email is required!";
      if (!data.fullname) throw "Fullname is required!";

      const count = await student.find({}).count();
      const student_id = (count + 1).toString().padStart(4, "0");
      const password = await bcrypt.hash(data.password, 10);
      console.log(count);
      console.log(student_id);
      const validateEmail = await student.findOne({ email: data.email }, null, {
        session,
      });
      if (validateEmail) throw "Email is already taken.";

      const entry = await student.create(
        [
          {
            email: data.email,
            password,
            student_id,
            fullname: data.fullname,
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

      const entry = await student.findOne({ email: req.body.email }).lean();

      if (!entry) throw "Invalid credentials";
      if (entry.status != "ACTIVE") throw "Your account is deactivated";

      if (await bcrypt.compare(plainTextPassword, entry.password)) {
        const token = jwt.sign(
          {
            id: entry._id,
            email: entry.email,
            student_id: entry.student_id,
            role: "STUDENT",
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
  all: async (req, res) => {
    try {
      const entry = await student.find({});

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  view: async (req, res) => {
    try {
      const entry = await student.findOne({ _id: req.params.id });

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
        limit: req.body.count || 25,
      };

      let query = {
        role: req.body.role,
        status: req.body.status || "",
      };

      if (req.query.search) {
        let regex = new RegExp(req.body.search, "i");
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

      const entry = await student.paginate(query, options);

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

      if (req.user.role != "ADMIN") throw "You are not an admin";

      if (!data.password) throw "Password is required!";
      if (data.password != data.confirm_password) throw "Password not match!";
      if (!data.email) throw "Email is required!";
      if (!data.fullname) throw "Fullname is required!";

      const count = await student.find({}).count();
      const student_id = (count + 1).toString().padStart(4, "0");
      const password = await bcrypt.hash(data.password, 10);

      const validateEmail = await student.findOne({ email: data.email });
      if (validateEmail) throw "Email is already taken.";

      const entry = await student.create([
        {
          email: data.email,
          password,
          student_id,
          fullname: data.fullname,
        },
      ]);

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
  // add student to class using code
  joinClass: async (req, res) => {
    const student = req.user;
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      if (student.role != "STUDENT") throw "You are not a student";

      if (!req.params.code) throw "Code is required!";

      const classEntry = await classes.findOne({ code: req.params.code });

      if (!classEntry) throw "Invalid code";

      // check if student is already in class
      const studentInClass = await classes.findOne(
        {
          _id: classEntry._id,
          students: { $elemMatch: { student: student.id } },
        },
        null,
        { session }
      );
      console.log(studentInClass);
      if (studentInClass) throw "You are already in this class";

      // add student to class
      const entry = await classes.findOneAndUpdate(
        { _id: classEntry._id },
        { $push: { students: { student: student.id } } },
        { new: true, session }
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
  dropClass: async (req, res) => {
    const studentUser = req.user;
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      if (studentUser.role != "STUDENT") throw "You are not a student";

      if (!req.params.code) throw "Code is required!";

      const classEntry = await classes.findOne({ code: req.params.code });

      if (!classEntry) throw "Invalid code";

      // check if student is already in class
      const studentInClass = await classes.findOne(
        {
          _id: classEntry._id,
          students: { $elemMatch: { student: studentUser.id } },
        },
        null,
        { session }
      );
      if (!studentInClass) throw "You are not in this class";

      const studentIdentity = studentInClass.students.find(
        (student) => student.student._id.toString() == studentId
      );

      // check if studen status is already set to dropped
      if (studentIdentity.status == "DROPPED")
        throw "You are already dropped from this class";

      // set student status to dropped in class
      const entry = await classes.findOneAndUpdate(
        { _id: classEntry._id, "students.student": studentUser.id },
        { $set: { "students.$.status": "DROPPED" } },
        { new: true, session }
      );

      // set student progress to dropped
      const studentProgress = await student.findOne(
        {
          _id: studentUser.id,
        },
        null,
        { session }
      );

      studentProgress.progress.filter(
        (classes) => classes.classId == classEntry._id
      )[0].status = "DROPPED";

      await studentProgress.save({ session });

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

  myClasses: async (req, res) => {
    try {
      const enrolledOnly = req.query.enrolledOnly || false;
      const student = req.user;

      let filter = {
        $and: [{ students: { $elemMatch: { student: student.id } } }],
      };

      if (enrolledOnly) {
        filter.$and.push({
          students: {
            $elemMatch: { status: "ENROLLED" },
          },
        });
      }

      const studentClasses = await classes.find(filter).populate("teacher");

      if (enrolledOnly) {
      }
      return res.json({ status: true, data: studentClasses });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },

  myClassInfo: async (req, res) => {
    try {
      const student = req.user;

      // find the class with the id and the student
      const studentClasses = await classes
        .findOne({
          _id: req.params.class,
        })
        .populate("teacher")
        .populate({
          path: "lessons",
          populate: {
            path: "concepts",
          },
        })
        .populate({
          path: "students",
          populate: [
            {
              path: "student",
            },
            {
              path: "lessons",
              populate: [
                {
                  path: "lesson",
                },
                {
                  path: "pretest_score.questions.question",
                },
                {
                  path: "pretest_score.concept_mastery.concept",
                },
                {
                  path: "assesment_sessions",
                },
                {
                  path: "posttest_attemps.questions.question",
                },
              ],
            },
          ],
        });

      if (!studentClasses) throw "No class with this student found";

      console.log(studentClasses);

      const studentInfo = studentClasses.students.filter((stu) => {
        return stu.student._id == student.id;
      })[0];

      if (!studentInfo) throw "No student with that id was found in this class";

      const info = {
        class: {
          _id: studentClasses._id,
          code: studentClasses.code,
          name: studentClasses.name,
          lessons: studentClasses.lessons,
        },
        teacher: studentClasses.teacher,
        studentInfo,
      };

      return res.json({ status: true, data: info });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
};

module.exports = studentController;
