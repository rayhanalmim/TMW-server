const mongoose = require("mongoose");
const counter = mongoose.model('counter', new mongoose.Schema({}, { strict: false }));
module.exports = counter;