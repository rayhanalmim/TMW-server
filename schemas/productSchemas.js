const sigmaProduct = {
    email: "sigma@example.com",
    photoURL: "https://example.com/sigma.jpg",
    displayName: "Sigma User",
    userRole: "agent",
    totalBuy: 10000,
    due: 300,
    address: "456 Oak Street, Townsville",
    nidCardNumber: "9876543210987654",
    phoneNumber: "+1 987-654-3210",
    reference: "Colleague's name",
    code: 87654321,
    agentDealingInfo: {
      perDeal: 150,
      monthly: 1200,
      yearly: 14400,
    },
    productBuyInfo: [
      {
        productName: "Product C",
        quantity: 3,
        date: "2024-02-05",
        productDetails: "Details about Product C",
        productPrice: 75,
        paymentMethod: "PayPal",
      },
      {
        productName: "Product D",
        quantity: 2,
        date: "2024-02-06",
        productDetails: "Details about Product D",
        productPrice: 40,
        paymentMethod: "Bank Transfer",
      },
    ],
  };
  
  module.exports = sigmaProduct;
  