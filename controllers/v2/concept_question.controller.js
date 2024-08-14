const mongoose = require("mongoose");
const queryParser = require("../../helpers/query-parser");

const { conceptV2 } = require("../../models/v2/concept.schema");
const {
  conceptQuestionV2,
} = require("../../models/v2/concept_question.schema");

const conceptQuestionController = {
  all: async (req, res) => {
    try {
      let filter = {};
      let excludedQuestions = [];

      if (req.query.concept) {
        filter.conceptId = req.query.concept;
      }

      if (req.query.difficulty) {
        filter.difficulty = req.query.difficulty;
      }

      if (req.query.exclude) {
        excludedQuestions = queryParser.parseToArray(req.query.exclude);
        filter._id = { $nin: excludedQuestions };
      }

      // check for same concept and difficulty
      let entry = await conceptQuestionV2.find(filter);

      // check if there is any question if not then get aleast the same concept
      if (entry.length === 0) {
        entry = await conceptQuestionV2.find({ conceptId: req.query.concept });
      }

      // filter out the questions that are already in the list
      let filteredEntry = entry.filter((question) => {
        return !excludedQuestions.includes(question._id.toString());
      });

      // if there are no questions left then return the same list
      if (filteredEntry.length === 0) {
        filteredEntry = entry;
      }

      return res.json({ status: true, data: filteredEntry });
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

      if (req.query.concept) {
        query.conceptId = req.query.concept;
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

      const entry = await conceptQuestionV2.paginate(query, options);

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  view: async (req, res) => {
    try {
      const entry = await conceptQuestionV2.findOne({ _id: req.params.id });

      if (!entry) throw "Concept question not found";

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

      if (!data.concept) throw "Concept is required";
      if (!data.text) throw "Question text is required";
      if (!data.explaination) throw "Explaination is required";
      if (!data.difficulty) throw "Difficulty is required";
      if (!data.choiceA) throw "Choice A is required";
      if (!data.choiceB) throw "Choice B is required";
      if (!data.choiceC) throw "Choice C is required";
      if (!data.choiceD) throw "Choice D is required";
      if (!data.answer) throw "Answer is required";

      // check if concept exists
      const concept = await conceptV2.findOne({ _id: data.concept });
      if (!concept) throw "Concept not found";

      const questionEntry = {
        conceptId: data.concept,
        text: data.text,
        explaination: data.explaination,
        difficulty: data.difficulty,
        choiceA: { text: data.choiceA },
        choiceB: { text: data.choiceB },
        choiceC: { text: data.choiceC },
        choiceD: { text: data.choiceD },
        answer: data.answer,
      };

      const entry = await conceptQuestionV2.create([questionEntry]);

      if (!entry) throw "Concept question not created";

      return res.json({ status: true, data: entry[0] });
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
      if (!data.explaination) throw "Explaination is required";
      if (!data.difficulty) throw "Difficulty is required";
      if (!data.choiceA) throw "Choice A is required";
      if (!data.choiceB) throw "Choice B is required";
      if (!data.choiceC) throw "Choice C is required";
      if (!data.choiceD) throw "Choice D is required";
      if (!data.answer) throw "Answer is required";

      const questionEntry = {
        text: data.text,
        explaination: data.explaination,
        difficulty: data.difficulty,
        choiceA: { text: data.choiceA },
        choiceB: { text: data.choiceB },
        choiceC: { text: data.choiceC },
        choiceD: { text: data.choiceD },
        answer: data.answer,
      };

      const entry = await conceptQuestionV2.findOneAndUpdate(
        { _id: req.params.id },
        questionEntry,
        { new: true, runValidators: true }
      );

      if (!entry) throw "Concept question not updated";

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  delete: async (req, res) => {
    try {
      if (req.user.role != "ADMIN") throw "You are not an admin";

      const entry = await conceptQuestionV2.deleteOne({ _id: req.params.id });

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
};

module.exports = conceptQuestionController;
