const { posttest } = require("../../models/classes/posttest.schema");
const { lesson } = require("../../models/classes/lesson.schema");
const { question } = require("../../models/classes/question.schema");

const mongoose = require("mongoose");

const posttestController = {
  all: async (req, res) => {
    try {
      const filter = {};

      if (req.query.lesson) {
        filter.lesson = req.query.lesson;
      }

      const entry = await posttest
        .find(filter)
        .populate([
          "concept1",
          "concept2",
          "concept3",
          "concept4",
          "concept5",
          "question1",
          "question2",
          "question3",
          "question4",
          "question5",
          "question6",
          "question7",
          "question8",
          "question9",
          "question10",
          "question11",
          "question12",
          "question13",
          "question14",
          "question15",
          "question16",
          "question17",
          "question18",
          "question19",
          "question20",
        ]);

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  view: async (req, res) => {
    try {
      const entry = await posttest
        .findOne({ _id: req.params.id })
        .populate([
          "concept1",
          "concept2",
          "concept3",
          "concept4",
          "concept5",
          "question1",
          "question2",
          "question3",
          "question4",
          "question5",
          "question6",
          "question7",
          "question8",
          "question9",
          "question10",
          "question11",
          "question12",
          "question13",
          "question14",
          "question15",
          "question16",
          "question17",
          "question18",
          "question19",
          "question20",
        ]);

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

      if (!data.lesson) throw "Lesson is required!";
      if (!data.concept1) throw "Concept 1 is required!";
      if (!data.concept2) throw "Concept 2 is required!";
      if (!data.concept3) throw "Concept 3 is required!";
      if (!data.concept4) throw "Concept 4 is required!";
      if (!data.concept5) throw "Concept 5 is required!";

      if (!data.question1) throw "Question 1 is required!";
      if (!data.question2) throw "Question 2 is required!";
      if (!data.question3) throw "Question 3 is required!";
      if (!data.question4) throw "Question 4 is required!";
      if (!data.question5) throw "Question 5 is required!";
      if (!data.question6) throw "Question 6 is required!";
      if (!data.question7) throw "Question 7 is required!";
      if (!data.question8) throw "Question 8 is required!";
      if (!data.question9) throw "Question 9 is required!";
      if (!data.question10) throw "Question 10 is required!";
      if (!data.question11) throw "Question 11 is required!";
      if (!data.question12) throw "Question 12 is required!";
      if (!data.question13) throw "Question 13 is required!";
      if (!data.question14) throw "Question 14 is required!";
      if (!data.question15) throw "Question 15 is required!";
      if (!data.question16) throw "Question 16 is required!";
      if (!data.question17) throw "Question 17 is required!";
      if (!data.question18) throw "Question 18 is required!";
      if (!data.question19) throw "Question 19 is required!";
      if (!data.question20) throw "Question 20 is required!";

      // create many questions in questions collection
      const questions = [];

      // put questions in an array
      let count = 1;
      while (count <= 20) {
        let q = data[`question${count}`];
        q.order = count;
        questions.push(q);
        count++;
      }

      // check if lesson already has posttest
      const lessonEntry = await lesson.findOne({ _id: data.lesson }, null, {
        session,
      });
      if (lessonEntry.posttest) throw "Lesson already has posttest";

      // mass insert the questions
      const questionEntries = await question.insertMany(questions, { session });

      // create posttest document and attach the questions
      const entry = await posttest.create(
        [
          {
            lesson: data.lesson,
            concept1: data.concept1,
            concept2: data.concept2,
            concept3: data.concept3,
            concept4: data.concept4,
            concept5: data.concept5,
            question1: questionEntries[0]._id,
            question2: questionEntries[1]._id,
            question3: questionEntries[2]._id,
            question4: questionEntries[3]._id,
            question5: questionEntries[4]._id,
            question6: questionEntries[5]._id,
            question7: questionEntries[6]._id,
            question8: questionEntries[7]._id,
            question9: questionEntries[8]._id,
            question10: questionEntries[9]._id,
            question11: questionEntries[10]._id,
            question12: questionEntries[11]._id,
            question13: questionEntries[12]._id,
            question14: questionEntries[13]._id,
            question15: questionEntries[14]._id,
            question16: questionEntries[15]._id,
            question17: questionEntries[16]._id,
            question18: questionEntries[17]._id,
            question19: questionEntries[18]._id,
            question20: questionEntries[19]._id,
          },
        ],
        { session }
      );

      // add to the posttest to the lesson
      const id = entry[0]._id;
      await lesson.findOneAndUpdate(
        { _id: data.lesson },
        { $set: { posttest: id } },
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
    const session = await mongoose.startSession();

    try {
      session.startTransaction();
      const data = req.body;

      if (req.user.role != "ADMIN") throw "You are not an admin";

      if (!data.concept1) throw "Concept 1 is required!";
      if (!data.concept2) throw "Concept 2 is required!";
      if (!data.concept3) throw "Concept 3 is required!";
      if (!data.concept4) throw "Concept 4 is required!";
      if (!data.concept5) throw "Concept 5 is required!";

      if (!data.question1) throw "Question 1 is required!";
      if (!data.question2) throw "Question 2 is required!";
      if (!data.question3) throw "Question 3 is required!";
      if (!data.question4) throw "Question 4 is required!";
      if (!data.question5) throw "Question 5 is required!";
      if (!data.question6) throw "Question 6 is required!";
      if (!data.question7) throw "Question 7 is required!";
      if (!data.question8) throw "Question 8 is required!";
      if (!data.question9) throw "Question 9 is required!";
      if (!data.question10) throw "Question 10 is required!";
      if (!data.question11) throw "Question 11 is required!";
      if (!data.question12) throw "Question 12 is required!";
      if (!data.question13) throw "Question 13 is required!";
      if (!data.question14) throw "Question 14 is required!";
      if (!data.question15) throw "Question 15 is required!";
      if (!data.question16) throw "Question 16 is required!";
      if (!data.question17) throw "Question 17 is required!";
      if (!data.question18) throw "Question 18 is required!";
      if (!data.question19) throw "Question 19 is required!";
      if (!data.question20) throw "Question 20 is required!";

      const entry = await posttest
        .findOne({ _id: req.params.id }, null, { session })
        .populate([
          "question1",
          "question2",
          "question3",
          "question4",
          "question5",
          "question6",
          "question7",
          "question8",
          "question9",
          "question10",
          "question11",
          "question12",
          "question13",
          "question14",
          "question15",
          "question16",
          "question17",
          "question18",
          "question19",
          "question20",
        ]);

      if (!entry) throw "Pretest not found";

      // create many questions in questions collection
      const questions = [];

      while (count <= 20) {
        entry[`question${count}`].isDeleted = true;

        let q = data[`question${count}`];
        q.order = count;

        switch (count) {
          case 0:
          case 1:
          case 2:
          case 3:
            q.concept = data.concept1;
            break;
          case 4:
          case 5:
          case 6:
          case 7:
            q.concept = data.concept2;
            break;
          case 8:
          case 9:
          case 10:
          case 11:
            q.concept = data.concept3;
            break;
          case 12:
          case 13:
          case 14:
          case 15:
            q.concept = data.concept4;
            break;
          case 16:
          case 17:
          case 18:
          case 19:
            q.concept = data.concept5;
            break;
          default:
            throw "Error in pretest questions concepts";
        }

        questions.push(q);
        count++;
      }

      // update the entry
      await entry.save({ session });

      // update the questions

      const questionEntries = await question.insertMany(questions, { session });

      // update the questions in the pretest
      const updatedPost = await posttest.findOneAndUpdate(
        { _id: req.params.id },
        {
          $set: {
            concept1: data.concept1,
            concept2: data.concept2,
            concept3: data.concept3,
            concept4: data.concept4,
            concept5: data.concept5,
            question1: questionEntries[0]._id,
            question2: questionEntries[1]._id,
            question3: questionEntries[2]._id,
            question4: questionEntries[3]._id,
            question5: questionEntries[4]._id,
            question6: questionEntries[5]._id,
            question7: questionEntries[6]._id,
            question8: questionEntries[7]._id,
            question9: questionEntries[8]._id,
            question10: questionEntries[9]._id,
            question11: questionEntries[10]._id,
            question12: questionEntries[11]._id,
            question13: questionEntries[12]._id,
            question14: questionEntries[13]._id,
            question15: questionEntries[14]._id,
            question16: questionEntries[15]._id,
            question17: questionEntries[16]._id,
            question18: questionEntries[17]._id,
            question19: questionEntries[18]._id,
            question20: questionEntries[19]._id,
          },
        },
        { session }
      );

      await session.commitTransaction();
      return res.json({ status: true, data: updatedPre });
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      return res.json({ status: false, error });
    } finally {
      session.endSession();
    }
  },
};

module.exports = posttestController;
