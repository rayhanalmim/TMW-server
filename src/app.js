const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 5000;
const axios = require("axios");
require("dotenv").config();
const productHandler = require("../routeHandler/productHandler");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zq9jmri.mongodb.net/?retryWrites=true&w=majority
`;-


mongoose.connect(uri, { dbName: process.env.DB_NAME });

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

const userCollection = mongoose.model(
  "userCollection",
  new mongoose.Schema({}, { strict: false })
);

// -------------------------delarCollection------------------------------

app.get("/getUser", async (req, res) => {
  const userId = req.query.userId;
  const user = await userCollection.findById(userId);
  res.send(user);
});

app.post("/createUser", async (req, res) => {
  const user = req.body;
  const create = await userCollection.create(user);
  res.send(create);
});

app.post("/updateUser", async (req, res) => {
  const userId = req.query.userId;
  const {
    email,
    photoURL,
    displayName,
    userRole,
    totalBuy,
    due,
    address,
    nidCardNumber,
    phoneNumber,
    reference,
    code,
  } = req.body;

  const update = await userCollection.updateOne(
    { _id: new Object(userId) },
    {
      $set: {
        email: email,
        photoURL: photoURL,
        displayName: displayName,
        userRole: userRole,
        totalBuy: totalBuy,
        due: due,
        address: address,
        nidCardNumber: nidCardNumber,
        phoneNumber: phoneNumber,
        reference: reference,
        code: code,
      },
    }
  );
  res.send(update);
});

app.delete("/deleteUser", async (req, res) => {
  const id = req.query.userId;
  const result = await userCollection.deleteOne({ _id: new Object(id) });
  res.send(result);
});

// --------------------------------------localApi-------------------------------------------

app.get("/", (req, res) => {
  res.send("Humayon traders server is  running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
