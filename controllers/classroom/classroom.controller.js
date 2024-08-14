const mongoose = require("mongoose");
const { classes } = require("../../models/classes/classes.schema");
const { concept } = require("../../models/classes/concept.schema");
const { question } = require("../../models/classes/question.schema");
const { assesment } = require("../../models/classes/assesment.schema");
const { student } = require("../../models/student/student.schema");
const queryParser = require("../../helpers/query-parser");

const classroomController = {
  answerPretest: async (req, res) => {
    const session = await mongoose.startSession();
    const classId = req.params.class;
    const lessonId = req.params.lesson;
    const answers = req.body.answers;
    const studentId = req.user.id;

    try {
      session.startTransaction();

      if (!answers) throw "Answers are required!";
      if (!classId) throw "Class code is required!";
      if (!lessonId) throw "Lesson ID is required!";

      // check if student is already in class
      const studentInClass = await classes
        .findOne(
          {
            _id: classId,
            students: { $elemMatch: { student: studentId } },
          },
          null,
          { session }
        )
        .populate({
          path: "lessons",
          populate: {
            path: "pretest",
            populate: [
              {
                path: "question1",
              },
              {
                path: "question2",
              },
              {
                path: "question3",
              },
              {
                path: "question4",
              },
              {
                path: "question5",
              },
              {
                path: "question6",
              },
              {
                path: "question7",
              },
              {
                path: "question8",
              },
              {
                path: "question9",
              },
              {
                path: "question10",
              },
              {
                path: "question11",
              },
              {
                path: "question12",
              },
              {
                path: "question13",
              },
              {
                path: "question14",
              },
              {
                path: "question15",
              },
              {
                path: "question16",
              },
              {
                path: "question17",
              },
              {
                path: "question18",
              },
              {
                path: "question19",
              },
              {
                path: "question20",
              },
            ],
          },
        })
        .populate({
          path: "students",
          populate: [
            {
              path: "lessons",
              populate: {
                path: "pretest_score.questions",
                populate: [
                  {
                    path: "concept",
                  },
                  {
                    path: "question",
                  },
                ],
              },
            },
            {
              path: "student",
            },
          ],
        });
      if (!studentInClass) throw "Student is not in this class";

      const studentIdentity = studentInClass.students.find(
        (student) => student.student._id.toString() == studentId
      );

      // check if student status is already set to dropped
      if (studentIdentity.status == "DROPPED")
        throw "Student already dropped from this class";

      // check if student status is already set to enrolled
      if (studentIdentity.status == "PENDING")
        throw "Student is still pending to be enrolled in this class";

      // check if student status is already set to enrolled
      if (studentIdentity.status != "ENROLLED")
        throw "Student is not enrolled in this class";

      // check if lesson is in class
      if (
        studentInClass.lessons.filter((lesson) => lesson._id == lessonId)
          .length == 0
      )
        throw "Lesson is not in this class";

      // check if student has already took pretest of the lesson
      const studentLessons = studentIdentity.lessons.filter(
        (lesson) => lesson.lesson == lessonId
      );

      if (studentLessons[0]?.pretest_score?.taken == true)
        throw "Student already took pretest of this lesson";

      // get the pretest questions and copare the answers
      const pretest = studentInClass.lessons.filter(
        (lesson) => lesson._id == lessonId
      )[0].pretest;

      // put questions in an array
      let pretestResult = {
        taken: true,
        questions: [],
        total_score: null,
        concept_mastery: [],
      };

      // Check the answers
      let count = 0;
      while (count < 20) {
        let conceptNumber = null;
        switch (count) {
          case 0:
          case 1:
          case 2:
          case 3:
            conceptNumber = 1;
            break;
          case 4:
          case 5:
          case 6:
          case 7:
            conceptNumber = 2;
            break;
          case 8:
          case 9:
          case 10:
          case 11:
            conceptNumber = 3;
            break;
          case 12:
          case 13:
          case 14:
          case 15:
            conceptNumber = 4;
            break;
          case 16:
          case 17:
          case 18:
          case 19:
            conceptNumber = 5;
            break;
          default:
            throw "Error in posttest";
        }
        pretestResult.questions.push({
          order: answers[count].number,
          concept: pretest["concept" + conceptNumber],
          question: pretest["question" + answers[count].number],
          mark:
            pretest["question" + answers[count].number].answer ==
            answers[count].answer.toUpperCase()
              ? "CORRECT"
              : "INCORRECT",
        });
        count++;
      }

      // Count Total Score
      pretestResult.total_score = pretestResult.questions.reduce(
        (acc, curr) => acc + (curr.mark == "CORRECT" ? 1 : 0),
        0
      );

      // compute concept mastery
      const conceptList = [
        {
          concept: 1,
          questions: [1, 2, 3, 4],
        },
        {
          concept: 2,
          questions: [5, 6, 7, 8],
        },
        {
          concept: 3,
          questions: [9, 10, 11, 12],
        },
        {
          concept: 4,
          questions: [13, 14, 15, 16],
        },
        {
          concept: 5,
          questions: [17, 18, 19, 20],
        },
      ];

      // coount the number of correct answers for each concept
      for (let i = 0; i < conceptList.length; i++) {
        let conceptScore = 0;
        for (let j = 0; j < conceptList[i].questions.length; j++) {
          const question = pretestResult.questions.filter(
            (question) => question.order == conceptList[i].questions[j]
          )[0];
          if (question.mark == "CORRECT") conceptScore++;
        }
        const mastery = conceptScore >= 3 ? "MASTERED" : "UNMASTERED";
        pretestResult.concept_mastery.push({
          concept: pretest["concept" + conceptList[i].concept],
          score: conceptScore,
          mastery,
        });
      }

      // update student pretest score in the students lesson
      const studentLesson = studentIdentity.lessons.push({
        lesson: lessonId,
        pretest_score: pretestResult,
      });

      // format pretest result
      let conceptsIncorrect = [];
      const selectedLesson = studentIdentity.lessons.filter(
        (lesson) => lesson.lesson == lessonId
      )[0];

      selectedLesson.pretest_score.questions.forEach((question) => {
        let concept = null;
        const conceptAlreadyInlist = conceptsIncorrect.find((concept) => {
          return concept.conceptId == question.concept._id;
        });

        // find the concept in the list otherwise add it
        if (conceptAlreadyInlist) {
          concept = conceptAlreadyInlist;
        } else {
          concept = {
            conceptId: question.concept._id,
            incorrectlyAnswered: 0,
          };
          conceptsIncorrect.push(concept);
        }

        if (question.mark == "INCORRECT") {
          concept.incorrectlyAnswered++;
        }
      });

      console.log("save student in class : start");
      // save the changes
      await studentInClass.save({ session });
      console.log("save student in class : end");

      // get the students mastery per concept
      const conceptMastery = pretestResult.concept_mastery.map((concept) => {
        return {
          conceptId: concept.concept,
          mastery: concept.mastery,
          isCompleted: false,
        };
      });

      const studentProgress = await student.findOne(
        {
          _id: studentId,
        },
        null,
        { session }
      );

      // add to the student progress
      studentProgress.progress = [
        {
          classId: classId,
          status: "ENROLLED",
          lessons: [
            {
              lessonId: lessonId,
              status: "IN PROGRESS",
              concepts: conceptMastery,
              pretest_results: {
                concepts: conceptMastery.map((concept) => {
                  return {
                    conceptId: concept.conceptId,
                    mastery: concept.mastery,
                  };
                }),
                results: conceptsIncorrect,
              },
              posttest_results: [],
            },
          ],
        },
      ];

      // save the changes
      await studentProgress.save({ session });

      await session.commitTransaction();

      return res.json({
        status: true,
        data: pretestResult,
      });
    } catch (error) {
      await session.abortTransaction();
      console.log(error);
      return res.json({ status: false, error });
    } finally {
      session.endSession();
    }
  },
  answerPosttest: async (req, res) => {
    const session = await mongoose.startSession();
    const classId = req.params.class;
    const lessonId = req.params.lesson;
    const answers = req.body.answers;
    const studentId = req.user.id;

    try {
      session.startTransaction();

      if (!answers) throw "Answers are required!";
      if (!classId) throw "Class code is required!";
      if (!lessonId) throw "Lesson ID is required!";

      // check if student is already in class
      const studentInClass = await classes
        .findOne(
          {
            _id: classId,
            students: { $elemMatch: { student: studentId } },
          },
          null,
          { session }
        )
        .populate({
          path: "lessons",
          populate: {
            path: "posttest",
            populate: [
              {
                path: "question1",
              },
              {
                path: "question2",
              },
              {
                path: "question3",
              },
              {
                path: "question4",
              },
              {
                path: "question5",
              },
              {
                path: "question6",
              },
              {
                path: "question7",
              },
              {
                path: "question8",
              },
              {
                path: "question9",
              },
              {
                path: "question10",
              },
              {
                path: "question11",
              },
              {
                path: "question12",
              },
              {
                path: "question13",
              },
              {
                path: "question14",
              },
              {
                path: "question15",
              },
              {
                path: "question16",
              },
              {
                path: "question17",
              },
              {
                path: "question18",
              },
              {
                path: "question19",
              },
              {
                path: "question20",
              },
            ],
          },
        })
        .populate({
          path: "students",
          populate: [
            {
              path: "lessons",
              populate: {
                path: "pretest_score.questions",
                populate: [
                  {
                    path: "concept",
                  },
                  {
                    path: "question",
                  },
                ],
              },
            },
            {
              path: "student",
            },
          ],
        });
      if (!studentInClass) throw "Student is not in this class";

      const studentIdentity = studentInClass.students.find(
        (student) => student.student._id.toString() == studentId
      );

      const studentProgress = await student.findOne(
        {
          _id: studentId,
        },
        null,
        { session }
      );

      // check student progress if already completed all assessments
      const completedConcepts = studentProgress.progress.lessons
        .filter((lesson) => lesson.lesson == lessonId)[0]
        .concepts.filter((concept) => concept.isCompleted == true);

      if (completedConcepts.length < 5)
        throw "You must complete all concepts before you can take the post test";

      // check if student status is already set to dropped
      if (studentIdentity.status == "DROPPED")
        throw "Student already dropped from this class";

      // check if student status is already set to enrolled
      if (studentIdentity.status == "PENDING")
        throw "Student is still pending to be enrolled in this class";

      // check if student status is already set to enrolled
      if (studentIdentity.status != "ENROLLED")
        throw "Student is not enrolled in this class";

      // check if lesson is in class
      if (
        studentInClass.lessons.filter((lesson) => lesson._id == lessonId)
          .length == 0
      )
        throw "Lesson is not in this class";

      // get the student lesson info
      const studentLessons = studentIdentity.lessons.filter(
        (lesson) => lesson.lesson == lessonId
      );

      // check if a post test has already marked as pass
      if (
        studentLessons[0].posttest_attemps.filter(
          (attempt) => attempt.status == "PASS"
        ).length > 0
      )
        throw "Student already passed the post test";

      // check if student has already took 5 post test attemps of the lesson
      if (studentLessons[0].posttest_attemps.length >= 5)
        throw "Student already took 5 attempts of this lesson's post test";

      // get the posttest questions and compare the answers
      const posttest = studentInClass.lessons.filter(
        (lesson) => lesson._id == lessonId
      )[0].posttest;

      // check if there is a post test for the lesson
      if (!posttest) throw "Lesson has no post test set";

      // put questions in an array
      let posttestResult = {
        attempt: studentLessons[0].posttest_attemps.length + 1,
        questions: [],
        total_score: null,
        concept_mastery: [],
      };

      // Check the answers
      let count = 0;
      while (count < 20) {
        let conceptNumber = null;
        switch (count) {
          case 0:
          case 1:
          case 2:
          case 3:
            conceptNumber = 1;
            break;
          case 4:
          case 5:
          case 6:
          case 7:
            conceptNumber = 2;
            break;
          case 8:
          case 9:
          case 10:
          case 11:
            conceptNumber = 3;
            break;
          case 12:
          case 13:
          case 14:
          case 15:
            conceptNumber = 4;
            break;
          case 16:
          case 17:
          case 18:
          case 19:
            conceptNumber = 5;
            break;
          default:
            throw "Error in posttest";
        }
        posttestResult.questions.push({
          order: answers[count].number,
          concept: posttest["concept" + conceptNumber],
          question: posttest["question" + answers[count].number],
          mark:
            posttest["question" + answers[count].number].answer ==
            answers[count].answer.toUpperCase()
              ? "CORRECT"
              : "INCORRECT",
        });
        count++;
      }

      // Count Total Score
      posttestResult.total_score = posttestResult.questions.reduce(
        (acc, curr) => acc + (curr.mark == "CORRECT" ? 1 : 0),
        0
      );

      // compute concept mastery
      const conceptList = [
        {
          concept: 1,
          questions: [1, 2, 3, 4],
        },
        {
          concept: 2,
          questions: [5, 6, 7, 8],
        },
        {
          concept: 3,
          questions: [9, 10, 11, 12],
        },
        {
          concept: 4,
          questions: [13, 14, 15, 16],
        },
        {
          concept: 5,
          questions: [17, 18, 19, 20],
        },
      ];

      // coount the number of correct answers for each concept
      for (let i = 0; i < conceptList.length; i++) {
        let conceptScore = 0;
        for (let j = 0; j < conceptList[i].questions.length; j++) {
          const question = posttestResult.questions.filter(
            (question) => question.order == conceptList[i].questions[j]
          )[0];
          if (question.mark == "CORRECT") conceptScore++;
        }
        const mastery = conceptScore >= 3 ? "MASTERED" : "UNMASTERED";
        posttestResult.concept_mastery.push({
          concept: posttest["concept" + conceptList[i].concept],
          score: conceptScore,
          mastery,
        });
      }

      // check if all concepts are mastered
      if (
        posttestResult.concept_mastery.filter(
          (concept) => concept.mastery == "UNMASTERED"
        ).length > 0
      ) {
        // set post test status to failed
        posttestResult.status = "FAILED";
      }

      // add umastered concepts to the post test result
      posttestResult.concept_mastery = posttestResult.concept_mastery.forEach(
        (concept) => {
          if (concept.mastery == "UNMASTERED") {
            posttestResult.failed_concepts =
              concept["concept" + concept.concept];
          }
        }
      );

      // find the class lesson and push the post_test in the posttest_attemps array in the document
      studentIdentity.lessons
        .filter((lesson) => lesson.lesson == lessonId)[0]
        .posttest_attemps.push(posttestResult);

      // format posttest result
      let conceptsIncorrect = [];
      const selectedLesson = studentIdentity.lessons.filter(
        (lesson) => lesson.lesson == lessonId
      )[0];

      selectedLesson.posttest_attemps[
        selectedLesson.posttest_attemps.length - 1
      ].questions.forEach((question) => {
        let concept = null;
        const conceptAlreadyInlist = conceptsIncorrect.find((concept) => {
          return concept.conceptId == question.concept._id;
        });

        // find the concept in the list otherwise add it
        if (conceptAlreadyInlist) {
          concept = conceptAlreadyInlist;
        } else {
          concept = {
            conceptId: question.concept._id,
            incorrectlyAnswered: 0,
          };
          conceptsIncorrect.push(concept);
        }

        if (question.mark == "INCORRECT") {
          concept.incorrectlyAnswered++;
        }
      });

      // get the students mastery per concept
      const conceptMastery = posttestResult.concept_mastery.map((concept) => {
        return {
          conceptId: concept.concept,
          mastery: concept.mastery,
        };
      });

      // add to the student progress post test result
      studentProgress.progress
        .filter((progress) => {
          return progress.classId == classId;
        })[0]
        .lessons.filter((lesson) => {
          return lesson.lessonId == lessonId;
        })[0]
        .posttest_attemps.push(posttestResult);

      // count the number of attempts for the lesson
      const attempts = studentIdentity.lessons.filter(
        (lesson) => lesson.lesson == lessonId
      )[0].posttest_attemps.length;

      // check if any attempt passed the post test
      if (
        studentIdentity.lessons
          .filter((lesson) => lesson.lesson == lessonId)[0]
          .posttest_attemps.filter((attempt) => attempt.status == "PASS")
          .length > 0
      ) {
        // if so, set the lesson status to passed
        studentProgress.lessons.filter(
          (lesson) => lesson.lesson == lessonId
        )[0].status = "PASS";
      } else {
        // else if the student has taken 5 attempts and none passed, set the lesson status to failed
        if (attempts == 5) {
          studentProgress.lessons.filter(
            (lesson) => lesson.lesson == lessonId
          )[0].status = "FAILED";
        }
      }

      // save the changes

      await studentInClass.save({ session });
      await studentProgress.save({ session });

      await session.commitTransaction();

      return res.json({
        status: true,
        data: posttestResult,
      });
    } catch (error) {
      await session.abortTransaction();
      console.log(error);
      return res.json({ status: false, error });
    } finally {
      session.endSession();
    }
  },

  startAssesment: async (req, res) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const classId = req.params.class;
      const lessonId = req.params.lesson;
      const conceptId = req.params.concept;
      const studentId = req.user.id;

      if (!classId) throw "Class code is required!";
      if (!lessonId) throw "Lesson ID is required!";
      if (!conceptId) throw "Concept ID is required!";

      // check if student is already in class
      const studentInClass = await classes
        .findOne({
          _id: classId,
          students: { $elemMatch: { student: studentId } },
        })
        .populate({
          path: "lessons",
          populate: {
            path: "concepts",
          },
        });
      if (!studentInClass) throw "Student is not in this class";

      const studentIdentity = studentInClass.students.find(
        (student) => student.student._id.toString() == studentId
      );

      // check if student status is already set to dropped
      if (studentIdentity.status == "DROPPED")
        throw "Student already dropped from this class";

      // check if student status is already set to pending
      if (studentIdentity.status == "PENDING")
        throw "Student is still pending to be enrolled in this class";

      // check if student status is already set to enrolled
      if (studentIdentity.status != "ENROLLED")
        throw "Student is not enrolled in this class";

      // check if lesson is in class
      if (
        studentInClass.lessons.filter((lesson) => lesson._id == lessonId)
          .length == 0
      )
        throw "Lesson is not in this class";

      // check if the concept is in the lesson
      if (
        studentInClass.lessons
          .filter((lesson) => lesson._id == lessonId)[0]
          .concepts.filter((concept) => concept._id == conceptId).length == 0
      )
        throw "Concept is not in this lesson";

      // get the student's lesson pretest mastery score
      const lessonPretestMasteryScore = studentIdentity.lessons.filter(
        (lesson) => lesson.lesson == lessonId
      );

      if (!lessonPretestMasteryScore[0]?.pretest_score)
        throw "Student has not taken the lesson's pretest yet";

      // get the concept's mastery score
      const mastery =
        lessonPretestMasteryScore[0].pretest_score.concept_mastery.filter(
          (mastery) => mastery.concept == conceptId
        )[0].mastery;

      // create the assesment session
      assesmentUuid = require("crypto").randomUUID();
      const entry = await assesment.create({
        assessment_uuid: assesmentUuid,
        class: classId,
        lesson: lessonId,
        concept: conceptId,
        student: studentId,
        pretest_concept_mastery: mastery,
      });

      // save the assesment to the student's lesson's assesment sessions
      studentInClass.students[0].lessons
        .filter((lesson) => lesson.lesson == lessonId)[0]
        .assesment_sessions.push(entry._id);

      await studentInClass.save({ session });

      await session.commitTransaction();

      return res.json({ status: true, data: entry });
    } catch (error) {
      await session.abortTransaction();
      console.log(error);
      return res.json({ status: false, error });
    } finally {
      session.endSession();
    }
  },
  getAssesmentQuestions: async (req, res) => {
    try {
      const conceptId = req.params.concept;
      const difficulty = req.query.difficulty.toUpperCase();
      const prevQuestions = queryParser.parseToArray(req.query.prev);

      if (!conceptId) throw "Concept ID is required!";
      if (!difficulty) throw "Difficulty is required!";

      // find question with same concept and difficulty and not repeated
      let conceptEntry = await concept
        .findOne({
          _id: conceptId,
        })
        .populate("questions");
      if (!conceptEntry) throw "Concept not found";

      // check if the concept has questions
      if (conceptEntry.questions.length == 0) throw "Concept has no questions";

      // filter deleted questions
      conceptEntry.questions = conceptEntry.questions.filter((question) => {
        return question.isDeleted != true;
      });

      // filter previous questions
      let questions = conceptEntry.questions.filter(
        (question) => !prevQuestions.includes(question._id.toString())
      );
      // if null then return all questions
      if (questions.length == 0) questions = conceptEntry.questions;

      // filter by difficulty
      questions = questions.filter(
        (question) => question.difficulty == difficulty
      );
      // if null then return all questions
      if (questions.length == 0) questions = conceptEntry.questions;

      // if still no questions, throw error
      if (questions.length == 0)
        throw "No valid questions found, please add more";

      const question = questions[Math.floor(Math.random() * questions.length)];

      return res.json({ status: true, data: question });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  submitAssesmentAnswer: async (req, res) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const assesmentUuid = req.params.assesment;
      const questionId = req.body.question;
      const answer = req.body.answer.toUpperCase();

      if (!assesmentUuid) throw "Assesment UUID is required!";
      if (!questionId) throw "Question ID is required!";
      if (!answer) throw "Answer is required!";

      // check if assesment exists
      const assesmentSession = await assesment.findOne({
        assessment_uuid: assesmentUuid,
      });
      if (!assesmentSession) throw "Assesment UUID not found";

      // check if status is already set to complete
      if (assesmentSession.status == "COMPLETE")
        throw "Assesment is already complete";

      // check if question exists
      const selectedQuestion = await question.findOne({
        _id: questionId,
      });
      if (!selectedQuestion) throw "Question ID not found";

      // update the assesment
      const entry = await assesment.findOneAndUpdate(
        {
          assessment_uuid: assesmentUuid,
        },
        {
          $push: {
            questions: {
              order: assesmentSession.questions.length + 1,
              question: questionId,
              mark: answer == selectedQuestion.answer ? "CORRECT" : "INCORRECT",
            },
          },
        },
        { new: true, session }
      );

      // count the number of correct answers
      const correctAnswers = entry.questions.filter(
        (question) => question.mark == "CORRECT"
      ).length;

      if (correctAnswers >= 5) {
        entry.status = "COMPLETE";
        await entry.save({ session });

        // update the student progress
        const studentInClass = await student
          .findOne(
            {
              _id: entry.student,
            },
            null,
            { session }
          )
          .populate({
            path: "progress.lessons",
            populate: {
              path: "concepts",
            },
          });
        console.log(studentInClass.progress);
        console.log(entry.class);
        const concept = studentInClass.progress
          .filter(
            (classes) => classes.classId.toString() == entry.class.toString()
          )[0]
          .lessons.filter(
            (lesson) =>
              lesson.lessonId._id.toString() == entry.lesson.toString()
          )[0]
          .concepts.filter(
            (concept) =>
              concept.conceptId._id.toString() == entry.concept.toString()
          )[0];

        concept.isCompleted = true;
        await studentInClass.save({ session });
      }

      await session.commitTransaction();

      return res.json({
        status: true,
        data: answer == selectedQuestion.answer ? "CORRECT" : "INCORRECT",
      });
    } catch (error) {
      await session.abortTransaction();
      console.log(error);
      return res.json({ status: false, error });
    } finally {
      session.endSession();
    }
  },

  getAssesmentResults: async (req, res) => {
    try {
      const assesmentId = req.params.id;

      if (!assesmentId) throw "Assesment id is required!";

      const assesmentSession = await assesment
        .findOne({
          _id: assesmentId,
        })
        .populate({
          path: "questions",
          populate: {
            path: "question",
          },
        });
      if (!assesmentSession) throw "Assesment not found!";

      return res.json({ status: true, data: assesmentSession });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },

  getPretestResults: async (req, res) => {
    try {
      const classId = req.query.class;
      const lessonId = req.query.lesson;
      const studentId = req.query.student;

      if (!classId) throw "Class id is required!";
      if (!lessonId) throw "Lesson id is required!";
      if (!studentId) throw "Student id is required!";

      const classEntry = await classes
        .findOne({
          _id: classId,
        })
        .populate({
          path: "students",
          populate: {
            path: "lessons",
          },
        });

      if (!classEntry) throw "Class not found!";

      if (!classEntry.lessons.includes(lessonId))
        throw "Lesson not found in class!";

      const student = classEntry.students
        .filter((student) => student.student == studentId)[0]
        .lessons.filter((lesson) => lesson.lesson == lessonId)[0];

      if (!student) throw "Student not found in class lesson!";

      return res.json({ status: true, data: student.pretest_score });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },

  getPosttestResults: async (req, res) => {
    try {
      const classId = req.query.class;
      const lessonId = req.query.lesson;
      const studentId = req.query.student;

      if (!classId) throw "Class id is required!";
      if (!lessonId) throw "Lesson id is required!";
      if (!studentId) throw "Student id is required!";

      const classEntry = await classes
        .findOne({
          _id: classId,
        })
        .populate({
          path: "students",
          populate: {
            path: "lessons",
          },
        });

      if (!classEntry) throw "Class not found!";

      if (!classEntry.lessons.includes(lessonId))
        throw "Lesson not found in class!";

      const student = classEntry.students
        .filter((student) => student.student == studentId)[0]
        .lessons.filter((lesson) => lesson.lesson == lessonId)[0];

      if (!student) throw "Student not found in class lesson!";

      return res.json({ status: true, data: student.posttest_attemps });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
};

module.exports = classroomController;
