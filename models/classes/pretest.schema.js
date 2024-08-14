const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const pretest = new Schema(
  {
    lesson: { type: Schema.Types.ObjectId, ref: "lesson" },

    concept1: { type: Schema.Types.ObjectId, ref: "concept" },
    concept2: { type: Schema.Types.ObjectId, ref: "concept" },
    concept3: { type: Schema.Types.ObjectId, ref: "concept" },
    concept4: { type: Schema.Types.ObjectId, ref: "concept" },
    concept5: { type: Schema.Types.ObjectId, ref: "concept" },

    question1: { type: Schema.Types.ObjectId, ref: "question" },
    question2: { type: Schema.Types.ObjectId, ref: "question" },
    question3: { type: Schema.Types.ObjectId, ref: "question" },
    question4: { type: Schema.Types.ObjectId, ref: "question" },
    question5: { type: Schema.Types.ObjectId, ref: "question" },
    question6: { type: Schema.Types.ObjectId, ref: "question" },
    question7: { type: Schema.Types.ObjectId, ref: "question" },
    question8: { type: Schema.Types.ObjectId, ref: "question" },
    question9: { type: Schema.Types.ObjectId, ref: "question" },
    question10: { type: Schema.Types.ObjectId, ref: "question" },
    question11: { type: Schema.Types.ObjectId, ref: "question" },
    question12: { type: Schema.Types.ObjectId, ref: "question" },
    question13: { type: Schema.Types.ObjectId, ref: "question" },
    question14: { type: Schema.Types.ObjectId, ref: "question" },
    question15: { type: Schema.Types.ObjectId, ref: "question" },
    question16: { type: Schema.Types.ObjectId, ref: "question" },
    question17: { type: Schema.Types.ObjectId, ref: "question" },
    question18: { type: Schema.Types.ObjectId, ref: "question" },
    question19: { type: Schema.Types.ObjectId, ref: "question" },
    question20: { type: Schema.Types.ObjectId, ref: "question" },
  },
  { timestamps: true }
);

pretest.plugin(mongoosePaginate);

module.exports = {
  pretest: mongoose.model("pretest", pretest),
};
