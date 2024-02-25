const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const userCollection = require("../schemas/userSchemas");
const { ObjectId } = require("mongodb");
const { default: axios } = require("axios");
require("dotenv").config();

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
//ok

router.get("/:id", async (req, res) => {
  try {
    const result = await userCollection.findOne({
      _id: req.params.id,
    });

    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to get user by email
router.get("/email/:email", async (req, res) => {
  const userEmail = req.params.email;

  try {
    const user = await userCollection.findOne({ email: userEmail });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
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

  const filter = { _id: id };
  const update = { $set: { userType } };
  const result = await userCollection.updateOne(filter, update);

  res.send(result);
});

// Route to get the total number of agents
router.get("/totalAgents", async (req, res) => {
  try {
    const totalAgents = await userCollection.countDocuments({ userType: "isAgent" });
    res.json({ totalAgents });
  } catch (error) {
    console.error("Error counting agents:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to get the total number of admins
router.get("/totalAdmins", async (req, res) => {
  console.log('hit admin')
  try {
    const totalAdmins = await userCollection.countDocuments({ userType: "isAdmin" });
    res.json({ totalAdmins });
  } catch (error) {
    console.error("Error counting admins:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// Route to get the total number of users
router.get("/totalUsers", async (req, res) => {
  try {
    const totalUsers = await userCollection.countDocuments();
    res.json({ totalUsers });
  } catch (error) {
    console.error("Error counting users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const existingUser = await userCollection.findOneAndUpdate(
      { _id: userId },
      { $set: req.body },
      { new: true }
    );

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

router.post('/sendSms', async (req, res) => {
  const { userId } = req.query;
  const date = new Date().toISOString().substring(0, 10);

  const agent = await userCollection.findOne({ _id: new ObjectId(userId) });
  if (agent) {
    const response = await axios.post(`http://bulksmsbd.net/api/smsapi?api_key=${process.env.SMS_API_KEY}&type=text&number=${agent.phoneNo}&senderid=${process.env.SENDER_ID}&message=প্রিয় গ্রাহক, ${agent.displayName}, M/s Humayun Traders এর সাথে থাকার জন্য ধন্যবাদ,আপনার বকেয়া: ${parseInt(agent.totalDueAmmout)}TK বকেয়া টাকা দ্রুত পরিশোধ করুন`);
    console.log(response.data);
  }
  const update = await userCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { lastSmsSendingDate: date } }
  );
  res.send(update)
})

router.post('/paid', async(req, res)=>{
  const id = req.query.userId;
  const amount = req.query.amount;
  console.log(id, amount)
  const user = await userCollection.findOne({ _id: new ObjectId(id) });

  const update = await userCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { totalDueAmmout: user.totalDueAmmout - amount } }
  );
  console.log(update);
  res.send(update);
})

module.exports = router;
