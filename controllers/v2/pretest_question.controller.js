const mongoose = require("mongoose");
const queryParser = require("../../helpers/query-parser");

const { conceptV2 } = require("../../models/v2/concept.schema");
const { preTestV2 } = require("../../models/v2/pretest.schema");
const {
  preTestQuestionV2,
} = require("../../models/v2/pretest_question.schema");

const pretestQuestionController = {
  all: async (req, res) => {
    try {
      let filter = {};

      if (req.query.pretest) {
        filter.pretestId = req.query.pretest;
      }

      let entry = await preTestQuestionV2.find(filter);

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

      if (req.query.pretest) {
        query.pretestId = req.query.pretest;
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

      const entry = await preTestQuestionV2.paginate(query, options);

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  view: async (req, res) => {
    try {
      const entry = await preTestQuestionV2.findOne({ _id: req.params.id });

      if (!entry) throw "Pretest question not found";

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

      if (data.pretest == null) throw "Pretest id is required";
      if (!data.text) throw "Question text is required";
      if (!data.order) throw "Question order is required";
      if (!data.tags) throw "tag is required";
      if (!data.choiceA) throw "Choice A is required";
      if (!data.choiceB) throw "Choice B is required";
      if (!data.choiceC) throw "Choice C is required";
      if (!data.choiceD) throw "Choice D is required";
      if (!data.answer) throw "Answer is required";

      // check if pretest exists
      const pretest = await preTestV2.findOne({ _id: data.pretest });
      if (!pretest) throw "Pretest not found";

      // check if pretest already has 20 questions
      const questions = await preTestQuestionV2.find({
        pretestId: data.pretest,
      });
      if (questions.length >= 20)
        throw "Pretest already has 20 questions, delete or edit one before adding a new question";

      // check if question with same pretest and order already exists
      const question = await preTestQuestionV2.findOne({
        pretestId: data.pretest,
        order: data.order,
      });
      if (question) throw "Question with same order already exists";

      const questionEntry = {
        pretestId: data.pretest,
        text: data.text,
        order: data.order,
        tags: data.tags,
        choiceA: { text: data.choiceA },
        choiceB: { text: data.choiceB },
        choiceC: { text: data.choiceC },
        choiceD: { text: data.choiceD },
        answer: data.answer,
      };

      const entry = await preTestQuestionV2.create([questionEntry]);

      if (!entry) throw "Pre test question not created";

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
      if (!data.order) throw "Order is required";

      // check if question with the same order already exists
      const question = await preTestQuestionV2.findOne({
        pretestId: data.pretestId,
        order: data.order,
      });

      if (question && question._id != req.params.id)
        throw "Question with same order already exists";

      const questionEntry = {
        text: data.text,
        tags: data.tags,
        order: data.order,
        choiceA: { text: data.choiceA },
        choiceB: { text: data.choiceB },
        choiceC: { text: data.choiceC },
        choiceD: { text: data.choiceD },
        answer: data.answer,
      };

      const entry = await preTestQuestionV2.findOneAndUpdate(
        { _id: req.params.id },
        questionEntry,
        { new: true, runValidators: true }
      );

      if (!entry) throw "Pre test question not updated";

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  delete: async (req, res) => {
    try {
      if (req.user.role != "ADMIN") throw "You are not an admin";

      const entry = await preTestQuestionV2.deleteOne({ _id: req.params.id });

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
};

module.exports = pretestQuestionController;
