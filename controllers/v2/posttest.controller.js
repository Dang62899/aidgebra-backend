const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { postTestV2 } = require("../../models/v2/posttest.schema");
const { lessonV2 } = require("../../models/v2/lesson.schema");

const posttestController = {
  all: async (req, res) => {
    try {
      let filter = {};

      if (req.query.lesson) {
        filter.lessonId = req.query.lesson;
      }

      const entry = await postTestV2.find(filter);

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

      const entry = await postTestV2.paginate(query, options);

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  view: async (req, res) => {
    try {
      const entry = await postTestV2.findOne({ _id: req.params.id });

      if (!entry) throw "Posttest not found";

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
      const allowedRoles = ["ADMIN"];
      if (!allowedRoles.includes(req.user.role)) {
        throw "You are not allowed to do this";
      }

      if (!data.lesson) throw "Lesson is required!";

      //check if lesson exists
      const lesson = await lessonV2.findOne({ _id: data.lesson });
      if (!lesson) throw "Lesson not found!";

      //check if post test with same lesson already exists
      const posttest = await postTestV2.findOne({ lessonId: data.lesson });
      if (posttest) throw "Posttest with same lesson already exists!";

      const entry = await postTestV2.create([
        {
          lessonId: data.lesson,
        },
      ]);

      if (!entry) throw "Post test not created";

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  delete: async (req, res) => {
    try {
      if (req.user.role != "ADMIN") throw "You are not an admin";

      const entry = await postTestV2.deleteOne({ _id: req.params.id });

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
};

module.exports = posttestController;
