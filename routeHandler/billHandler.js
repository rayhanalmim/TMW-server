const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Cost = require("../schemas/costSchemas.js");
const billCollection = require("../schemas/billSchema.js");
const moneyInfo = require("../schemas/moneySchemas.js");
const { ObjectId } = require("mongodb");


// router.get("/", async (req, res) => {
//   try {
//     const latestBills = await billCollection.find()
//     .sort({ _id: -1 }) // Sort by descending order to get the latest first
//       .limit(45); // Limit the result to the latest 30 bills
//       const reversedBills = latestBills.reverse(); // Reverse the order of bills

//       res.send(reversedBills); // Send the reversed data
//   } catch (error) {
//     console.error("Error fetching costs:", error);
//     res.status(500).send({ error: "Internal Server Error" });
//   }
// });

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default to 1
    const limit = parseInt(req.query.limit) || 10; // Records per page, default to 10
    const skip = (page - 1) * limit; // Number of records to skip

    // Get total number of records for pagination metadata
    const totalRecords = await billCollection.countDocuments({});
    
    // Fetch the paginated data
    const billData = await billCollection.find()
      .sort({ _id: -1 }) // Sorting by descending ID
      .skip(skip) // Skips the required records
      .limit(limit); // Limits the number of results

    // Pagination metadata
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
    };

    res.json({ billData, pagination });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

router.get("/shop", async (req, res) => {
  const shopID = req.query.shopId;
  console.log(shopID);
  const bills = await billCollection.find({ 'shopInfo._id': shopID });
  console.log(bills);
  res.send(bills);
});

router.post("/paid", async (req, res) => {
  const { amount, billId, shopId } = req.query;
  const shop = await moneyInfo.findOne({ _id: new ObjectId(shopId) });

  const bill = await billCollection.findOne({ _id: new ObjectId(billId) });

  console.log(shop, bill, amount);

  if (parseInt(bill.due) < parseInt(amount)) {
    return res.status(201).send({ message: "invalid amout" })
  }

  const updateBill = await billCollection.updateOne(
    { _id: new ObjectId(billId) },
    { $set: { due: parseInt(bill.due) - parseInt(amount) } }
  );

  const update = await moneyInfo.updateOne(
    { _id: new ObjectId(shopId) },
    { $set: { totalDue: shop.totalDue - parseInt(amount), totalPay: shop.totalPay + parseInt(amount) } }
  );
  res.send("update");
});


router.get("/findOne", async (req, res) => {
  try {
    const { billId } = req.query;
    const bills = await billCollection.findOne({ _id: billId });
    res.send(bills);
  } catch (error) {
    console.error("Error fetching costs:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const costData = req.body;
    const newCost = await Cost.create(costData);
    res.status(201).send(newCost);
  } catch (error) {
    console.error("Error creating cost:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});


module.exports = router;
