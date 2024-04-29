const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Cost = require("../schemas/costSchemas.js");
const billCollection = require("../schemas/billSchema.js");
const cardCollection = require("../schemas/cardSchema.js");
const companyInfo = require("../schemas/companyCollection.js");
const counter = require("../schemas/count.js");
const dsrRequest = require("../schemas/dsrSchema.js");
const Product = require("../schemas/productSchemas.js");
const sellCollection = require("../schemas/sellCollection.js");
const userCollection = require("../schemas/userSchemas.js");

router.get("/getCost", async (req, res) => {
  try {
    const userId = req.query.userId;
    const cost = await Cost.findById(userId);
    res.send(cost);
  } catch (error) {
    console.error("Error fetching cost:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

router.get("/", async (req, res) => {
  const data = await userCollection.find();
  res.send(data);
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

router.delete("/:id", async (req, res) => {
  try {
    const costId = req.params.id;
    const deletedProduct = await Cost.deleteOne({ _id: costId });

    res.status(200).json({
      message: "Cost deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

module.exports = router;
