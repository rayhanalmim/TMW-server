const mongoose = require("mongoose");

const costSchema = new mongoose.Schema({
  cost: {
    type: Number,
    required: true,
    min: 0,  
  },
  costDate: {
    type: Date,
    default: function() {
      // Set default date to Bangladeshi local time
      return moment().tz('Asia/Dhaka').toDate();
    },
  },
  costIssues: {
    type: String,
    required: true,
  },
  costType: {
    type: String,
    enum: ["Daily", "Month"], 
    required: true,
  },
});

// Add any additional settings or methods if needed
module.exports = costSchema;


