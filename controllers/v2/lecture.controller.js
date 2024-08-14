const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { conceptV2 } = require("../../models/v2/concept.schema");
const { lectureV2 } = require("../../models/v2/lecture.schema");

const lectureController = {
  all: async (req, res) => {
    try {
      let filter = {};

      if (req.query.concept) {
        filter.conceptId = req.query.concept;
      }

      if (req.query.setType) {
        filter.setType = req.query.setType;
      }

      const entry = await lectureV2.find(filter);

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

      if (req.query.concept) {
        query.conceptId = req.query.concept;
      }

      if (req.query.search) {
        let regex = new RegExp(req.query.search, "i");
        query = {
          ...query,
          $and: [
            {
              $or: [{ name: regex }],
            },
          ],
        };
      }

      const entry = await lectureV2.paginate(query, options);

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  view: async (req, res) => {
    try {
      const entry = await lectureV2.findOne({ _id: req.params.id });

      if (!entry) throw "Lecture not found";

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

      if (!data.material) throw "Material is required";
      if (!data.setType) throw "Set type is required";
      if (!data.concept) throw "Concept is required";

      // check if concept exists
      const concept = await conceptV2.findOne({ _id: data.concept });
      if (!concept) throw "Concept not found";

      // check if lecture exists with the same concept and set type
      const lecture = await lectureV2.findOne({
        conceptId: data.concept,
        setType: data.setType,
      });

      if (lecture) throw "Concept lecture with that set type already exists";

      const entry = await lectureV2.create([
        {
          material: data.material,
          setType: data.setType,
          conceptId: data.concept,
        },
      ]);

      if (!entry) throw "Lecture not created";

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

      if (!data.material) throw "Material is required";

      const entry = await lectureV2.findOneAndUpdate(
        { _id: req.params.id },
        {
          material: data.material,
        },
        { new: true }
      );

      if (!entry) throw "Lesson not found";

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  delete: async (req, res) => {
    try {
      if (req.user.role != "ADMIN") throw "You are not an admin";

      const entry = await lectureV2.deleteOne({ _id: req.params.id });

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
};

module.exports = lectureController;
