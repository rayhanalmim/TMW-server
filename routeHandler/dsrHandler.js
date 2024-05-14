const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const dsrRequest = require("../schemas/dsrSchema");
const Product = require("../schemas/productSchemas");
const userCollection = require("../schemas/userSchemas");
const moneyInfo = require("../schemas/moneySchemas");
const cardCollection = require("../schemas/cardSchema");
const { ObjectId } = require("mongodb");
const counter = require("../schemas/count");

router.get("/", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default limit to 5 items per page
  
    try {
        // Get the total count of items
        const totalCount = await dsrRequest.countDocuments({
            $or: [
                { orderStatus: "pending" },
                { orderStatus: "acceptdue" }
            ],
            orderStatus: { $ne: "completed" } // Exclude documents with orderStatus: "completed"
        });
  
        // Calculate the starting index based on the total count and requested page
        const startIndex = Math.max(0, totalCount - page * limit);
        const endIndex = startIndex + limit;
  
        // Fetch the data with the calculated indexes
        let requestedData = await dsrRequest
            .find({
                $or: [
                    { orderStatus: "pending" },
                    { orderStatus: "acceptdue" }
                ],
                orderStatus: { $ne: "completed" } // Exclude documents with orderStatus: "completed"
            })
            .skip(startIndex)
            .limit(limit);
  
        // Reverse the order of the fetched data
        requestedData = requestedData.reverse();
  
        res.json(requestedData);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ message: "Server error" });
    }
});

  
  
  


router.get("/OrderNo", async (req, res) => {
    const requestedData = await dsrRequest.find(
        { orderStatus: "Completed" }
    );
    res.send(requestedData)
});

router.get("/dsr", async (req, res) => {
    const dsr = await userCollection.find(
        { userType: "DSR" }
    );
    res.send(dsr)
});

router.get("/orderStatus", async (req, res) => {
    const email = req.query.email;
    let arrayOfObj = [];
    const requestedData = await dsrRequest.find({ "dsrInfo.email": email }, { orderNo: 1, orderDate: 1, orderTime: 1, orderStatus: 1, _id: 0, "shopInfo.shopName": 1, requestedItems: 1, });

    if (requestedData.length) {
        for (data of requestedData) {
            let totalOrderedItems = 0;
            const { orderNo, orderDate, orderTime, orderStatus, shopInfo, requestedItems } = data;

            for (const item of requestedItems) {
                totalOrderedItems = parseInt(totalOrderedItems) + parseInt(item.productQuentity);
            }

            const obj = {
                orderNo: orderNo, orderDate: orderDate, orderTime: orderTime, orderStatus: orderStatus, shopName: shopInfo?.shopName, totalOrderedItems,
            }
            console.log(obj);
            arrayOfObj.push(obj);
        }
        return res.send(arrayOfObj.reverse())
    } else {
        return res.status(200).send({ message: 'no order found' })
    }
});

router.get("/findOne", async (req, res) => {
    const reqId = req.query.reqId;
    const requestedData = await dsrRequest.findById(reqId);
    res.send(requestedData)
});


router.post("/reject", async (req, res) => {
    const reqId = req.query.reqId;

    const update = await dsrRequest.updateOne(
        { _id: new ObjectId(reqId) },
        {
            $set: {
                orderStatus: "reject",
                requestedItems: []
            },
        }
    );
    const countCollection = await counter.find();
    let number = countCollection[0].counter;
    number--;

    const updateCounter = await counter.updateOne(
        { ID: "counter" },
        { $set: { counter: number } }
    );

    res.send(update)
});

router.post("/acceptDue", async (req, res) => {
    const products = req.body;
    const reqId = req.query.reqId;

    for (const product of products) {
        const { ID, quantity } = product;

        const update = await dsrRequest.updateOne(
            {
                _id: new ObjectId(reqId),
                "requestedItems.ID": ID
            },
            {
                $set: {
                    "requestedItems.$.productQuentity": quantity,
                },
            }
        )

        console.log(update);;
    }

    const update = await dsrRequest.updateOne(
        { _id: new ObjectId(reqId) },
        {
            $set: {
                orderStatus: "acceptdue",
            },
        }
    );


    res.send("update")
});

// -----------------------randomNumberGenaretor
const randomNumberGenaretor = async () => {
    const countCollection = await counter.find();
    let number = countCollection[0].counter;
    number++;

    const updateCounter = await counter.updateOne(
        { ID: "counter" },
        { $set: { counter: number } }
    );

    const numberAsString = String(number);

    if (numberAsString.length === 1) {
        return number = `000${number}`
    }
    else if (numberAsString.length === 2) {
        return number = `00${number}`
    }
    else if (numberAsString.length === 3) {
        return number = `0${number}`
    }
    else {
        return number = `${number}`;
    }
}

router.get("/example", async (req, res) => {
    const currentTimeUTC = new Date().toISOString();
    const currentTimeDhaka = new Date(currentTimeUTC).toLocaleString('en-US', { timeZone: 'Asia/Dhaka', hour: 'numeric', minute: '2-digit', hour12: true });
    const number = await randomNumberGenaretor();
    console.log(number);
    const date = currentTimeUTC.substring(0, 10);
    const data = {
        date: date,
        time: currentTimeDhaka
    }

    res.send({ messege: number });
});

router.post("/", async (req, res) => {
    const { dsrEmail, shopId } = req.query;
    const currentTimeUTC = new Date().toISOString();
    const currentTimeDhaka = new Date(currentTimeUTC).toLocaleString('en-US', { timeZone: 'Asia/Dhaka', hour: 'numeric', minute: '2-digit', hour12: true });
    const date = currentTimeUTC.substring(0, 10);
    const dueNumber = await randomNumberGenaretor();

    const shop = await moneyInfo.findOne({ _id: shopId });
    const dsr = await userCollection.findOne({ email: dsrEmail });
    const requestedData = await cardCollection.findOne({ user: dsrEmail });
    const obj = {
        dsrInfo: dsr,
        orderDate: date,
        orderTime: currentTimeDhaka,
        orderNo: dueNumber,
        orderStatus: "pending",
        shopInfo: shop,
        requestedItems: requestedData.cardItems,
    }

    const clearCardData = await cardCollection.deleteOne({ user: dsrEmail });
    const push = await dsrRequest.create(obj);

    res.status(200).send({ message: "Request send successfully" });
});

router.get("/time", async (req, res) => {
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
    const { dsrEmail } = req.query;
    let filteredResults;
    
    const dsr = await userCollection.findOne({ email: dsrEmail });
    const shops = await moneyInfo.find();

    if(dsr.email === 'zakir7275@gmail.com' || dsr.email === 'mdhasanfakir0011@gmail.com'){
        const regexUttara = new RegExp('uttora', 'i');
        const regexMirpur = new RegExp('mirpur', 'i');
        filteredResults = shops.filter((product) => regexUttara.test(product.shopArea) || regexMirpur.test(product.shopArea));
    }else{
        const regex = new RegExp(dsr.ifDsrArea, 'i');
        filteredResults = shops.filter((product) => regex.test(product.shopArea));
    }

    filteredResults.sort((a, b) => a.shopArea.localeCompare(b.shopArea));

    res.send(filteredResults)
});

router.get("/shopById", async (req, res) => {
    const { dsrId } = req.query;
    let filteredResults;

    const dsr = await userCollection.findOne({ _id: dsrId });
    const shops = await moneyInfo.find();

    if(dsr.email === 'zakir7275@gmail.com' || dsr.email === 'mdhasanfakir0011@gmail.com'){
        const regexUttara = new RegExp('uttora', 'i');
        const regexMirpur = new RegExp('mirpur', 'i');
        filteredResults = shops.filter((product) => regexUttara.test(product.shopArea) || regexMirpur.test(product.shopArea));
    }else{
        const regex = new RegExp(dsr.ifDsrArea, 'i');
        filteredResults = shops.filter((product) => regex.test(product.shopArea));
    }
    filteredResults.sort((a, b) => a.shopArea.localeCompare(b.shopArea));
    res.send(filteredResults)
});


router.post("/adminRequest", async (req, res) => {
    const { dsrID, shopId } = req.query;
    const itemsData = req.body;
    const currentTimeUTC = new Date().toISOString();
    const currentTimeDhaka = new Date(currentTimeUTC).toLocaleString('en-US', { timeZone: 'Asia/Dhaka', hour: 'numeric', minute: '2-digit', hour12: true });
    const date = currentTimeUTC.substring(0, 10);

    if(!dsrID){
        return res.status(201).send({message: "please select a DSR"})
    }
    if(!shopId){
        return res.status(202).send({message: "please select a shop"})
    }

    const dueNumber = await randomNumberGenaretor();
    const shop = await moneyInfo.findOne({ _id: shopId });
    const dsr = await userCollection.findOne({ _id: dsrID });

    const obj = {
        dsrInfo: dsr,
        orderDate: date,
        orderTime: currentTimeDhaka,
        orderNo: dueNumber,
        orderStatus: "pending",
        shopInfo: shop,
        requestedItems: itemsData,
    }

    const update = await Product.updateMany(
        { isAddedInCard: true },
        { $set: { isAddedInCard: false } }
    );

    const push = await dsrRequest.create(obj);
    res.status(200).send({ message: "Request send successfully" });
});



module.exports = router;