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
const moneyInfo = require("../schemas/moneySchemas");
const dsrRequest = require("../schemas/dsrSchema");
const billCollection = require("../schemas/billSchema");

router.post("/", async (req, res) => {
    const { discount, due, totalPrice } = req.query;
    let beforeDiscount = totalPrice;
    const items = req.body;
    let totalSellPrice = totalPrice;
    const month = new Date().toISOString().substring(0, 7);
    const date = new Date().toISOString().substring(0, 10);
    const year = new Date().toISOString().substring(0, 4);
    let purchesProductCollection = [];



    if (discount) {
        totalSellPrice = totalSellPrice - discount;
        beforeDiscount = beforeDiscount - discount;
    }
    if (due) {
        totalSellPrice = totalSellPrice - due;
    }

    // --------------------checkProductStock:
    for (const item of items.requestedItems) {
        const { ID, quantity } = item;
        const { productName } = item.product;

        const storedProduct = await Product.findOne({ _id: new ObjectId(ID) });
        if (!storedProduct || storedProduct.productQuantity < quantity) {
            return res
                .status(202)
                .send({ message: `${productName} is out of stock` });
        }
    }

    // ---------------stockOutAndOtherFunctionality:
    for (const item of items.requestedItems) {
        const {
            quantity,
        } = item;

        const {
            _id,
            productName,
            productPrice,
            imageURL,
            productType,
        } = item.product;

        const obj = {
            productName: productName,
            quantity: quantity,
            imageURL: imageURL,
            unitPrice: productPrice,
            purchaseDate: date,
            productType: productType,
        };

        const sellCollectionObj = {
            date: date,
            to: items.shopInfo,
            via: items.dsrInfo,
            quantity: quantity,
            unitPrice: productPrice,
        }

        purchesProductCollection.push(obj);

        // const storedProduct = await Product.findOne({ _id: new ObjectId(_id) });

        // // ---------------------stockOut
        // const stockOutProduct = await Product.updateOne(
        //     { _id: new Object(_id) },
        //     { $set: { productQuantity: storedProduct.productQuantity - quantity } }
        // );

        // console.log('from quentity: ', stockOutProduct);

        // --------------pushPurchesProductInAgentCollection
        const update = await moneyInfo.updateOne(
            { _id: new ObjectId(items.shopInfo._id) },
            {
                $push: { purchesProductCollection: obj },
            }
        );
        const updateProductCollection = await Product.updateOne(
            { _id: _id },
            { $push: { sellCollections: sellCollectionObj } },
            { upsert: true } // Create a new document if it doesn't exist
        );
            console.log(updateProductCollection);

        
    }


    // -------------------addMonthlyYearlyAndTotal
    const currentDayCollection = await companyInfo.findOne({
        companyInfo: "adminCollection",
        dailySellAmmount: { $elemMatch: { day: date } },
    });
    const filterForAddTotal = await companyInfo.findOne({ companyInfo: "adminCollection" });

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
                totalSellAmount:
                    filterForAddTotal.totalSellAmount + parseInt(totalPrice),
            },
        }
    );

    // ----------------------updateDailySell
    if (currentDayCollection) {
        const updateQuery = {
            companyInfo: "adminCollection",
            dailySellAmmount: {
                $elemMatch: {
                    day: date,
                },
            },
        };
        const updateResult = await companyInfo.updateOne(updateQuery, {
            $set: {
                "dailySellAmmount.$.totalAmmount":
                    parseInt(currentDayCollection.dailySellAmmount[0].totalAmmount) +
                    parseInt(totalPrice),
            },
        });
    } else {
        const createObj = {
            day: date,
            totalAmmount: parseInt(totalPrice),
        };
        const update = await companyInfo.updateOne(
            { companyInfo: "adminCollection" },
            {
                $push: { dailySellAmmount: createObj },
            }
        );
    }

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
    const shop = await moneyInfo.findOne({ _id: new ObjectId(items.shopInfo._id) });

    if (due) {
        const update = await moneyInfo.updateOne(
            { _id: new ObjectId(items.shopInfo._id) },
            { $set: { totalDue: shop.totalDue + parseInt(due) } }
        );
    }
    if (totalSellPrice) {
        const update = await moneyInfo.updateOne(
            { _id: new ObjectId(items.shopInfo._id) },
            { $set: { totalPay: shop.totalPay + parseInt(totalSellPrice) } }
        );
    } else {
        const update = await moneyInfo.updateOne(
            { _id: new ObjectId(items.shopInfo._id) },
            { $set: { totalPay: shop.totalPay + parseInt(totalPrice) } }
        );
    }

    // -------------------addTotalPurchesInAgentCollection
    const update = await moneyInfo.updateOne(
        { _id: new ObjectId(items.shopInfo._id) },
        {
            $set: {
                totalBuyAmout:
                    shop.totalBuyAmout + parseInt(beforeDiscount),
            },
        }
    );


    const finalData = {
        ...items, discount, due, totalPrice,
    }

    const storeBill = await billCollection.create(finalData);
    

    const finalUpdate = await dsrRequest.updateOne(
        { _id: new ObjectId(items._id) },
        {
            $set: {
                orderStatus: "Completed",
                // requestedItems: []
            },
        }
    );

    // if (due > 0) {
    //     const response = await axios.post(`http://bulksmsbd.net/api/smsapi?api_key=${process.env.SMS_API_KEY}&type=text&number=${agent.phoneNo}&senderid=${process.env.SENDER_ID}&message=প্রিয় গ্রাহক, ${agent.displayName}  আপনাকে M/s Humayun Traders থেকে ধন্যবাদ। আপনার মোট ক্রয় : ${parseInt(beforeDiscount)}TK, পরিশোধ: ${parseInt(totalSellPrice)}TK, বকেয়া : ${parseInt(due)}TK ।`);
    //     console.log(response.data);
    // } else {
    //     const response = await axios.post(`http://bulksmsbd.net/api/smsapi?api_key=${process.env.SMS_API_KEY}&type=text&number=${agent.phoneNo}&senderid=${process.env.SENDER_ID}&message=প্রিয় গ্রাহক, ${agent.displayName}। আপনাকে M/s Humayun Traders থেকে ধন্যবাদ। আপনার মোট ক্রয় হলো ${parseInt(beforeDiscount)}tk।`);
    //     console.log(response.data);
    // }


    res.send("finalUpdate");
});

router.get("/", async (req, res) => {
    const sellProduct = await sellCollection.find();
    sellProduct.reverse();
    res.send(sellProduct);
});

router.get('/memo', async (req, res) => {
    const { memoId } = req.query;
    const sellProduct = await sellCollection.findById(memoId);
    res.send(sellProduct);
})

router.get('/allSell', async (req, res) => {
    const sellData = await companyInfo.find();
    res.send(sellData[0]);
})


router.get('/login', async (req, res) => {
    const userEmail = req.query.userEmail;
    const userPassword = req.query.userPassword;
    console.log(userEmail, userPassword);
    const user = await userCollection.findOne({ email: userEmail, password: userPassword, userType: "DSR" });
    console.log(user);
    if (user) {
        return res.status(200).send(user);
    } else {
        return res.status(404).send({ messege: "invite Credential" })
    }
})

module.exports = router;
