const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const teacherV2 = new Schema(
  {
    email: { type: String, unique: true },
    password: { type: String, minlength: 6 },
    fullname: { type: String },
    firstname: { type: String },
    middlename: { type: String },
    lastname: { type: String },
    contact: { type: String },

    avatar: [],

    // mod
    isVerified : { type : Boolean, default : false},
    refreshToken: { type: String },
    refreshTokenDate: { type: Date },
    status: {
      type: String,
      default: "PENDING",
      uppercase: true,
      enum: ["PENDING", "ACTIVE", "DEACTIVATED"],
    },
  },
  { timestamps: true }
);

teacherV2.plugin(mongoosePaginate);

module.exports = {
  teacherV2: mongoose.model("v2teacher", teacherV2),
};
