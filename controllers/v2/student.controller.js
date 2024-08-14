const mongoose = require("mongoose");
const { classesV2 } = require("../../models/v2/classes.schema");
const { studentV2 } = require("../../models/v2/student.schema");
const { preTestResultV2 } = require("../../models/v2/pretest_result.schema");
const { assesmentV2 } = require("../../models/v2/assesment.schema");
const queryParser = require("../../helpers/query-parser");

const bcrypt = require("bcrypt");
const {
  postTestAttemptV2,
} = require("../../models/v2/posttest_attempt.schema");

const studentController = {
  all: async (req, res) => {
    try {
      let filter = {};
      let classLists = [];

      if (req.query.class) {
        classLists = queryParser.parseToArray(req.query.class);
        console.log(classLists);
        filter.classId = { $in: classLists };
      }

      const entry = await studentV2
        .find(filter)
        .populate("classId")
        .populate({
          path: "lessons",
          populate: {
            path: "lessonId",
          },
        });

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
        populate: [
          {
            path: "classId",
          },
          {
            path: "lessons",
            populate: {
              path: "lessonId",
            },
          },
        ],
      };

      let query = {};
      let classLists = [];

      //
      if (req.query.class) {
        console.log(req.query.class);
        classLists = queryParser.parseToArray(req.query.class);
        console.log(classLists);
        query.classId = { $in: classLists };
      }

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

      console.log(query);

      const entry = await studentV2.paginate(query, options);

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  view: async (req, res) => {
    try {
      const entry = await studentV2
        .findOne({ _id: req.params.id })
        .populate("classId")
        .populate({
          path: "lessons",
          populate: {
            path: "lessonId",
          },
        });

      if (!entry) throw "Student not found";

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

      const validateEmail = await studentV2.findOne({ email: data.email });
      if (validateEmail) throw "Email is already taken.";

      const entry = await studentV2.create({
        email: data.email,
        password,
        fullname: data.fullname,
        firstname: data.firstname,
        middlename: data.middlename || "",
        lastname: data.lastname,
        contact: data.contact,
      });

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

      const entry = await studentV2.findOneAndUpdate(
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

      if (!entry) throw "Student not found";

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  delete: async (req, res) => {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      if (req.user.role != "ADMIN") throw "You are not an admin";

      const entry = await studentV2.deleteOne({ _id: req.params.id });
      const pretests = await preTestResultV2.deleteMany({
        studentId: req.params.id,
      });
      const posttests = await postTestAttemptV2.deleteMany({
        studentId: req.params.id,
      });
      const assessments = await assesmentV2.deleteMany({
        studentId: req.params.id,
      });

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
  joinClass: async (req, res) => {
    try {
      const data = req.body;
      const user = req.user;

      if (user.role != "STUDENT") throw "You are not a student";

      if (!data.classcode) throw "Class Code is required!";

      // check if class exists
      const classExists = await classesV2.findOne({
        code: data.classcode,
      });
      if (!classExists) throw "Class not found";

      // check if student already has a class
      const studentExists = await studentV2.findOne({
        _id: user.id,
        classId: classExists._id,
      });
      if (studentExists) throw "You are already in this class";

      // add student to class
      const entry = await studentV2
        .findOneAndUpdate(
          { _id: user.id },
          {
            classId: classExists._id,
            classStatus: "PENDING",
          },
          { new: true }
        )
        .populate("classId");

      if (!entry) throw "Error request not sent";

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  leaveClass: async (req, res) => {
    try {
      const user = req.user;

      if (req.user.role != "STUDENT") throw "You are not a student";

      const entry = await studentV2.findOneAndUpdate(
        { _id: user.id },
        {
          classId: null,
          classStatus: null,
        },
        { new: true }
      );

      if (!entry) throw "Error. class not left";

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  changeLectureType: async (req, res) => {
    try {
      const data = req.body;
      const user = req.user;
      let lecType = null; // true = B, false = A

      if (user.role != "STUDENT") throw "You are not a student";
      if (!data.concept) throw "Concept is required!";
      if (!data.type) {
        lecType = null;
      } else {
        lecType = data.type.toUpperCase() == "B" ? true : false;
      }

      const entry = await studentV2
        .findOne({ _id: user.id })
        .populate("classId")
        .populate({
          path: "lessons",
          populate: {
            path: "lessonId",
          },
        });

      console.log(entry.lessons[0]);
      const lesson = entry.lessons.find((lesson) =>
        lesson.concepts.find((concept) => concept.conceptId == data.concept)
      );

      if (!lesson) throw "Lesson not found";

      const concept = lesson.concepts.find(
        (concept) => concept.conceptId == data.concept
      );

      if (!concept) throw "Concept not found";

      // lecttype is null toggle the value of the alterntive lecture type
      if (lecType == null) {
        concept.alternateLecture = !concept.alternateLecture;
      } else {
        concept.lectType = lecType;
      }

      const updateStudentlecture = await entry.save({ new: true });

      if (!entry) throw "Error lecture type not changed";

      return res.json({ status: true, data: updateStudentlecture });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
};

module.exports = studentController;
