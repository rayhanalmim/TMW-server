const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const dsrRequest = require("../schemas/dsrSchema");

router.get("/", async (req, res) => {
    const push = await dsrRequest.create({ test: "hello" });
    res.send("hello")
});

router.post("/request", async (req, res) => {
    const push = await dsrRequest.create({ test: "hello" });
    res.send("hello")
});

module.exports = router;