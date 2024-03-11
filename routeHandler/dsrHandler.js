const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const dsrRequest = require("../schemas/dsrSchema");
const Product = require("../schemas/productSchemas");

router.get("/", async (req, res) => {
    const push = await dsrRequest.create({ test: "hello" });
    res.send("hello")
});

router.get("/order", async (req, res) => {
    const data = await dsrRequest.find();
    res.send(data)
});

router.get("/searchProduct", async (req, res) => {
    const searchQuery = req.query.searchText;
    const regex = new RegExp(searchQuery, 'i'); 

    const products = await Product.find();

    const filteredResults = products.filter((product) => regex.test(product.productName));

    filteredResults.sort((a, b) => a.productName.localeCompare(b.productName));

    res.send(filteredResults)
});



module.exports = router;