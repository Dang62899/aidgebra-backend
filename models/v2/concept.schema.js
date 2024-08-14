const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const conceptV2 = new Schema(
  {
    lessonId: { type: Schema.Types.ObjectId, ref: "v2lesson" },
    name: { type: String, minlength: 3, maxlength: 255 },
    order: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true }
);

conceptV2.plugin(mongoosePaginate);

module.exports = {
  conceptV2: mongoose.model("v2concept", conceptV2),
};
