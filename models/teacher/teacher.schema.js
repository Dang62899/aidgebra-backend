const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const teacher = new Schema(
  {
    // credentials
    email: { type: String, unique: true },
    password: { type: String, minlength: 6 },
    // specifications
    teacher_id: { type: String, unique: true },
    fullname: { type: String },
    contact: { type: String },
    // customize
    avatar: [],

    // mod
    refreshToken: { type: String },
    refreshTokenDate: { type: Date },
    status: {
      type: String,
      default: "PENDING",
    },
  },
  { timestamps: true }
);

teacher.plugin(mongoosePaginate);

module.exports = {
  teacher: mongoose.model("teacher", teacher),
};
