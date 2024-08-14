const mongoose = require("mongoose");
const queryParser = require("../../helpers/query-parser");

const { conceptV2 } = require("../../models/v2/concept.schema");
const { postTestV2 } = require("../../models/v2/posttest.schema");
const {
  postTestQuestionV2,
} = require("../../models/v2/posttest_question.schema");

const posttestQuestionController = {
  all: async (req, res) => {
    try {
      let filter = {};

      if (req.query.posttest) {
        filter.posttestId = req.query.posttest;
      }

      let entry = await postTestQuestionV2.find(filter);

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  paginate: async (req, res) => {
    const page = req.query.page || 1;

    try {
      const options = {
        sort: { createdAt: "desc" },
        page,
        limit: req.query.count || 10,
      };

      let query = {};

      if (req.query.posttest) {
        query.posttestId = req.query.posttest;
      }

      if (req.query.search) {
        let regex = new RegExp(req.query.search, "i");
        query = {
          ...query,
          $and: [
            {
              $or: [{ text: regex }],
            },
          ],
        };
      }

      const entry = await postTestQuestionV2.paginate(query, options);

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  view: async (req, res) => {
    try {
      const entry = await postTestQuestionV2.findOne({ _id: req.params.id });

      if (!entry) throw "Post test question not found";

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  create: async (req, res) => {
    try {
      const data = req.body;

      // check if allowed
      const allowedRoles = ["ADMIN"];
      if (!allowedRoles.includes(req.user.role)) {
        throw "You are not allowed to do this";
      }

      if (!data.posttest) throw "Post test id is required";
      if (!data.text) throw "Question text is required";
      if (!data.order) throw "Question order is required";
      if (!data.tags) throw "tag is required";
      if (!data.choiceA) throw "Choice A is required";
      if (!data.choiceB) throw "Choice B is required";
      if (!data.choiceC) throw "Choice C is required";
      if (!data.choiceD) throw "Choice D is required";
      if (!data.answer) throw "Answer is required";

      // check if post test exists
      const posttest = await postTestV2.findOne({ _id: data.posttest });
      if (!posttest) throw "Posttest not found";

      // check if posttest already has 20 questions
      const questions = await postTestQuestionV2.find({
        posttestId: data.posttest,
      });
      if (questions.length >= 20)
        throw "Post test already has 20 questions, delete or edit one before adding a new question";

      // check if question with same posttest and order already exists
      const question = await postTestQuestionV2.findOne({
        posttestId: data.posttest,
        order: data.order,
      });
      if (question) throw "Question with same order already exists";

      const questionEntry = {
        posttestId: data.posttest,
        text: data.text,
        order: data.order,
        tags: data.tags,
        choiceA: { text: data.choiceA },
        choiceB: { text: data.choiceB },
        choiceC: { text: data.choiceC },
        choiceD: { text: data.choiceD },
        answer: data.answer,
      };

      const entry = await postTestQuestionV2.create([questionEntry]);

      if (!entry) throw "Post test question not created";

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  update: async (req, res) => {
    try {
      const data = req.body;

      // check if allowed
      const allowedRoles = ["ADMIN"];
      if (!allowedRoles.includes(req.user.role)) {
        throw "You are not allowed to do this";
      }

      if (!data.text) throw "Question text is required";
      if (!data.tags) throw "tag is required";
      if (!data.choiceA) throw "Choice A is required";
      if (!data.choiceB) throw "Choice B is required";
      if (!data.choiceC) throw "Choice C is required";
      if (!data.choiceD) throw "Choice D is required";
      if (!data.answer) throw "Answer is required";

      const questionEntry = {
        text: data.text,
        tags: data.tags,
        choiceA: { text: data.choiceA },
        choiceB: { text: data.choiceB },
        choiceC: { text: data.choiceC },
        choiceD: { text: data.choiceD },
        answer: data.answer,
      };

      const entry = await postTestQuestionV2.findOneAndUpdate(
        { _id: req.params.id },
        questionEntry,
        { new: true, runValidators: true }
      );

      if (!entry) throw "Post test question not updated";

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  delete: async (req, res) => {
    try {
      if (req.user.role != "ADMIN") throw "You are not an admin";

      const entry = await postTestQuestionV2.deleteOne({ _id: req.params.id });

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
};

module.exports = posttestQuestionController;
