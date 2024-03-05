const mongoose = require("mongoose");

const userCollection = mongoose.model(
  "userCollection",
  new mongoose.Schema({}, { strict: false })
);

module.exports = userCollection;
