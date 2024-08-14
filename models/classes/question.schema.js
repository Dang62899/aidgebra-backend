const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const question = new Schema(
  {
    question: { type: String, minlength: 3, maxlength: 255 },
    concept: { type: Schema.Types.ObjectId, ref: "concept" },

    isDeleted: { type: Boolean, default: false },

    choiceA: {
      text: { type: String, minlength: 1, maxlength: 255 },
      value: { type: String, default: "A" },
    },
    choiceB: {
      text: { type: String, minlength: 1, maxlength: 255 },
      value: { type: String, default: "B" },
    },
    choiceC: {
      text: { type: String, minlength: 1, maxlength: 255 },
      value: { type: String, default: "C" },
    },
    choiceD: {
      text: { type: String, minlength: 1, maxlength: 255 },
      value: { type: String, default: "D" },
    },

    answer: { type: String, uppercase: true, enum: ["A", "B", "C", "D"] },

    difficulty: {
      type: String,
      uppercase: true,
      enum: {
        values: ["EASY", "AVERAGE", "DIFFICULT"],
        message: "Invalid Difficulty",
      },
    },
  },
  { timestamps: true }
);

question.plugin(mongoosePaginate);

module.exports = {
  question: mongoose.model("question", question),
};
