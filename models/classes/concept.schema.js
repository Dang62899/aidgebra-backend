const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const concept = new Schema(
  {
    name: { type: String, minlength: 3, maxlength: 255 },
    lesson: { type: Schema.Types.ObjectId, ref: "lesson" },
    conceptOrder: { type: Number, default: 1, min: 1 },
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: "question",
      },
    ],
    lectureA: { type: Schema.Types.ObjectId, ref: "lecture" },
    lectureB: { type: Schema.Types.ObjectId, ref: "lecture" },
  },
  { timestamps: true }
);

concept.plugin(mongoosePaginate);

module.exports = {
  concept: mongoose.model("concept", concept),
};
