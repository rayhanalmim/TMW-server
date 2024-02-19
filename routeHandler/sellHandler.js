const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const sellCollection = mongoose.model('sellCollection', new mongoose.Schema({}, { strict: false }));

router.get('/', async(req, res)=>{
    res.send("hello");
})

module.exports = router;