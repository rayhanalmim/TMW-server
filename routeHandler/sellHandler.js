const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const userCollection = require("../schemas/userSchemas");
const { ObjectId } = require("mongodb");
const companyInfo = require("../schemas/companyCollection");
const Product = require("../schemas/productSchemas");

router.post('/', async(req, res)=>{
    const {sellerEmail , buyerId , discount, due, totalPrice} = req.query;
    const items = req.body;
    let totalSellPrice = totalPrice;
    const month = new Date().toISOString().substring(0, 7);
    const year = new Date().toISOString().substring(0, 4);

    // console.log(sellerEmail , buyerId , discount, due, totalPrice, items)

    if(!buyerId){
        return res.status(201).send({message: "please select a valid agent"})
    }
    
    if(discount){
        totalSellPrice = totalSellPrice - discount;
    }
    if(due){
        totalSellPrice = totalSellPrice - due;
    }

    //  items.forEach(async(item) => {
    //     const {_id, quantity, productName, ownerEmail, productPrice, imageURL, ProductType} = item; //Buy Product

    //     const storedProduct = await Product.findOne({_id: new ObjectId(_id)});
    //     console.log(storedProduct);
    //     if(storedProduct.productQuantity < quantity){
    //         console.log("gittttttttttttttttttttttttttttttttttttttttttttttt");
    //         return res.status(202).send({message: `${productName} is out of stock`})
    //     }
    // });

    // --------------------checkProductStock:
    for (const item of items) {
        const {_id, quantity, productName} = item;

        const storedProduct = await Product.findOne({_id: new ObjectId(_id)});
        if (!storedProduct || storedProduct.productQuantity < quantity) {
            return res.status(202).send({message: `${productName} is out of stock`});
        }
    }

    // ---------------stockOutAndOtherFunctionality:
    for (const item of items) {
        const {_id, quantity, productName, ownerEmail, productPrice, imageURL, ProductType} = item; 

        const storedProduct = await Product.findOne({_id: new ObjectId(_id)});

        const stockOutProduct = await Product.updateOne(
            { _id: new Object(_id) },
            { $set: { productQuantity: storedProduct.productQuantity - quantity } },
          );
    }

    res.send('success');
})

module.exports = router;

    // ---------Todo
    // 1. productStock out
    // 2. return error if product out of stock
    // 2. calculate total price and minus if discount and due ammount exist
    // 2. add price in total sell, monthly sell and yearly sell in company info
    // 3. add purches product in agent product collection
    // 4. add due ammount in agent collection if exists
    // 5. push every purches product in sell collection with date