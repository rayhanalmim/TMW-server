const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 5000;
const axios = require("axios");
require("dotenv").config();
const productHandler = require("../routeHandler/productHandler");
const userHandler = require("../routeHandler/userHandler");
const costHandler = require("../routeHandler/costHandler.js");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zq9jmri.mongodb.net/?retryWrites=true&w=majority
`;
-mongoose.connect(uri, { dbName: process.env.DB_NAME });

const db = mongoose.connection;

db.on("error", (err) => {
  console.error(`Error connecting to MongoDB: ${err}`);
});

db.once("open", () => {
  console.log("Connected to MongoDB");
});
//start product function

app.use("/product", productHandler);

//start user function

app.use("/user", userHandler);
app.use("/cost", costHandler);
 

// --------------------------------------localApi-------------------------------------------

app.get("/", (req, res) => {
  res.send("Humayon traders server is  running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
