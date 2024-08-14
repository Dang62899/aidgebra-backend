const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const lectureV2 = new Schema(
  {
    conceptId: { type: Schema.Types.ObjectId, ref: "v2concept" },
    material: { type: String },
    setType: { type: String, uppercase: true, enum: ["A", "B"] },
  },
  { timestamps: true }
);

lectureV2.plugin(mongoosePaginate);

module.exports = {
  lectureV2: mongoose.model("v2lecture", lectureV2),
};
