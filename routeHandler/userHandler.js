const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const userSchema = require("../schemas/userSchemas");

// const userCollection = new mongoose.model("userCollection", userSchema);

const userCollection = mongoose.model(
  "userCollection",
  new mongoose.Schema({}, { strict: false })
);
//ok
router.get("/admin/:email", async (req, res) => {
  const email = req.params.email;
  const user = await userCollection.findOne({ email: email });
  let admin = false;
  if (user) {
    admin = user?.userType === "isAdmin";
  }
  res.send({ admin });
});
//ok
router.get("/agent/:email", async (req, res) => {
  const email = req.params.email;
  const user = await userCollection.findOne({ email: email });
  let agent = false;
  if (user) {
    agent = user?.userType === "isAgent";
  }
  res.send({ agent });
});

router.get("/:email", async (req, res) => {
  const email = req.params.email;
  const user = await userCollection.findOne({ email: email });
  res.send(user);
});

//ok
router.get("/", async (req, res) => {
  const users = await userCollection.find();
  res.send(users);
});
//ok
router.post("/", async (req, res) => {
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
//ok
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const result = await userCollection.deleteOne({ _id: id });
  res.send(result);
});

//ok
router.patch("/:id", async (req, res) => {
  const id = req.params.id;
  const userType = req.body.role;
  console.log(id, userType);
  const filter = { _id: id };
  const update = { $set: { userType } };
  const result = await userCollection.updateOne(filter, update);

  res.send(result);
});

module.exports = router;
