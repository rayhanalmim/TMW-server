const mongoose = require("mongoose");

const Product = mongoose.model(
  "Product",
  new mongoose.Schema({}, { strict: false })
);

module.exports = Product;
