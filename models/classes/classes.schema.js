const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const classes = new Schema(
  {
    code: { type: String, unique: true },
    name: { type: String, minlength: 3, maxlength: 255 },
    teacher: { type: Schema.Types.ObjectId, ref: "teacher" },
    status: {
      type: String,
      default: "ACTIVE",
      uppercase: true,
      enum: {
        values: ["ACTIVE", "INACTIVE"],
        message: "Invalid Status",
      },
    },
    lessons: [
      {
        type: Schema.Types.ObjectId,
        ref: "lesson",
      },
    ],
    students: [
      {
        student: { type: Schema.Types.ObjectId, ref: "student" },
        status: {
          type: String,
          default: "PENDING",
          uppercase: true,
          enum: {
            values: ["PENDING", "ENROLLED", "DROPPED"],
            message: "Invalid Enrollment Status",
          },
        },
        completed_lessons: [{ type: Schema.Types.ObjectId, ref: "lesson" }],
        alt_concept_lectures: [{ type: Schema.Types.ObjectId, ref: "concept" }],
        lessons: [
          {
            lesson: { type: Schema.Types.ObjectId, ref: "lesson" },
            pretest_score: {
              taken: { type: Boolean, default: false },
              questions: [
                {
                  order: { type: Number, min: 1, max: 20 },
                  concept: { type: Schema.Types.ObjectId, ref: "concept" },
                  question: { type: Schema.Types.ObjectId, ref: "question" },
                  mark: {
                    type: String,
                    uppercase: true,
                    enum: {
                      values: ["CORRECT", "INCORRECT"],
                      message: "Invalid Mark",
                    },
                  },
                },
              ],
              total_score: { type: Number, default: 0 },
              concept_mastery: [
                {
                  concept: { type: Schema.Types.ObjectId, ref: "concept" },
                  score: { type: Number, default: 0 },
                  mastery: {
                    type: String,
                    uppercase: true,
                    enum: {
                      values: ["MASTERED", "UNMASTERED"],
                      message: "Invalid Mastery",
                    },
                  },
                },
              ],
            },

            assesment_sessions: [
              {
                type: Schema.Types.ObjectId,
                ref: "assesment",
              },
            ],

            posttest_attemps: [
              {
                attempt: { type: Number },
                total_score: { type: Number },
                failed_concepts: [
                  {
                    type: Schema.Types.ObjectId,
                    ref: "concept",
                  },
                ],
                status: {
                  type: String,
                  uppercase: true,
                  enum: {
                    values: ["PASS", "FAILED"],
                    message: "Invalid Status",
                  },
                },
                questions: [
                  {
                    order: { type: Number, min: 1, max: 20 },
                    concept: { type: Schema.Types.ObjectId, ref: "concept" },
                    question: { type: Schema.Types.ObjectId, ref: "question" },
                    mark: {
                      type: String,
                      uppercase: true,
                      enum: {
                        values: ["CORRECT", "INCORRECT"],
                        message: "Invalid Mark",
                      },
                    },
                  },
                ],
                concept_mastery: {
                  concept: { type: Schema.Types.ObjectId, ref: "concept" },
                  score: { type: Number },
                  mastery: {
                    type: String,
                    uppercase: true,
                    enum: {
                      values: ["MASTERED", "UNMASTERED"],
                      message: "Invalid Mastery",
                    },
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

classes.plugin(mongoosePaginate);

module.exports = {
  classes: mongoose.model("classes", classes),
};
