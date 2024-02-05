const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
 

const userCollection = mongoose.model(
  "userCollection",
  new mongoose.Schema({}, { strict: false })
);

router.get("/getUser", async (req, res) => {
  const userId = req.query.userId;
  const user = await userCollection.findById(userId);
  res.send(user);
});

router.get("/", async (req, res) => {
  const users = await userCollection.find();
  res.send(users);
});

router.post("/createUser", async (req, res) => {
  const user = req.body;
  const create = await userCollection.create(user);
  res.send(create);
});

router.post("/updateUser", async (req, res) => {
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
    { _id: mongoose.Types.ObjectId(userId) },
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

router.delete("/deleteUser", async (req, res) => {
  const id = req.query.userId;
  const result = await userCollection.deleteOne({ _id: mongoose.Types.ObjectId(id) });
  res.send(result);
});

module.exports = router;
