const mongoose = require("mongoose");

const costSchema = new mongoose.Schema({
  cost: {
    type: Number,
    required: true,
    min: 0,  
  },
  costDate: {
    type: Date,
    required: true,
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


