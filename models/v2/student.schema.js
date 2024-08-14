const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const studentV2 = new Schema(
  {
    email: { type: String, unique: true },
    password: { type: String },
    fullname: { type: String },
    firstname: { type: String },
    middlename: { type: String },
    lastname: { type: String },
    contact: { type: String },
    avatar: [],

    isVerified : { type : Boolean, default : false},
    refreshToken: { type: String },
    refreshTokenDate: { type: Date },
    status: {
      type: String,
      default: "ACTIVE",
      uppercase: true,
      enum: ["PENDING", "ACTIVE", "DEACTIVATED"],
    },

    classId: { type: Schema.Types.ObjectId, ref: "v2class", default: null },
    classStatus: { type: String, uppercase: true, enum: ["PENDING", "JOINED"] },

    lessons: [
      {
        lessonId: { type: Schema.Types.ObjectId, ref: "v2lesson" },
        status: {
          type: String,
          uppercase: true,
          enum: ["STARTED", "COMPLETED", "FAILED"],
        },
        concepts: [
          {
            conceptId: { type: Schema.Types.ObjectId, ref: "v2concept" },
            conceptName: { type: String },
            isCompleted: { type: Boolean },
            alternateLecture: { type: Boolean },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

studentV2.plugin(mongoosePaginate);

module.exports = {
  studentV2: mongoose.model("v2student", studentV2),
};
