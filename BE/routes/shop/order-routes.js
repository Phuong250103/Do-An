const express = require("express");

const {
  createOrder,
  handleMomoCallback, // xử lý IPN hoặc returnUrl
  getAllOrdersByUser,
  getOrderDetails,
  cancelOrder,
} = require("../../controllers/shop/order-controller");

const router = express.Router();

router.post("/create", createOrder);
router.get("/momo-callback", handleMomoCallback);
router.get("/list/:userId", getAllOrdersByUser);
router.get("/details/:id", getOrderDetails);
router.put("/cancel/:id", cancelOrder);

module.exports = router;
