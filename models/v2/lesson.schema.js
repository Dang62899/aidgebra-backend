const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const lessonV2 = new Schema(
  {
    order: { type: Number },
    name: { type: String, minlength: 3, maxlength: 255 },
  },
  { timestamps: true }
);

lessonV2.plugin(mongoosePaginate);

module.exports = {
  lessonV2: mongoose.model("v2lesson", lessonV2),
};
