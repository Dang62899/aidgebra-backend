const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { conceptV2 } = require("../../models/v2/concept.schema");
const { lectureV2 } = require("../../models/v2/lecture.schema");

const conceptController = {
  all: async (req, res) => {
    try {
      let filter = {};

      if (req.query.lessonId) {
        filter.lessonId = req.query.lessonId;
      }

      const entry = await conceptV2.find(filter);

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

      if (req.query.lessonId) {
        query.lessonId = req.query.lessonId;
      }

      if (req.query.search) {
        let regex = new RegExp(req.query.search, "i");
        query = {
          ...query,
          $and: [
            {
              $or: [{ name: regex }],
            },
          ],
        };
      }

      const entry = await conceptV2.paginate(query, options);

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  view: async (req, res) => {
    try {
      const entry = await conceptV2.findOne({ _id: req.params.id });

      if (!entry) throw "Concept not found";

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

      if (!data.name) throw "Name is required!";
      if (!data.lessonId) throw "Lesson is required!";
      if (!data.order) throw "Order is required!";

      // check if lesson exists with the same order
      const concept = await conceptV2.findOne({
        lessonId: data.lessonId,
        order: data.order,
      });
      if (concept)
        throw "Concept with the same order in this concept already exists!";

      // check if lesson already has 5 concepts
      const lesson = await conceptV2.find({ lessonId: data.lessonId });
      if (lesson.length >= 5) throw "Lesson already has 5 concepts!";

      const entry = await conceptV2.create([
        {
          name: data.name,
          lessonId: data.lessonId,
          order: data.order,
        },
      ]);

      if (!entry) throw "Concept not created";

      // create lecture of concept
      // set a
      const lectureA = await lectureV2.create([
        {
          conceptId: entry[0]._id,
          material: "Hello.....",
          setType: "A",
        },
      ]);

      if (!lectureA) throw "Lecture A not created";

      // create lecture of concept
      // set b
      const lectureB = await lectureV2.create([
        {
          conceptId: entry[0]._id,
          material: "Hello.....",
          setType: "B",
        },
      ]);

      if (!lectureB) throw "Lecture B not created";

      return res.json({ status: true, data: entry[0] });
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
      if (!data.order) throw "Order is required!";

      // check if lesson exists with the same order
      const concept = await conceptV2.findOne({
        lessonId: data.lessonId,
        order: data.order,
      });

      if (concept && concept._id != req.params.id)
        throw "Concept with the same order in this lesson already exists!";

      const entry = await conceptV2.findOneAndUpdate(
        { _id: req.params.id },
        {
          name: data.name,
          order: data.order,
        },
        { new: true }
      );

      if (!entry) throw "Lesson not found";

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  delete: async (req, res) => {
    try {
      if (req.user.role != "ADMIN") throw "You are not an admin";

      const entry = await conceptV2.deleteOne({ _id: req.params.id });

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
};

module.exports = conceptController;
