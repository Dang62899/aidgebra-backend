const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const preTestV2 = new Schema(
  {
    lessonId: { type: Schema.Types.ObjectId, ref: "v2lesson" },
  },
  { timestamps: true }
);

preTestV2.plugin(mongoosePaginate);

module.exports = {
  preTestV2: mongoose.model("v2pretest", preTestV2),
};
