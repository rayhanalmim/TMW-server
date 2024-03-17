const mongoose = require("mongoose");
const billCollection = mongoose.model('billcollections', new mongoose.Schema({}, { strict: false }));
module.exports = billCollection;