const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Cost = require("../schemas/costSchemas.js");
const billCollection = require("../schemas/billSchema.js");
const moneyInfo = require("../schemas/moneySchemas.js");
const { ObjectId } = require("mongodb");


router.get("/", async (req, res) => {
  try {
    const bills = await billCollection.find();
    res.send(bills);
  } catch (error) {
    console.error("Error fetching costs:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

router.get("/shop", async (req, res) => {
  const shopID = req.query.shopId;
  console.log(shopID);
  const bills = await billCollection.find({ 'shopInfo._id': shopID });
  console.log(bills);
  res.send(bills);
});

router.post("/paid", async (req, res) => {
  const { amout, id } = req.query;
  const shop = await moneyInfo.findOne({ _id: new ObjectId(id) });

  const update = await moneyInfo.updateOne(
    { _id: new ObjectId(id) },
    { $set: { totalDue: shop.totalDue - parseInt(amout), totalPay: shop.totalPay + parseInt(amout) } }
  );
  res.send(update);
});


router.get("/findOne", async (req, res) => {
  try {
    const { billId } = req.query;
    const bills = await billCollection.findOne({ _id: billId });
    res.send(bills);
  } catch (error) {
    console.error("Error fetching costs:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const costData = req.body;
    const newCost = await Cost.create(costData);
    res.status(201).send(newCost);
  } catch (error) {
    console.error("Error creating cost:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});


module.exports = router;
