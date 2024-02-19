const mongoose = require("mongoose");

const sellCollection = mongoose.model('sellCollection', new mongoose.Schema({}, { strict: false }));

module.exports = sellCollection;