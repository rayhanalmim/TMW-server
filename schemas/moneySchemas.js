const mongoose = require("mongoose");
const moneyInfo = mongoose.model('shopInfo', new mongoose.Schema({}, { strict: false }));
module.exports = moneyInfo;