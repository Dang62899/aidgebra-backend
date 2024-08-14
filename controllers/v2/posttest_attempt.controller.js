const mongoose = require("mongoose");

const { postTestV2 } = require("../../models/v2/posttest.schema");
const {
  postTestQuestionV2,
} = require("../../models/v2/posttest_question.schema");
const {
  postTestAttemptV2,
} = require("../../models/v2/posttest_attempt.schema");
const { lessonV2 } = require("../../models/v2/lesson.schema");
const { studentV2 } = require("../../models/v2/student.schema");
const { conceptV2 } = require("../../models/v2/concept.schema");

const postTestAttemptContoller = {
  all: async (req, res) => {
    try {
      let filter = {};

      if (req.query.lesson) {
        filter.lessonId = req.query.lesson;
      }

      if (req.query.student) {
        filter.studentId = req.query.student;
      }

      const entry = await postTestAttemptV2.find(filter).populate("lessonId");

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

      const entry = await postTestAttemptV2.paginate(query, options);

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  view: async (req, res) => {
    try {
      const entry = await postTestAttemptV2.findOne({ _id: req.params.id });

      if (!entry) throw "Post test result not found";

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

      // check if the lesson has a post test
      const posttestOfLesson = await postTestV2.findOne({
        lessonId: data.lesson,
      });
      if (!posttestOfLesson) throw "This lesson doesn't have a post test!";

      // check if the posttest has atleast 20 posttest questions
      const questions = await postTestQuestionV2.find({
        posttestId: posttestOfLesson._id,
      });
      if (questions.length < 20)
        throw "Post test currently doesn't have enough questions to be taken!";

      //check if posttest results with same lesson and student exist 5 times
      const posttestAttempts = await postTestAttemptV2.find({
        lessonId: data.lesson,
        studentId: req.user.id,
      });

      // check if atleast one isPassed
      let atleastOnePassed = false;
      posttestAttempts.forEach((attempt) => {
        if (attempt.isPassed) {
          atleastOnePassed = true;
        }
      });

      if (atleastOnePassed) throw "You have already passed this post test!";

      if (posttestAttempts.length >= 5 && !atleastOnePassed)
        throw "You have reached maximum attempt for Post-test. Kindly seek for a professional's help. Thank you.";

      // create posttest result
      const resultData = {
        lessonId: data.lesson,
        studentId: req.user.id,
        attemptNumber: posttestAttempts.length + 1,
        isPassed: false,
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
          questionId: question._id,
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
          conceptId: concept._id,
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

      // check if all values are greater than or equal 3 == PASSED
      const correctAnswerTrackerArray = Object.values(correctAnswerTracker);
      console.log(correctAnswerTrackerArray);

      if (correctAnswerTrackerArray.every((value) => value >= 3)) {
        resultData.isPassed = true;
      }

      // create the post test attempt result
      const posttestResult = await postTestAttemptV2.create(resultData);

      if (resultData.isPassed) {
        // update the student's lesson status to completed
        const studentUpdate = await studentV2.findOne({ _id: req.user.id });
        const lessonToUpdate = studentUpdate.lessons.find((lesson) => {
          return lesson.lessonId.toString() == data.lesson.toString();
        });

        if (lessonToUpdate) {
          lessonToUpdate.status = "COMPLETED";
          await studentUpdate.save();

          if (!studentUpdate) throw "Post test result not saved";
        }
      } else {
        // check number of failed attempts and update the student's lesson status accordingly
        const attemptCount = await postTestAttemptV2.countDocuments({
          lessonId: data.lesson,
          studentId: req.user.id,
          isPassed: false,
        });

        if (attemptCount >= 5) {
          const studentUpdate = await studentV2.findOne({ _id: req.user.id });
          const lessonToUpdate = studentUpdate.lessons.find((lesson) => {
            return lesson.lessonId.toString() == data.lesson.toString();
          });

          if (lessonToUpdate) {
            lessonToUpdate.status = "FAILED";
            await studentUpdate.save();

            if (!studentUpdate) throw "Post test result not saved";
          }
        }
      }

      return res.json({
        status: true,
        data: posttestResult,
        isPassed: resultData.isPassed,
        attemptNumber: resultData.attemptNumber,
      });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },

  delete: async (req, res) => {
    try {
      if (req.user.role != "ADMIN") throw "You are not an admin";

      const entry = await postTestAttemptV2.deleteOne({ _id: req.params.id });

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
};

module.exports = postTestAttemptContoller;
