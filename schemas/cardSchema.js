const mongoose = require("mongoose");

const cardCollection = mongoose.model('cardItem', new mongoose.Schema({}, { strict: false }));

module.exports = cardCollection;