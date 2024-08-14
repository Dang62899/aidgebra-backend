const { assesmentV2 } = require("../../models/v2/assesment.schema");
const { conceptV2 } = require("../../models/v2/concept.schema");
const {
  conceptQuestionV2,
} = require("../../models/v2/concept_question.schema");
const { studentV2 } = require("../../models/v2/student.schema");

const assesmentController = {
  all: async (req, res) => {
    try {
      let filter = {};

      if (req.query.concept) {
        filter.conceptId = req.query.concept;
      }

      if (req.query.student) {
        filter.studentId = req.query.student;
      }

      const entry = await assesmentV2.find(filter).populate("conceptId");

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
        populate: ["conceptId"],
      };

      let query = {};

      if (req.query.concept) {
        query.conceptId = req.query.concept;
      }

      if (req.query.student) {
        query.studentId = req.query.student;
      }

      if (req.query.search) {
        let regex = new RegExp(req.query.search, "i");
        query = {
          ...query,
          $and: [
            {
              $or: [{ uuid: regex }],
            },
          ],
        };
      }

      const entry = await assesmentV2.paginate(query, options);

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  view: async (req, res) => {
    try {
      const entry = await assesmentV2
        .findOne({ _id: req.params.id })
        .populate("conceptId");

      if (!entry) throw "Assesment session not found";

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  create: async (req, res) => {
    try {
      const data = req.body;
      const user = req.user;
      // check if allowed
      const allowedRoles = ["STUDENT"];
      if (!allowedRoles.includes(user.role)) {
        throw "Only students can create assesment sessions";
      }

      if (!data.concept) throw "Concept is required";

      // check if concept exists
      const concept = await conceptV2.findOne({ _id: data.concept });
      if (!concept) throw "Concept not found";

      // create the session
      const assesmentUuid = require("crypto").randomUUID();
      const entry = await assesmentV2.create([
        {
          uuid: assesmentUuid,
          conceptId: concept._id,
          studentId: user.id,
          conceptName: concept.name,
          status: "INCOMPLETE",
          results: [],
        },
      ]);

      if (!entry) throw "Assesment not created";

      return res.json({ status: true, data: entry[0] });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  update: async (req, res) => {
    try {
      const data = req.body;
      const user = req.user;

      // check if allowed
      const allowedRoles = ["STUDENT"];
      if (!allowedRoles.includes(user.role)) {
        throw "Only students can update assesment sessions";
      }

      if (!req.params.uuid) throw "UUID is required";
      if (!data.question) throw "Question Id is required";
      if (!data.answer) throw "Answer is required";

      // check if assesment exists
      const assesment = await assesmentV2.findOne({ uuid: req.params.uuid });
      if (!assesment) throw "Assesment not found";

      // check if assesment is already completed
      if (assesment.status == "COMPLETE") throw "Assesment already completed";

      let updatedData = {};

      // check and add the question to the results
      const userAnswer = data.answer.toUpperCase();
      let questionResult = null;

      // get the question
      const question = await conceptQuestionV2.findOne({
        _id: data.question,
      });

      if (!question) throw "Question not found";

      // get the answer
      questionResult = {
        order: assesment.results.length + 1,
        question: question.text,
        answer: userAnswer,
        correctAnswer: question.answer,
        mark: userAnswer == question.answer ? "CORRECT" : "INCORRECT",
      };

      // add to the list of results
      updatedData["$push"] = {
        results: questionResult,
      };

      let entry = await assesmentV2
        .findOneAndUpdate({ uuid: req.params.uuid }, updatedData, { new: true })
        .populate("conceptId");

      // check the results of already has 5 correct answers
      const results = entry.results;
      const correctAnswers = results.filter(
        (result) => result.mark == "CORRECT"
      );

      if (correctAnswers.length >= 5) {
        entry.status = "COMPLETE";
        console.log(
          "----------------------- COMPLETED UPDATE THE USER ----------------------"
        );
        // set the concept as completed in student
        const userStudent = await studentV2
          .findOne({ _id: user.id })
          .populate("classId")
          .populate({
            path: "lessons",
            populate: {
              path: "lessonId",
            },
          });

        console.log(userStudent.lessons);
        console.log(entry);

        console.log(userStudent.lessons[0].lessonId._id);
        console.log(entry.conceptId.lessonId);
        // get the lesson in students info
        const existingLesson = userStudent.lessons.find((lesson) => {
          if (
            lesson.lessonId._id.toString() ==
            entry.conceptId.lessonId.toString()
          ) {
            return lesson;
          }
        });

        console.log(existingLesson);

        // check if the lesson already has concepts
        if (existingLesson.concepts.length > 0) {
          const concept = existingLesson.concepts.find((concept) => {
            if (
              concept.conceptId._id.toString() == entry.conceptId._id.toString()
            ) {
              return concept;
            }
          });

          // if there are concepts but not with this id then add it
          if (!concept) {
            existingLesson.concepts.push({
              conceptId: entry.conceptId._id,
              conceptName: entry.conceptId.name,
              isCompleted: true,
              alternateLecture: false,
            });
          } else {
            // if there are concepts with this id then update it
            const concept = existingLesson.concepts.find(
              (concept) =>
                concept.conceptId.toString() == entry.conceptId._id.toString()
            );
            concept.isCompleted = true;
          }
        } else {
          // if no concepts yet, add the concept
          existingLesson.concepts.push({
            conceptId: entry.conceptId._id,
            conceptName: entry.conceptId.name,
            isCompleted: true,
            alternateLecture: false,
          });
        }

        await userStudent.save();
      }

      entry = await entry.save({ new: true });

      if (!entry) throw "Assesment session not found";

      return res.json({
        status: true,
        data: entry,
        correct: userAnswer == question.answer ? "CORRECT" : "INCORRECT",
      });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  delete: async (req, res) => {
    try {
      if (req.user.role != "ADMIN") throw "You are not an admin";

      const entry = await assesmentV2.deleteOne({ _id: req.params.id });

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
};

module.exports = assesmentController;
