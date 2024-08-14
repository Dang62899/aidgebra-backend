const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const lecture = new Schema(
  {
    name: { type: String, minlength: 3, maxlength: 255 },
    concept: { type: Schema.Types.ObjectId, ref: "concept" },
    material: { type: String, minlength: 3, maxlength: 30000 },
  },
  { timestamps: true }
);

lecture.plugin(mongoosePaginate);

module.exports = {
  lecture: mongoose.model("lecture", lecture),
};
