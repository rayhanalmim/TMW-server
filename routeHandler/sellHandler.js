const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const userCollection = require("../schemas/userSchemas");
const { ObjectId } = require("mongodb");
const companyInfo = require("../schemas/companyCollection");
const Product = require("../schemas/productSchemas");
const sellCollection = require("../schemas/sellCollection");
const { route } = require("./cardHandler");
require("dotenv").config();
const { default: axios } = require("axios");

router.post("/", async (req, res) => {
    const { sellerEmail, buyerId, discount, due, totalPrice } = req.query;
    let beforeDiscount = totalPrice;
    const items = req.body;
    let totalSellPrice = totalPrice;
    const month = new Date().toISOString().substring(0, 7);
    const date = new Date().toISOString().substring(0, 10);
    const year = new Date().toISOString().substring(0, 4);
    let purchesProductCollection = [];

    // console.log(sellerEmail , buyerId , discount, due, totalPrice, items)

    if (!buyerId) {
        return res.status(201).send({ message: "please select a valid agent" });
    }

    if (discount) {
        totalSellPrice = totalSellPrice - discount;
        beforeDiscount = beforeDiscount - discount;
    }
    if (due) {
        totalSellPrice = totalSellPrice - due;
    }

    // --------------------checkProductStock:
    for (const item of items) {
        const { _id, quantity, productName } = item;

        const storedProduct = await Product.findOne({ _id: new ObjectId(_id) });
        if (!storedProduct || storedProduct.productQuantity < quantity) {
            return res
                .status(202)
                .send({ message: `${productName} is out of stock` });
        }
    }

    // ---------------stockOutAndOtherFunctionality:
    for (const item of items) {
        const {
            _id,
            quantity,
            productName,
            ownerEmail,
            productPrice,
            imageURL,
            ProductType,
        } = item;

        const obj = {
            productName: productName,
            quantity: quantity,
            productImage: imageURL,
            unitPrice: productPrice,
        };

        purchesProductCollection.push(obj);

        const storedProduct = await Product.findOne({ _id: new ObjectId(_id) });

        // ---------------------stockOut
        const stockOutProduct = await Product.updateOne(
            { _id: new Object(_id) },
            { $set: { productQuantity: storedProduct.productQuantity - quantity } }
        );

        // --------------pushPurchesProductInAgentCollection
        const update = await userCollection.updateOne(
            { _id: new ObjectId(buyerId) },
            {
                $push: { purchesProductCollection: item },
            }
        );
    }

    // -------------------addMonthlyYearlyAndTotal
    const currentMonthCollection = await companyInfo.findOne({
        companyInfo: "adminCollection",
        monthlySellAmount: { $elemMatch: { month: month } },
    });

    const currentYearCollection = await companyInfo.findOne({
        companyInfo: "adminCollection",
        yearlySellAmount: { $elemMatch: { year: year } },
    });

    const updateTotalPrice = await companyInfo.updateOne(
        { companyInfo: "adminCollection" },
        {
            $set: {
                totalSellAmmount:
                    currentMonthCollection.totalSellAmmount + parseInt(totalPrice),
            },
        }
    );

    // ----------------------updateMonthlyPrice
    if (currentMonthCollection) {
        const updateQuery = {
            companyInfo: "adminCollection",
            monthlySellAmount: {
                $elemMatch: {
                    month: month,
                },
            },
        };
        totalSellPrice
        const updateResult = await companyInfo.updateOne(updateQuery, {
            $set: {
                "monthlySellAmount.$.totalAmmount":
                    parseInt(currentMonthCollection.monthlySellAmount[0].totalAmmount) +
                    parseInt(totalPrice),
            },
        });
    } else {
        const createObj = {
            month: month,
            totalAmmount: parseInt(totalPrice),
        };
        const update = await companyInfo.updateOne(
            { companyInfo: "adminCollection" },
            {
                $push: { monthlySellAmount: createObj },
            }
        );
    }

    // -----------------------updateyearlyPrice
    if (currentYearCollection) {
        const updateQuery = {
            companyInfo: "adminCollection",
            yearlySellAmount: {
                $elemMatch: {
                    year: year,
                },
            },
        };
        const updateResult = await companyInfo.updateOne(updateQuery, {
            $set: {
                "yearlySellAmount.$.totalAmount":
                    parseInt(currentYearCollection.yearlySellAmount[0].totalAmount) +
                    parseInt(totalPrice),
            },
        });
    } else {
        const createObj = {
            year: year,
            totalAmount: parseInt(totalPrice),
        };
        const update = await companyInfo.updateOne(
            { companyInfo: "adminCollection" },
            {
                $push: { yearlySellAmount: createObj },
            }
        );
    }

    // ----------------------addDueAmmout
    const agent = await userCollection.findOne({ _id: new ObjectId(buyerId) });

    if (due) {
        const update = await userCollection.updateOne(
            { _id: new ObjectId(buyerId) },
            { $set: { totalDueAmmout: agent.totalDueAmmout + parseInt(due) } }
        );
    }
    if (totalSellPrice) {
        const update = await userCollection.updateOne(
            { _id: new ObjectId(buyerId) },
            { $set: { totalSellPrice: totalSellPrice } }
        );
    }

    // -------------------addTotalPurchesInAgentCollection
    const update = await userCollection.updateOne(
        { _id: new ObjectId(buyerId) },
        {
            $set: {
                totalPurchesAmmount:
                    agent.totalPurchesAmmount + parseInt(beforeDiscount),
            },
        }
    );

    // ------------------------createSellCollection
    const sellObj = {
        sellerEmail: sellerEmail,
        agentEmail: agent.email,
        date: date,
        agetName: agent.displayName,
        agentId: agent._id,
        totalCost: parseInt(beforeDiscount),
        paid: parseInt(totalSellPrice),
        dueAmmount: parseInt(due),
        purchesProducts: purchesProductCollection,
    };
    const createSellCollection = await sellCollection.create(sellObj);

    //-----------------------sendSms
    
    if(due > 0){
        const response = await axios.post(`http://bulksmsbd.net/api/smsapi?api_key=${process.env.SMS_API_KEY}&type=text&number=${agent.phoneNo}&senderid=${process.env.SENDER_ID}&message=Hello ${agent.displayName}, Thank you for buying from Humanitarian Traders. Your total purchase is ${parseInt(beforeDiscount)}. You've paid ${parseInt(totalSellPrice)}, Due amount: ${parseInt(due)}.`);
        console.log(response.data);
    }else{
        const response = await axios.post(`http://bulksmsbd.net/api/smsapi?api_key=${process.env.SMS_API_KEY}&type=text&number=${agent.phoneNo}&senderid=${process.env.SENDER_ID}&message=Hello ${agent.displayName}, Thank you for buying from Humanitarian Traders. Your total purchase is ${parseInt(beforeDiscount)}.`);
        console.log(response.data);
    }

    res.send(sellObj);
});

router.get("/", async (req, res) => {

    const sellProduct = await sellCollection.find();
    sellProduct.reverse();
    res.send(sellProduct);
});

router.get('/memo', async(req, res)=>{
    const {memoId} = req.query;
    const sellProduct = await sellCollection.findById(memoId);
    res.send(sellProduct);
})

module.exports = router;
