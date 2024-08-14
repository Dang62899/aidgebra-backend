const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const lesson = new Schema(
  {
    name: { type: String, minlength: 3, maxlength: 255 },
    class: { type: Schema.Types.ObjectId, ref: "classes" },
    lessonOrder: { type: Number, default: 1, min: 1 },
    status: {
      type: String,
      default: "ACTIVE",
      uppercase: true,
      enum: {
        values: ["ACTIVE", "INACTIVE"],
        message: "Invalid Status",
      },
    },
    pretest: {
      type: Schema.Types.ObjectId,
      ref: "pretest",
    },

    concepts: [{ type: Schema.Types.ObjectId, ref: "concept" }],
    posttest: {
      type: Schema.Types.ObjectId,
      ref: "posttest",
    },
  },
  { timestamps: true }
);

lesson.plugin(mongoosePaginate);

module.exports = {
  lesson: mongoose.model("lesson", lesson),
};
