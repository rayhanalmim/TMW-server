const mongoose = require("mongoose");
const dsrRequest = mongoose.model('dsrRequest', new mongoose.Schema({}, { strict: false }));
module.exports = dsrRequest;