const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const postTestQuestionV2 = new Schema(
  {
    posttestId: { type: Schema.Types.ObjectId, ref: "v2posttest" },
    order: { type: Number, default: 1, min: 1, max: 20 },
    text: { type: String },
    tags: { type: String },

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

postTestQuestionV2.plugin(mongoosePaginate);

module.exports = {
  postTestQuestionV2: mongoose.model("v2posttest_question", postTestQuestionV2),
};
