const { classes } = require("../../models/classes/classes.schema");
const { student } = require("../../models/student/student.schema");

const monitoringController = {
  classMonitoringConcepts: async (req, res) => {
    try {
      const classId = req.params.class;
      const classData = await classes
        .findById(classId)
        .populate("lessons")
        .populate({
          path: "students",
          populate: {
            path: "lessons",
            populate: [
              {
                path: "lesson",
              },
              {
                path: "posttest_attemps",
                populate: {
                  path: "questions",
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
            ],
          },
        });

      if (!classData) throw "Class not found";

      let posttest_list = [];

      classData.students.forEach((student) => {
        student.lessons.forEach((lesson) => {
          if (lesson.posttest_attemps.length > 0) {
            posttest_list = [...posttest_list, ...lesson.posttest_attemps];
          }
        });
      });

      const conceptsIncorrect = [];

      posttest_list.forEach((posttest) => {
        posttest.questions.forEach((question) => {
          let concept = null;
          const conceptAlreadyInlist = conceptsIncorrect.find((concept) => {
            return concept.conceptName == question.concept.name;
          });

          // find the concept in the list otherwise add it
          if (conceptAlreadyInlist) {
            concept = conceptAlreadyInlist;
          } else {
            concept = {
              conceptName: question.concept.name,
              incorrectlyAnswered: 0,
            };
            conceptsIncorrect.push(concept);
          }

          if (question.mark == "INCORRECT") {
            concept.incorrectlyAnswered++;
          }
        });
      });

      return res.json({ status: true, data: conceptsIncorrect });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  classMonitoringQuestions: async (req, res) => {
    try {
      const classId = req.params.class;
      const classData = await classes
        .findById(classId)
        .populate("lessons")
        .populate({
          path: "students",
          populate: {
            path: "lessons",
            populate: [
              {
                path: "lesson",
              },
              {
                path: "posttest_attemps",
                populate: {
                  path: "questions",
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
            ],
          },
        });

      if (!classData) throw "Class not found";

      let posttest_list = [];

      classData.students.forEach((student) => {
        student.lessons.forEach((lesson) => {
          if (lesson.posttest_attemps.length > 0) {
            posttest_list = [...posttest_list, ...lesson.posttest_attemps];
          }
        });
      });

      const questionsIncorrect = [];
      console.log(posttest_list);
      posttest_list.forEach((posttest) => {
        posttest.questions.forEach((question) => {
          let q = null;
          const questionAlreadyInlist = questionsIncorrect.find((que) => {
            return que.questionName == question.question.question;
          });

          // find the concept in the list otherwise add it
          if (questionAlreadyInlist) {
            q = questionAlreadyInlist;
          } else {
            q = {
              questionName: question.question.question,
              incorrectlyAnswered: 0,
            };
            questionsIncorrect.push(q);
          }

          if (question.mark == "INCORRECT") {
            q.incorrectlyAnswered++;
          }
        });
      });

      return res.json({ status: true, data: questionsIncorrect });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  studentMonitoring: async (req, res) => {
    try {
      const classId = req.params.class;
      const studentId = req.params.student;

      const entry = await student.findById(studentId).populate({
        path: "progress",
        populate: [
          {
            path: "classId",
          },
          {
            path: "lessons",
            populate: [
              {
                path: "lessonId",
              },
              {
                path: "pretest_results.concepts",
                populate: {
                  path: "conceptId",
                },
              },
            ],
          },
        ],
      });
      if (!entry) throw "Student not found";

      const classData = entry.progress.find((progress) => {
        return progress.classId._id == classId;
      });

      return res.json({ status: true, data: classData });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
};

module.exports = monitoringController;
