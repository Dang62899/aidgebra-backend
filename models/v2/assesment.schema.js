const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const assesmentV2 = new Schema(
  {
    uuid: { type: String, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: "v2student" },
    conceptId: { type: Schema.Types.ObjectId, ref: "v2concept" },
    conceptName: { type: String },
    status: {
      type: String,
      default: "INCOMPLETE",
      uppercase: true,
      enum: {
        values: ["COMPLETE", "INCOMPLETE"],
        message: "Invalid Status",
      },
    },
    results: [
      {
        order: { type: Number, min: 1 },
        question: { type: String },
        answer: { type: String },
        correctAnswer: { type: String },
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

assesmentV2.plugin(mongoosePaginate);

module.exports = {
  assesmentV2: mongoose.model("v2assesment", assesmentV2),
};
