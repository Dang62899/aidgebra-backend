const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const announcementV2 = new Schema(
  {
    message: { type: String },
    isShown: { type: Boolean, default: false },
  },
  { timestamps: true }
);

announcementV2.plugin(mongoosePaginate);

module.exports = {
  announcementV2: mongoose.model("v2announcement", announcementV2),
};
