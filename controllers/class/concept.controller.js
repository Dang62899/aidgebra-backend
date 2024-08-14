const { lesson } = require("../../models/classes/lesson.schema");
const { concept } = require("../../models/classes/concept.schema");

const mongoose = require("mongoose");

const conceptController = {
  all: async (req, res) => {
    try {
      if (req.user.role != "ADMIN") throw "You are not an admin";

      const filter = {};

      if (req.query.lesson) {
        filter.lesson = req.query.lesson;
      }

      const entry = await concept.find(filter);

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  view: async (req, res) => {
    try {
      if (req.user.role != "ADMIN") throw "You are not an admin";

      const entry = await concept.findOne({ _id: req.params.id });

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

      if (!data.name) throw "Name is required!";
      if (!data.lesson) throw "Lesson is required!";
      if (!data.order) throw " Order is required!";

      const lessonEntry = await lesson.findOne({ _id: data.lesson });
      if (lessonEntry.concepts.length >= 5)
        throw "Lesson has reached maximum number of concepts!";

      const entry = await concept.create(
        [
          {
            name: data.name,
            lesson: data.lesson,
            conceptOrder: data.order,
          },
        ],
        { session }
      );

      const id = entry[0]._id;
      await lesson.findOneAndUpdate(
        { _id: data.lesson },
        { $push: { concepts: id } },
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
  update: async (req, res) => {
    try {
      const data = req.body;

      if (req.user.role != "ADMIN") throw "You are not an admin";

      if (!data.name) throw "Name is required!";

      const entry = await concept.findOneAndUpdate(
        { _id: req.params.id },
        {
          name: data.name,
        },
        { new: true, runValidators: true }
      );

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  swap: async (req, res) => {
    const session = await mongoose.startSession();
    const data = req.body;

    try {
      session.startTransaction();

      if (req.user.role != "ADMIN") throw "You are not an admin";

      // swap the order of two concepts
      const entry = await concept.findOneAndUpdate(
        { _id: data.first_id },
        { conceptOrder: data.second_order },
        { new: true, session }
      );

      const entry2 = await concept.findOneAndUpdate(
        { _id: data.second_id },
        { conceptOrder: data.first_order },
        { new: true, session }
      );

      await session.commitTransaction();
      return res.json({ status: true, message: "swapped" });
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      return res.json({ status: false, error });
    } finally {
      session.endSession();
    }
  },
};

module.exports = conceptController;
