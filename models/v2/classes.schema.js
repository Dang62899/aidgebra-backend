const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const classesV2 = new Schema(
  {
    code: { type: String, unique: true },
    name: { type: String, minlength: 3, maxlength: 255 },
    teacher: { type: Schema.Types.ObjectId, ref: "v2teacher", default: null },
  },
  { timestamps: true }
);

classesV2.plugin(mongoosePaginate);

module.exports = {
  classesV2: mongoose.model("v2class", classesV2),
};
