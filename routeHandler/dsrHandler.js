const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const dsrRequest = require("../schemas/dsrSchema");
const Product = require("../schemas/productSchemas");
const userCollection = require("../schemas/userSchemas");
const moneyInfo = require("../schemas/moneySchemas");

router.get("/", async (req, res) => {
    const push = await dsrRequest.create({ test: "hello" });
    res.send("hello")
});

router.post("/", async (req, res) => {
    const { userEmail, shopId } = req.query;
    const utcPlus6Date = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
    const currentTimeDhaka = new Date(utcPlus6Date).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Dhaka' });
    const date = new Date().toISOString().substring(0, 10);

    const shop = await Money.findOne({_id: shopId});
    const dsr = await userCollection.findOne({ email: userEmail});
    const requestedData = await cardCollection.findOne({ user: userEmail });
    const obj = {
        dsrInfo: dsr,
        orderDate: date, 
        orderTime: currentTimeDhaka,
        orderStatus: "pending",
        shopInfo: shop,
        requestedItems: requestedData.cardItems,
    }

    const clearCardData = await cardCollection.deleteOne({ user: userEmail });
    const push = await dsrRequest.create(obj);

    res.status(200).send({message: "Request send successfully"});
});

router.get("/order", async (req, res) => {
    const utcPlus6Date = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
    const currentTimeDhaka = new Date(utcPlus6Date).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Dhaka' });
    const date = new Date().toISOString().substring(0, 10);
    const data = {
        date: date,
        time: currentTimeDhaka
    }
    res.send(data)
});

router.get("/searchProduct", async (req, res) => {
    const searchQuery = req.query.searchText;
    const regex = new RegExp(searchQuery, 'i');

    const products = await Product.find({ productQuantity: { $gt: 0 } });

    const filteredResults = products.filter((product) => regex.test(product.productName));

    filteredResults.sort((a, b) => a.productName.localeCompare(b.productName));

    res.send(filteredResults)
});

router.get("/shop", async (req, res) => {
    // const searchQuery = req.query.searchText;
    const { dsrEmail } = req.query;

    const dsr = await userCollection.findOne({ email: dsrEmail});

    const regex = new RegExp(dsr.ifDsrArea, 'i');

    const shops = await moneyInfo.find();

    const filteredResults = shops.filter((product) => regex.test(product.shopArea));

    filteredResults.sort((a, b) => a.shopArea.localeCompare(b.shopArea));

    res.send(filteredResults)
});



module.exports = router;