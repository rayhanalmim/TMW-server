const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const cardCollection = mongoose.model('cardItem', new mongoose.Schema({}, { strict: false }));

router.post("/", async (req, res) => {
    const { item, user } = req.query;
    res.send('comming soon');
});

router.get("/", async (req, res) => {
    const { item, user } = req.query;
    res.send('comming soon');
});

module.exports = router;