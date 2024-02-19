const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");


router.get('/', async(req, res)=>{
    const {sellerEmail , buyerId, discound, due} = req.query;
    const items = req.body;


    items.forEach((item) => {
        // comming soon
    });
})

module.exports = router;