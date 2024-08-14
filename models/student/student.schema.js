const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const student = new Schema(
  {
    // credentials
    email: { type: String, unique: true },
    password: { type: String },
    // specifications
    student_id: { type: String, unique: true },
    fullname: { type: String },
    contact: { type: String },
    // customize
    avatar: [],

    isVerified : { type : Boolean, default : false},
    refreshToken: { type: String },
    refreshTokenDate: { type: Date },
    status: {
      type: String,
      default: "ACTIVE",
    },

    progress: [
      {
        classId: { type: Schema.Types.ObjectId, ref: "classes" },
        status: {
          type: String,
          uppercase: true,
          enum: ["DROPPED", "ENROLLED"],
        },
        lessons: [
          {
            lessonId: { type: Schema.Types.ObjectId, ref: "lesson" },
            status: {
              type: String,
              uppercase: true,
              enum: ["PASS", "FAILED", "IN PROGRESS"],
            },
            concepts: [
              {
                conceptId: { type: Schema.Types.ObjectId, ref: "concept" },
                mastery: {
                  type: String,
                  uppercase: true,
                  enum: ["MASTERED", "UNMASTERED"],
                },
                isCompleted: { type: Boolean },
              },
            ],
            pretest_results: {
              concepts: [
                {
                  conceptId: { type: Schema.Types.ObjectId, ref: "concept" },
                  mastery: {
                    type: String,
                    uppercase: true,
                    enum: ["MASTERED", "UNMASTERED"],
                  },
                },
              ],
              results: [
                {
                  conceptId: { type: Schema.Types.ObjectId, ref: "concept" },
                  incorrectlyAnswered: { type: Number },
                },
              ],
            },
            posttest_results: [
              {
                attemptNumber: { type: Number },
                concepts: [
                  {
                    conceptId: { type: Schema.Types.ObjectId, ref: "concept" },
                    mastery: {
                      type: String,
                      uppercase: true,
                      enum: ["MASTERED", "UNMASTERED"],
                    },
                  },
                ],
                results: [
                  {
                    conceptId: { type: Schema.Types.ObjectId, ref: "concept" },
                    incorrectlyAnswered: { type: Number },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

student.plugin(mongoosePaginate);

module.exports = {
  student: mongoose.model("student", student),
};
