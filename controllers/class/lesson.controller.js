const { classes } = require("../../models/classes/classes.schema");
const { lesson } = require("../../models/classes/lesson.schema");

const mongoose = require("mongoose");

const lessonController = {
  all: async (req, res) => {
    try {
      const filter = {};

      if (req.query.class) {
        filter.class = req.query.class;
      }

      const entry = await lesson.find(filter);

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  view: async (req, res) => {
    try {
      const entry = await lesson
        .findOne({ _id: req.params.id })
        .populate("concepts");

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
      if (!data.class) throw "Class is required!";
      if (!data.order) throw " Order is required!";

      // create lesson
      const entry = await lesson.create(
        [
          {
            name: data.name,
            class: data.class,
            lessonOrder: data.order,
          },
        ],
        { session }
      );

      // add lesson document to class document
      const id = entry[0]._id;
      const classEntry = await classes.findOneAndUpdate(
        { _id: data.class },
        { $push: { lessons: id } },
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
      if (!data.status) throw " Status is required!";

      const entry = await lesson.findOneAndUpdate(
        { _id: req.params.id },
        {
          name: data.name,
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
  swap: async (req, res) => {
    const session = await mongoose.startSession();
    const data = req.body;

    try {
      session.startTransaction();

      if (req.user.role != "ADMIN") throw "You are not an admin";

      // swap the order of two lessons
      const entry = await lesson.findOneAndUpdate(
        { _id: data.first_id },
        { lessonOrder: data.second_order },
        { new: true, session }
      );

      const entry2 = await lesson.findOneAndUpdate(
        { _id: data.second_id },
        { lessonOrder: data.first_order },
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

module.exports = lessonController;

// const arra = {
//   "question1": {
//     "question": "2 + 2 is 4, Minus 1 = ?",
//     "difficulty": "easy",
//     "choiceA": "3",
//     "choiceB": "2",
//     "choiceC": "4",
//     "choiceD": "1",
//     "answer": "a"
//   },
//   "question2": {
//     "question": "2 + 2 is 4, Minus 2 = ?",
//     "difficulty": "hard",
//     "choiceA": "3",
//     "choiceB": "2",
//     "choiceC": "4",
//     "choiceD": "1",
//     "answer": "b"
//   },
//   "question3": {
//     "question": "2 + 2 is 4, Minus 3 = ?",
//     "difficulty": "average",
//     "choiceA": "3",
//     "choiceB": "2",
//     "choiceC": "4",
//     "choiceD": "1",
//     "answer": "d"
//   },
//   "question4": {
//     "question": "2 + 2 is 4, Minus 0 = ?",
//     "difficulty": "average",
//     "choiceA": "3",
//     "choiceB": "2",
//     "choiceC": "4",
//     "choiceD": "1",
//     "answer": "c"
//   },
//   "question5": {
//     "question": "2 + 2 is 4, Minus 0 = ?",
//     "difficulty": "average",
//     "choiceA": "3",
//     "choiceB": "2",
//     "choiceC": "4",
//     "choiceD": "1",
//     "answer": "c"
//   },
//   "question6": {
//     "question": "2 + 2 is 4, Minus 1 = ?",
//     "difficulty": "easy",
//     "choiceA": "3",
//     "choiceB": "2",
//     "choiceC": "4",
//     "choiceD": "1",
//     "answer": "a"
//   },
//   "question7": {
//     "question": "2 + 2 is 4, Minus 2 = ?",
//     "difficulty": "hard",
//     "choiceA": "3",
//     "choiceB": "2",
//     "choiceC": "4",
//     "choiceD": "1",
//     "answer": "b"
//   },
//   "question8": {
//     "question": "2 + 2 is 4, Minus 3 = ?",
//     "difficulty": "average",
//     "choiceA": "3",
//     "choiceB": "2",
//     "choiceC": "4",
//     "choiceD": "1",
//     "answer": "d"
//   },
//   "question9": {
//     "question": "2 + 2 is 4, Minus 0 = ?",
//     "difficulty": "average",
//     "choiceA": "3",
//     "choiceB": "2",
//     "choiceC": "4",
//     "choiceD": "1",
//     "answer": "c"
//   },
//   "question10": {
//     "question": "2 + 2 is 4, Minus 0 = ?",
//     "difficulty": "average",
//     "choiceA": "3",
//     "choiceB": "2",
//     "choiceC": "4",
//     "choiceD": "1",
//     "answer": "c"
//   },
//   "question11": {
//     "question": "2 + 2 is 4, Minus 1 = ?",
//     "difficulty": "easy",
//     "choiceA": "3",
//     "choiceB": "2",
//     "choiceC": "4",
//     "choiceD": "1",
//     "answer": "a"
//   },
//   "question12": {
//     "question": "2 + 2 is 4, Minus 2 = ?",
//     "difficulty": "hard",
//     "choiceA": "3",
//     "choiceB": "2",
//     "choiceC": "4",
//     "choiceD": "1",
//     "answer": "b"
//   },
//   "question13": {
//     "question": "2 + 2 is 4, Minus 3 = ?",
//     "difficulty": "average",
//     "choiceA": "3",
//     "choiceB": "2",
//     "choiceC": "4",
//     "choiceD": "1",
//     "answer": "d"
//   },
//   "question14": {
//     "question": "2 + 2 is 4, Minus 0 = ?",
//     "difficulty": "average",
//     "choiceA": "3",
//     "choiceB": "2",
//     "choiceC": "4",
//     "choiceD": "1",
//     "answer": "c"
//   },
//   "question15": {
//     "question": "2 + 2 is 4, Minus 0 = ?",
//     "difficulty": "average",
//     "choiceA": "3",
//     "choiceB": "2",
//     "choiceC": "4",
//     "choiceD": "1",
//     "answer": "c"
//   },
//   "question16": {
//     "question": "2 + 2 is 4, Minus 1 = ?",
//     "difficulty": "easy",
//     "choiceA": "3",
//     "choiceB": "2",
//     "choiceC": "4",
//     "choiceD": "1",
//     "answer": "a"
//   },
//   "question17": {
//     "question": "2 + 2 is 4, Minus 2 = ?",
//     "difficulty": "hard",
//     "choiceA": "3",
//     "choiceB": "2",
//     "choiceC": "4",
//     "choiceD": "1",
//     "answer": "b"
//   },
//   "question18": {
//     "question": "2 + 2 is 4, Minus 3 = ?",
//     "difficulty": "average",
//     "choiceA": "3",
//     "choiceB": "2",
//     "choiceC": "4",
//     "choiceD": "1",
//     "answer": "d"
//   },
//   "question19": {
//     "question": "2 + 2 is 4, Minus 0 = ?",
//     "difficulty": "average",
//     "choiceA": "3",
//     "choiceB": "2",
//     "choiceC": "4",
//     "choiceD": "1",
//     "answer": "c"
//   },
//   "question20": {
//     "question": "2 + 2 is 4, Minus 0 = ?",
//     "difficulty": "average",
//     "choiceA": "3",
//     "choiceB": "2",
//     "choiceC": "4",
//     "choiceD": "1",
//     "answer": "c"
//   },
// }
