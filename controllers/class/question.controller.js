const { question } = require("../../models/classes/question.schema");
const { concept } = require("../../models/classes/concept.schema");

const mongoose = require("mongoose");

const questionController = {
  all: async (req, res) => {
    try {
      const filter = {};

      if (req.query.concept) {
        filter.concept = req.query.concept;
      }

      const entry = await question.find(filter);

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  view: async (req, res) => {
    try {
      const entry = await question.findOne({ _id: req.params.id });

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

      if (!data.question) throw "Question is required!";
      if (!data.answer) throw "Correct answer is required!";
      if (!data.concept) throw "Concept is required!";
      if (!data.difficulty) throw "Difficulty is required!";
      if (!data.choiceA) throw "Choice A is required!";
      if (!data.choiceB) throw "Choice B is required!";
      if (!data.choiceC) throw "Choice C is required!";
      if (!data.choiceD) throw "Choice D is required!";

      const entry = await question.create(
        [
          {
            concept: data.concept,
            question: data.question,
            answer: data.answer,
            difficulty: data.difficulty,
            choiceA: { text: data.choiceA },
            choiceB: { text: data.choiceB },
            choiceC: { text: data.choiceC },
            choiceD: { text: data.choiceD },
          },
        ],
        { session }
      );

      // add to the question bank of the concept
      const id = entry[0]._id;
      await concept.findOneAndUpdate(
        { _id: data.concept },
        { $push: { questions: id } },
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

      if (!data.question) throw "Question is required!";
      if (!data.answer) throw "Correct answer is required!";
      if (!data.concept) throw "Concept is required!";
      if (!data.difficulty) throw "Difficulty is required!";
      if (!data.choiceA) throw "Choice A is required!";
      if (!data.choiceB) throw "Choice B is required!";
      if (!data.choiceC) throw "Choice C is required!";
      if (!data.choiceD) throw "Choice D is required!";

      const entry = await question.findOneAndUpdate(
        { _id: req.params.id },
        {
          concept: data.concept,
          question: data.question,
          answer: data.answer,
          difficulty: data.difficulty,
          choiceA: { text: data.choiceA },
          choiceB: { text: data.choiceB },
          choiceC: { text: data.choiceC },
          choiceD: { text: data.choiceD },
        },
        { new: true, runValidators: true }
      );

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  delete: async (req, res) => {
    try {
      if (req.user.role != "ADMIN") throw "You are not an admin";

      const entry = await question.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { isDeleted: true } },
        { new: true }
      );

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
};

module.exports = questionController;
