const mongoose = require("mongoose");

const { preTestV2 } = require("../../models/v2/pretest.schema");
const {
  preTestQuestionV2,
} = require("../../models/v2/pretest_question.schema");
const { preTestResultV2 } = require("../../models/v2/pretest_result.schema");
const { lessonV2 } = require("../../models/v2/lesson.schema");
const { studentV2 } = require("../../models/v2/student.schema");
const { conceptV2 } = require("../../models/v2/concept.schema");

const pretestResultController = {
  all: async (req, res) => {
    try {
      let filter = {};

      if (req.query.lesson) {
        filter.lessonId = req.query.lesson;
      }

      if (req.query.student) {
        filter.studentId = req.query.student;
      }

      const entry = await preTestResultV2.find(filter).populate("lessonId");

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
        populate: ["lessonId"],
      };

      let query = {};

      if (req.query.lesson) {
        query.lessonId = req.query.lesson;
      }

      if (req.query.student) {
        query.studentId = req.query.student;
      }

      const entry = await preTestResultV2.paginate(query, options);

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  view: async (req, res) => {
    try {
      const entry = await preTestResultV2.findOne({ _id: req.params.id });

      if (!entry) throw "Pretest Result not found";

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
      const allowedRoles = ["STUDENT"];
      if (!allowedRoles.includes(req.user.role)) {
        throw "You are not allowed to do this";
      }

      if (!data.lesson) throw "Lesson is required!";
      if (!data.answers) throw "Answers is required!";

      // check if answers has 20 questions
      if (data.answers.length !== 20) throw "You must have 20 answers!";

      // check if user has a class
      const student = await studentV2.findOne({ _id: req.user.id });
      if (!student.classId) throw "You don't have a class!";

      // check if student status
      if (student.classStatus !== "JOINED")
        throw "You are not yet approved by the teacher!";

      //check if lesson exists
      const lesson = await lessonV2.findOne({ _id: data.lesson });
      if (!lesson) throw "Lesson not found!";

      // check if the lesson has a pretest
      const pretestOfLesson = await preTestV2.findOne({
        lessonId: data.lesson,
      });
      if (!pretestOfLesson) throw "This lesson doesn't have a pretest!";

      // check if the pretest has atleast 20 pretest questions
      const questions = await preTestQuestionV2.find({
        pretestId: pretestOfLesson._id,
      });
      if (questions.length < 20)
        throw "Pretest currently doesn't have enough questions to be taken!";

      //check if pretest result with same lesson and student  already exists
      const pretest = await preTestResultV2.findOne({
        lessonId: data.lesson,
        studentId: req.user.id,
      });
      if (pretest) throw "You already took the pretest for this lesson!";

      // create pretest result
      const resultData = {
        lessonId: data.lesson,
        studentId: req.user.id,
        knowledgeLevel: null,
        totalScore: 0,
        questions: [],
        results: [],
      };

      // get the concepts
      const concepts = await conceptV2.find({
        lessonId: data.lesson,
      });

      // check if there are 5 concepts
      if (concepts.length !== 5) throw "This lesson doesn't have 5 concepts!";

      // create the questions
      const questionsList = [];

      let counter = 0;
      while (counter < 20) {
        const question = questions.find((question) => {
          return question.order == counter + 1;
        });

        const answer = data.answers.find((answer) => {
          return answer.number == counter + 1;
        });

        let textOfCorrectAnswer = null;

        switch (question.answer.toUpperCase()) {
          case "A":
            textOfCorrectAnswer = question.choiceA.text;
            break;
          case "B":
            textOfCorrectAnswer = question.choiceB.text;
            break;
          case "C":
            textOfCorrectAnswer = question.choiceC.text;
            break;
          case "D":
            textOfCorrectAnswer = question.choiceD.text;
            break;
          default:
            throw "Invalid correct answer!";
            break;
        }

        let textOfSelectedAnswer = null;
        switch (answer.answer.toUpperCase()) {
          case "A":
            textOfSelectedAnswer = question.choiceA.text;
            break;
          case "B":
            textOfSelectedAnswer = question.choiceB.text;
            break;
          case "C":
            textOfSelectedAnswer = question.choiceC.text;
            break;
          case "D":
            textOfSelectedAnswer = question.choiceD.text;
            break;
          default:
            throw "Invalid correct answer!";
            break;
        }

        const q = {
          order: counter + 1,
          question: question.text,
          answer: answer.answer.toUpperCase(),
          correctAnswer: question.answer.toUpperCase(),
          correctText: textOfCorrectAnswer,
          answerText: textOfSelectedAnswer,
          isCorrect:
            answer.answer.toUpperCase() == question.answer.toUpperCase(),
        };

        questionsList.push(q);
        counter++;
      }
      // add qustions to result
      resultData.questions = questionsList;

      // count the total score
      let totalScore = 0;
      questionsList.forEach((question) => {
        if (question.isCorrect) totalScore++;
      });
      resultData.totalScore = totalScore;

      // calculate the mastery
      let correctAnswerTracker = {
        concept1: 0,
        concept2: 0,
        concept3: 0,
        concept4: 0,
        concept5: 0,
      };

      questionsList.forEach((question) => {
        let conceptOrder = null;

        switch (question.order - 1) {
          case 0:
          case 1:
          case 2:
          case 3:
            conceptOrder = 1;
            if (question.isCorrect) correctAnswerTracker.concept1++;
            break;
          case 4:
          case 5:
          case 6:
          case 7:
            conceptOrder = 2;
            if (question.isCorrect) correctAnswerTracker.concept2++;
            break;
          case 8:
          case 9:
          case 10:
          case 11:
            conceptOrder = 3;
            if (question.isCorrect) correctAnswerTracker.concept3++;
            break;
          case 12:
          case 13:
          case 14:
          case 15:
            conceptOrder = 4;
            if (question.isCorrect) correctAnswerTracker.concept4++;
            break;
          case 16:
          case 17:
          case 18:
          case 19:
            conceptOrder = 5;
            if (question.isCorrect) correctAnswerTracker.concept5++;
            break;
          default:
            console.log(question.order);
            throw "Question is not in concept error";
        }
      });

      const conceptList = [];

      concepts.forEach((concept, i) => {
        let con = {
          conceptName: concept.name,
          correctAnswers: correctAnswerTracker[`concept${i + 1}`],
          mastery:
            correctAnswerTracker[`concept${i + 1}`] >= 3
              ? "MASTERED"
              : "UNMASTERED",
        };
        conceptList.push(con);
      });

      resultData.result = conceptList;

      console.log(
        '"---------------------------RESULTS CREATED------------------------------------"'
      );
      console.log(conceptList);
      console.log(
        '"---------------------------RESULTS CREATED------------------------------------"'
      );

      // calculate the knowledge level
      let knowledgeLevel = null;

      // turn values of correctAnswerTracker into an array
      const correctAnswerTrackerArray = Object.values(correctAnswerTracker);

      // check if all concepts are mastered
      const numberOfMastered = correctAnswerTrackerArray.filter(
        (concept) => concept >= 3
      ).length;
      switch (numberOfMastered) {
        case 0:
          knowledgeLevel = "POOR";
          break;
        case 1:
          knowledgeLevel = "FAIR";
          break;
        case 2:
          knowledgeLevel = "AVERAGE";
          break;
        case 3:
          knowledgeLevel = "GOOD";
          break;
        case 4:
          knowledgeLevel = "VERY GOOD";
          break;
        case 5:
          knowledgeLevel = "EXCELLENT";
          break;
        default:
          throw "Knowledge level error";
      }

      resultData.knowledgeLevel = knowledgeLevel;

      // create the pretest result
      const pretestResult = await preTestResultV2.create(resultData);
      console.log(
        "---------------------------PRETEST CREATED------------------------------------"
      );

      // update the student to add the lesson
      const studentUpdate = await studentV2.findOneAndUpdate(
        { _id: req.user.id },
        {
          $push: {
            lessons: {
              lessonId: data.lesson,
              status: "STARTED",
            },
          },
        },
        { new: true }
      );
      console.log(
        "---------------------------STUDNET UPDATED------------------------------------"
      );

      if (!studentUpdate) throw "Pre test result not saved";

      return res.json({ status: true, data: pretestResult });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },

  delete: async (req, res) => {
    try {
      if (req.user.role != "ADMIN") throw "You are not an admin";

      const entry = await preTestResultV2.deleteOne({ _id: req.params.id });

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
};

module.exports = pretestResultController;
