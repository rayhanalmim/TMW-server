const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();
const mongoose = require("mongoose");
const cardCollection = require("../schemas/cardSchema");
const Product = require("../schemas/productSchemas");
const dsrRequest = require("../schemas/dsrSchema");

router.post("/", async (req, res) => {
    const { userEmail, productId } = req.query;
    const productQuentity = parseInt(req.query.quantity);

    const product = await Product.findOne({ _id: new ObjectId(productId) });
    if(product.productQuantity < productQuentity){
        return res.status(200).send({ message: `${product.productName} Out of stock` });
    }

    const item = {
        ID : productId,
        product: product,
        productQuentity: productQuentity
    };
 
    const isitemExist = await cardCollection.findOne({
        $and: [
            { user: userEmail },
            { cardItems: { $elemMatch: { ID: productId } } }
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
        return res.send(isCardExist.cardItems)
    }else{
        const response = [
            {
                product: {
                    productName: 'no item found',
                }
            }
        ]
        return res.status(200).send(response)
    }
});



router.get("/cardItemQuantity", async (req, res) => {
    const { email } = req.query;
    const card = await cardCollection.findOne({ user: email }); 

    if(card){
        const total = card.cardItems.length;
        return res.send({total: total});
    }else{
        return res.status(200).send({total: 0});
    }
});

router.post('/delete', async(req, res)=>{
    const {productId, userEmail} = req.query;
    console.log(productId, userEmail);
    const remove = await cardCollection.updateOne(
        { user: userEmail }, // Assuming this is how you identify the user
        { $pull: { cardItems: { ID: productId } } }
      )
      console.log(remove);
    res.send(remove);
})

router.post('/admindelete', async(req, res)=>{
    const {productId, cardId} = req.query;
    const remove = await dsrRequest.updateOne(
        { _id: cardId }, // Assuming this is how you identify the user
        { $pull: { requestedItems: { ID: productId } } }
      )
      console.log(remove);
    res.send(remove);
})

router.delete('/deleteAllCard', async(req, res)=>{
    const {user} = req.query;
    const remove = await cardCollection.deleteOne({ user: user });
    res.send(remove);
})

// =======================================================adminCard

router.put('/addToAdminCard', async(req, res)=>{
    const {productId } = req.query;
    const update = await Product.updateOne(
        { _id: new ObjectId(productId) },
        { $set: { isAddedInCard: true } },
        { upsert: true } // Create a new document if it doesn't exist
    );
      console.log(update);
    res.send(update);
})

module.exports = router;