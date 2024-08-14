const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const conceptQuestionV2 = new Schema(
  {
    conceptId: { type: Schema.Types.ObjectId, ref: "v2concept" },
    text: { type: String },
    explaination: { type: String },

    difficulty: {
      type: String,
      uppercase: true,
      enum: ["EASY", "AVERAGE", "DIFFICULT"],
    },

    choiceA: {
      text: { type: String },
      value: { type: String, default: "A" },
    },
    choiceB: {
      text: { type: String },
      value: { type: String, default: "B" },
    },
    choiceC: {
      text: { type: String },
      value: { type: String, default: "C" },
    },
    choiceD: {
      text: { type: String },
      value: { type: String, default: "D" },
    },

    answer: { type: String, uppercase: true, enum: ["A", "B", "C", "D"] },
  },
  { timestamps: true }
);

conceptQuestionV2.plugin(mongoosePaginate);

module.exports = {
  conceptQuestionV2: mongoose.model("v2concept_question", conceptQuestionV2),
};
