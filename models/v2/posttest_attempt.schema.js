const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const postTestAttemptV2 = new Schema(
  {
    lessonId: { type: Schema.Types.ObjectId, ref: "v2lesson" },
    studentId: { type: Schema.Types.ObjectId, ref: "v2student" },

    attemptNumber: { type: Number },
    isPassed: { type: Boolean },

    totalScore: { type: Number },
    questions: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: "v2posttest_question" },
        order: { type: Number },
        conceptName: { type: String },
        question: { type: String },
        answerText: { type: String },
        correctText: { type: String },
        answer: {
          type: String,
          uppercase: true,
          enum: ["A", "B", "C", "D"],
        },
        correctAnswer: {
          type: String,
          uppercase: true,
          enum: ["A", "B", "C", "D"],
        },
        isCorrect: { type: Boolean },
      },
    ],
    result: [
      {
        conceptId: { type: Schema.Types.ObjectId, ref: "v2concept" },
        conceptName: { type: String },
        correctAnswers: { type: Number },
        mastery: {
          type: String,
          uppercase: true,
          enum: ["MASTERED", "UNMASTERED"],
        },
      },
    ],
  },
  { timestamps: true }
);

postTestAttemptV2.plugin(mongoosePaginate);

module.exports = {
  postTestAttemptV2: mongoose.model("v2posttest_attempt", postTestAttemptV2),
};
