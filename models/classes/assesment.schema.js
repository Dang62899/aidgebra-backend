const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const assesment = new Schema(
  {
    assessment_uuid: { type: String, unique: true },
    class: { type: Schema.Types.ObjectId, ref: "classes" },
    lesson: { type: Schema.Types.ObjectId, ref: "lessons" },
    student: { type: Schema.Types.ObjectId, ref: "student" },
    concept: { type: Schema.Types.ObjectId, ref: "concept" },
    status: {
      type: String,
      default: "INCOMPLETE",
      uppercase: true,
      enum: {
        values: ["COMPLETE", "INCOMPLETE"],
        message: "Invalid Status",
      },
    },
    pretest_concept_mastery: {
      type: String,
      uppercase: true,
      enum: {
        values: ["MASTERED", "UNMASTERED"],
        message: "Invalid Mastery",
      },
    },
    questions: [
      {
        order: { type: Number, min: 1 },
        question: { type: Schema.Types.ObjectId, ref: "question" },
        mark: {
          type: String,
          uppercase: true,
          enum: {
            values: ["CORRECT", "INCORRECT"],
            message: "Invalid Mark",
          },
        },
      },
    ],
  },
  { timestamps: true }
);

assesment.plugin(mongoosePaginate);

module.exports = {
  assesment: mongoose.model("assesment", assesment),
};
