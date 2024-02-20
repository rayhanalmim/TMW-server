const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const userCollection = require("../schemas/userSchemas");
const { ObjectId } = require("mongodb");
const companyInfo = require("../schemas/companyCollection");

router.get('/', async(req, res)=>{
    const {sellerEmail , buyerId , discount, due, totalPrice} = req.query;
    let totalSellPrice = totalPrice;
    const month = new Date().toISOString().substring(0, 7);
    const year = new Date().toISOString().substring(0, 4);
    const items = req.body;

    const agent = await userCollection.findOne({_id: new ObjectId(buyerId), userType: "isAgent"});
    if(!agent){
        res.status(201).send({message: "please select a valid agent"})
    }
    if(discount){
        totalSellPrice = totalSellPrice - discount;
    }
    if(due){
        totalSellPrice = totalSellPrice - due;
    }


    // ---------Todo
    // 1. productStock out
    // 2. return error if product out of stock
    // 2. calculate total price and minus if discount and due ammount exist
    // 2. add price in total sell, monthly sell and yearly sell in company info
    // 3. add purches product in agent product collection
    // 4. add due ammount in agent collection if exists
    // 5. push every purches product in sell collection with date

    // items.forEach((item) => {
    //     // comming soon
    // });
    res.send(agent);
})

module.exports = router;