const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const userCollection = require("../schemas/userSchemas");
const { ObjectId } = require("mongodb");


router.get('/', async(req, res)=>{
    const {sellerEmail , buyerId, discound, due} = req.query;
    const items = req.body;

    const isAgentExist = await userCollection.findOne({_id: new ObjectId(buyerId), userType: "isAgent"});
    if(!isAgentExist){
        res.status(201).send({message: "please select a valid agent"})
    }

    // items.forEach((item) => {
    //     // comming soon
    // });
    res.send(isAgentExist);
})

module.exports = router;