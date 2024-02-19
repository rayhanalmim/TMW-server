const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  uid: {
    type: String,
  },
  email: {
    type: String,
  },
  address: {
    type: String,
  },
  phoneNo: {
    type: String,
  },
  nid: {
    type: Number,
  },
  userType: {
    type: String,
    default: "user",
  },
  date: {
    type: Date,
    default: () => {
      const date = new Date();
      const timezoneOffset = date.getTimezoneOffset();

      // Adjusting for Bangladesh timezone (UTC+6)
      date.setMinutes(date.getMinutes() + 360);

      return date;
    },
  },
});

const userCollection = mongoose.model(
  "userCollection",
  new mongoose.Schema({}, { strict: false })
);

module.exports = userCollection;
