const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const postTestV2 = new Schema(
  {
    lessonId: { type: Schema.Types.ObjectId, ref: "lesson" },
  },
  { timestamps: true }
);

postTestV2.plugin(mongoosePaginate);

module.exports = {
  postTestV2: mongoose.model("v2posttest", postTestV2),
};
