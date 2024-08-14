const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const preTestResultV2 = new Schema(
  {
    lessonId: { type: Schema.Types.ObjectId, ref: "v2lesson" },
    studentId: { type: Schema.Types.ObjectId, ref: "v2student" },
    knowledgeLevel: {
      type: String,
      uppercase: true,
      enum: ["POOR", "FAIR", "AVERAGE", "GOOD", "VERY GOOD", "EXCELLENT"],
    },
    totalScore: { type: Number },
    questions: [
      {
        order: { type: Number },
        question: { type: String },
        answer: {
          type: String,
          uppercase: true,
          enum: ["A", "B", "C", "D"],
        },
        answerText: { type: String },
        correctText: { type: String },
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

preTestResultV2.plugin(mongoosePaginate);

module.exports = {
  preTestResultV2: mongoose.model("v2pretest_result", preTestResultV2),
};
