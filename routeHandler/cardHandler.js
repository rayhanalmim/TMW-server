const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const cardCollection = mongoose.model('cardItem', new mongoose.Schema({}, { strict: false }));

router.post("/", async (req, res) => {
    const { userEmail } = req.query;
    const item = req.body;
 
    const isitemExist = await cardCollection.findOne({
        $and: [
            { user: userEmail },
            { cardItems: { $elemMatch: { _id: item._id } } }
        ]
    });
    if (isitemExist) {
        res.status(202).send({ message: "item already listed in database" });
    } else {
        const isCardExist = await cardCollection.findOne({ user: userEmail });
        if (isCardExist) {
            const addItem = await cardCollection.updateOne(
                { user: userEmail },
                {
                    $push: { cardItems: item },
                }
            );
            return res.status(201).send(addItem);
        } else {
            const create = await cardCollection.create({
                user: userEmail,
                cardItems: [item]
            })
            return res.status(200).send(create)
        }
    }
});

router.get("/", async (req, res) => {
    const { user } = req.query;
    const isCardExist = await cardCollection.findOne({ user: user });
    if(isCardExist){
        return res.send(isCardExist)
    }else{
        return res.status(201).send({message: 'no item found'})
    }
});

module.exports = router;