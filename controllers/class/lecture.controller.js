const { lecture } = require("../../models/classes/lecture.schema");
const { concept } = require("../../models/classes/concept.schema");

const mongoose = require("mongoose");

const lectureController = {
  all: async (req, res) => {
    try {
      const filter = {};

      if (req.query.concept) {
        filter.concept = req.query.concept;
      }

      const entry = await lecture.find(filter);

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  view: async (req, res) => {
    try {
      const entry = await lecture.findOne({ _id: req.params.id });

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
      if (!data.concept) throw "Lesson is required!";
      if (!data.material) throw "Learning Material is required!";
      if (!data.set) throw "Set is required!";

      const set = data.set.toUpperCase();
      const setTypes = ["A", "B"];
      if (!setTypes.includes(set)) throw "Set is invalid!";

      // check if concept exists
      const conceptEntry = await concept.findOne({ _id: data.concept });
      if (!conceptEntry) throw "Concept does not exist!";

      if (set == "A" && conceptEntry.lectureA != null)
        throw "Set A is already taken!";
      if (set == "B" && conceptEntry.lectureB != null)
        throw "Set B is already taken!";

      // check for lectures with the concept
      const lectures = await lecture.find({ concept: data.concept });
      if (lectures.length >= 2) throw "Concept can only have 2 lectures!";

      const entry = await lecture.create(
        [
          {
            name: data.name,
            concept: data.concept,
            material: data.material,
          },
        ],
        { session }
      );

      const id = entry[0]._id;
      await concept.findOneAndUpdate(
        { _id: data.concept },
        { $set: { [`lecture${set}`]: id } },
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
      if (!data.material) throw "Learning Material is required!";

      const entry = await lecture.findOneAndUpdate(
        { _id: req.params.id },
        {
          name: data.name,
          material: data.material,
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

module.exports = lectureController;
