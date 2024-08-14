const mongoose = require("mongoose");

const { announcementV2 } = require("../../models/v2/announcement.schema");

const announcementController = {
  init: async (req, res) => {
    try {
      // check if there is an announcement
      let entry = await announcementV2.findOne({});

      if (!entry) {
        // create an announcement
        entry = await announcementV2.create({
          message: "Hello World",
          isShown: false,
        });
      }

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
  view: async (req, res) => {
    try {
      const entry = await announcementV2.find({});

      if (!entry) throw "No announcement found";

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

      if (!data.message) throw "Message is required!";
      if (!data.status) throw "Status is must be either 'SHOW' or 'HIDE'";

      const isShown = data.status == "SHOW" ? true : false;

      const entry = await announcementV2.findOneAndUpdate(
        {},
        {
          message: data.message,
          isShown: isShown,
        },
        { new: true }
      );
      if (!entry) throw "Announcement not found";

      return res.json({ status: true, data: entry });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, error });
    }
  },
};

module.exports = announcementController;
