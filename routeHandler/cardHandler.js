const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();
const mongoose = require("mongoose");
const cardCollection = require("../schemas/cardSchema");
const Product = require("../schemas/productSchemas");

router.post("/", async (req, res) => {
    const { userEmail, productId } = req.query;
    const productQuentity = parseInt(req.query.quantity);

    const product = await Product.findOne({ _id: new ObjectId(productId) });
    if(product.productQuantity < productQuentity){
        return res.status(200).send({ message: `${product.productName} Out of stock` });
    }

    const item = {
        productId : productId,
        productQuentity: productQuentity
    };
 
    const isitemExist = await cardCollection.findOne({
        $and: [
            { user: userEmail },
            { cardItems: { $elemMatch: { productId: productId } } }
        ]
    });

    if (isitemExist) {
        return res.status(200).send({ message: "item already listed in database" });
    } else {
        const isCardExist = await cardCollection.findOne({ user: userEmail });
        if (isCardExist) {
            const addItem = await cardCollection.updateOne(
                { user: userEmail },
                {
                    $push: { cardItems: item },
                }
            );
            return res.status(200).send({message: "Item added successfully"});
        } else {
            const create = await cardCollection.create({
                user: userEmail,
                cardItems: [item]
            })
            return res.status(200).send({message: "Item added successfully"});
        }
    } 
});

router.get("/", async (req, res) => {
    const { email } = req.query;
    const isCardExist = await cardCollection.findOne({ user: email });
    if(isCardExist){
        return res.send(isCardExist)
    }else{
        return res.status(201).send({message: 'no item found'})
    }
});

router.delete('/delete', async(req, res)=>{
    const {id, user} = req.query;
    console.log(id, user);
    const remove = await cardCollection.updateOne(
        { user: user }, // Assuming this is how you identify the user
        { $pull: { cardItems: { _id: id } } }
      )
      console.log(remove);
    res.send(remove);
})

router.delete('/deleteAllCard', async(req, res)=>{
    const {user} = req.query;
    const remove = await cardCollection.deleteOne({ user: user });
    res.send(remove);
})

module.exports = router;