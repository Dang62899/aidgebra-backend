const mongoose = require("mongoose");

const { lessonV2 } = require("../../models/v2/lesson.schema");
const { preTestV2 } = require("../../models/v2/pretest.schema");
const { postTestV2 } = require("../../models/v2/posttest.schema");

const lessonController = {
  all: async (req, res) => {
    try {
      let filter = {};

      const entry = await lessonV2.find(filter).sort({ order: "asc" });

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
        sort: { order: "asc" },
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
              $or: [{ name: regex }],
            },
          ],
        };
      }

      const entry = await lessonV2.paginate(query, options);

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  view: async (req, res) => {
    try {
      const entry = await lessonV2.findOne({ _id: req.params.id });

      if (!entry) throw "Lesson not found";

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

      if (!data.order) throw "Order is required!";
      if (!data.name) throw "Name is required!";

      // check if lesson with same order already exists
      const existing = await lessonV2.findOne({ order: data.order });
      if (existing) throw "Lesson with same order already exists!";

      const entry = await lessonV2.create([
        {
          order: data.order,
          name: data.name,
        },
      ]);

      if (!entry) throw "Lesson not created";

      // create pretest of lesson
      const pretest = await preTestV2.create([
        {
          lessonId: entry[0]._id,
        },
      ]);

      if (!pretest) throw "Pretest not created";

      // create posttest of lesson
      const posttest = await postTestV2.create([
        {
          lessonId: entry[0]._id,
        },
      ]);

      if (!posttest) throw "Posttest not created";

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
      if (!data.order) throw "Order is required!";

      // check if lesson with same order already exists
      const existing = await lessonV2.findOne({ order: data.order });
      if (existing && existing._id !== data._id)
        throw "Lesson with same order already exists!";

      const entry = await lessonV2.findOneAndUpdate(
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

      const entry = await lessonV2.deleteOne({ _id: req.params.id });

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
};

module.exports = lessonController;
