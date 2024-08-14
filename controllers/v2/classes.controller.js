const mongoose = require("mongoose");

const { classesV2 } = require("../../models/v2/classes.schema");
const { studentV2 } = require("../../models/v2/student.schema");
const generator = require("../../helpers/code-generator");

const classController = {
  all: async (req, res) => {
    try {
      let filter = {};

      if (req.query.teacher) {
        filter = { teacher: req.query.teacher };
      }

      const entry = await classesV2.find(filter).populate("teacher");

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
        populate: ["teacher"],
      };

      let query = {};

      if (req.query.teacher) {
        query = { teacher: req.query.teacher };
      }

      if (req.query.search) {
        let regex = new RegExp(req.query.search, "i");
        query = {
          ...query,
          $and: [
            {
              $or: [{ name: regex, code: regex }],
            },
          ],
        };
      }

      const entry = await classesV2.paginate(query, options);

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  view: async (req, res) => {
    try {
      const entry = await classesV2
        .findOne({ _id: req.params.id })
        .populate("teacher");

      if (!entry) throw "Class not found";

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  create: async (req, res) => {
    try {
      const data = req.body;

      // check if allowed
      const allowedRoles = ["ADMIN", "TEACHER"];
      if (!allowedRoles.includes(req.user.role)) {
        throw "You are not allowed to do this";
      }

      if (!data.name) throw "Name is required!";

      // generate 6 digit code and check if unique
      let code = generator.classCode();
      let checkCode = await classesV2.findOne({ code });
      while (checkCode) {
        code = generator.classCode();
        checkCode = await classesV2.findOne({ code });
      }

      const entry = await classesV2.create([
        {
          name: data.name,
          code,
          teacher: data.teacher || null,
        },
      ]);

      if (!entry) throw "Class not created";

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  update: async (req, res) => {
    try {
      const data = req.body;

      // check if allowed
      const allowedRoles = ["ADMIN"];
      if (!allowedRoles.includes(req.user.role)) {
        throw "You are not allowed to do this";
      }

      if (!data.name) throw "Name is required!";

      const entry = await classesV2.findOneAndUpdate(
        { _id: req.params.id },
        {
          name: data.name,
          teacher: data.teacher || null,
        },
        { new: true }
      );

      if (!entry) throw "Class not found";

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  delete: async (req, res) => {
    try {
      if (req.user.role != "ADMIN") throw "You are not an admin";

      const entry = await classesV2.deleteOne({ _id: req.params.id });

      // clear the student documents with this classId
      await studentV2.updateMany(
        { classId: req.params.id },
        { $unset: { classId: "" } }
      );

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
};

module.exports = classController;
