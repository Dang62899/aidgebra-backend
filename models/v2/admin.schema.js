const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const adminV2 = new Schema({
  email: { type: String, unique: true },
  password: { type: String },
  fullname: { type: String },
  firstname: { type: String },
  middlename: { type: String },
  lastname: { type: String },
  contact: { type: String },
  avatar: [],
  date_created: { type: Date, default: Date.now },
  date_modified: { type: Date, default: Date.now },
  refreshToken: { type: String },
  refreshTokenDate: { type: Date },
  status: {
    type: String,
    default: "ACTIVE",
    uppercase: true,
    enum: ["PENDING", "ACTIVE", "DEACTIVATED"],
  },
});

adminV2.plugin(mongoosePaginate);

module.exports = {
  adminV2: mongoose.model("v2admin", adminV2),
};
