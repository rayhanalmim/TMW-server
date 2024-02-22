const mongoose = require("mongoose");
const companyInfo = mongoose.model('companyInfo', new mongoose.Schema({}, { strict: false }));
module.exports = companyInfo;