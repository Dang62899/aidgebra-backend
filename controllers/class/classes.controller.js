const { classes } = require("../../models/classes/classes.schema");
const { teacher } = require("../../models/teacher/teacher.schema");

const generator = require("../../helpers/code-generator");

const mongoose = require("mongoose");

const classesController = {
  paginate: async (req, res) => {
    const page = req.query.page || 1;

    try {
      const options = {
        sort: { createdAt: "desc" },
        page,
        limit: req.body.count || 25,
        populate: ["teacher"],
      };

      let query = {
        status: req.body.status || "",
      };

      if (req.user.role == "TEACHER") query["teacher"] = req.user.id;

      if (req.query.search) {
        let regex = new RegExp(req.query.search, "i");
        query = {
          ...query,
          $and: [
            {
              $or: [{ code: regex }, { name: regex }],
            },
          ],
        };
      }

      if (!req.query.status || req.query.status == "ALL")
        delete query["status"];

      const entry = await classes.paginate(query, options);

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  all: async (req, res) => {
    try {
      const entry = await classes.find({}).populate(["lessons", "teacher"]);

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  view: async (req, res) => {
    try {
      const entry = await classes
        .findOne({ _id: req.params.id })
        .populate("teacher")
        .populate([
          {
            path: "lessons",
            populate: [
              {
                path: "concepts",
              },
              {
                path: "pretest",
              },
              {
                path: "posttest",
              },
            ],
          },
          {
            path: "students",
            populate: {
              path: "student",
            },
          },
        ]);

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  create: async (req, res) => {
    try {
      const data = req.body;

      allowedRoles = ["ADMIN", "TEACHER"];
      if (!allowedRoles.includes(req.user.role))
        throw "You are not allowed to create a class";

      if (req.user.role == "ADMIN") {
        if (!data.teacher) throw "Teacher is required!";
      }

      if (req.user.role == "TEACHER") {
        data.teacher = req.user.id;
      }

      if (!data.name) throw "Name is required!";

      // generate 6 digit code and check if unique
      let code = generator.classCode();
      let checkCode = await classes.findOne({ code });
      while (checkCode) {
        code = generator.classCode();
        checkCode = await classes.findOne({ code });
      }

      const entry = await classes.create([
        {
          name: data.name,
          code,
          teacher: data.teacher,
          status: data.status || "ACTIVE",
        },
      ]);

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  update: async (req, res) => {
    try {
      const data = req.body;

      if (!data.name) throw "Name is required!";
      if (!data.status) throw "Status is required!";

      allowedRoles = ["ADMIN", "TEACHER"];
      if (!allowedRoles.includes(req.user.role))
        throw "You are not allowed to create a class";

      if (req.user.role == "ADMIN") {
        if (!data.teacher) throw "Teacher is required!";
      }

      if (req.user.role == "TEACHER") {
        data.teacher = req.user.id;
      }

      const entry = await classes.findOneAndUpdate(
        { _id: req.params.id },
        {
          name: data.name,
          teacher: req.user.role == "TEACHER" ? req.user.id : req.body.id,
          status: data.status,
        },
        { new: true, runValidators: true }
      );

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
};

module.exports = classesController;
