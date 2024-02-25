const mongoose = require("mongoose");
const moneyInfo = mongoose.model('moneyInfo', new mongoose.Schema({}, { strict: false }));
module.exports = moneyInfo;