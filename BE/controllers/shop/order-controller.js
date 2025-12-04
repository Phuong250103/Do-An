const axios = require("axios");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const crypto = require("crypto");

const createOrder = async (req, res) => {
  try {
    const { userId, cartItems, addressInfo, totalAmount, cartId } = req.body;

    const orderId = "ORDER_" + Date.now();
    const requestId = Date.now().toString();
    const orderInfo = "Thanh toán đơn hàng #" + orderId;

    const partnerCode = "MOMO";
    const accessKey = "F8BBA842ECF85";
    const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";

    const redirectUrl = "http://localhost:5173/shop/momo-return";
    const ipnUrl = "http://localhost:5000/api/shop/order/momo-callback";

    const rawSignature =
      "accessKey=" +
      accessKey +
      "&amount=" +
      totalAmount +
      "&extraData=" +
      "" +
      "&ipnUrl=" +
      ipnUrl +
      "&orderId=" +
      orderId +
      "&orderInfo=" +
      orderInfo +
      "&partnerCode=" +
      partnerCode +
      "&redirectUrl=" +
      redirectUrl +
      "&requestId=" +
      requestId +
      "&requestType=payWithMethod";

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const payload = {
      partnerCode,
      partnerName: "Test",
      storeId: "MomoTestStore",
      requestId,
      amount: totalAmount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: "vi",
      extraData: "",
      requestType: "payWithMethod",
      signature,
    };

    // send to MoMo test endpoint (sample)
    const momoEndpoint =
      req.body.momoEndpoint ||
      "https://test-payment.momo.vn/v2/gateway/api/create";
    const momoResponse = await axios.post(momoEndpoint, payload, {
      headers: { "Content-Type": "application/json" },
    });

    // Save order in pending status
    const newOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus: "pending",
      paymentMethod: "MOMO",
      paymentStatus: "pending",
      totalAmount,
      orderDate: new Date(),
      momoOrderId: orderId,
      momoRequestId: requestId,
      momoResponse: momoResponse.data,
    });

    await newOrder.save();

    return res.status(201).json({
      success: true,
      payUrl: momoResponse.data.payUrl,
      orderId: newOrder._id,
    });
  } catch (e) {
    console.log("MOMO CREATE ORDER ERROR:", e);
    return res.status(500).json({
      success: false,
      message: "Error creating Momo order",
    });
  }
};

const handleMomoCallback = async (req, res) => {
  try {
    const {
      orderId,
      requestId,
      amount,
      resultCode,
      message,
      transId,
      orderInfo,
      extraData,
      payType,
      responseTime,
      signature,
    } = req.body;

    // STEP 1: Verify signature
    const rawSignature =
      "accessKey=" +
      "F8BBA842ECF85" +
      "&amount=" +
      amount +
      "&extraData=" +
      extraData +
      "&message=" +
      message +
      "&orderId=" +
      orderId +
      "&orderInfo=" +
      orderInfo +
      "&orderType=momo" +
      "&partnerCode=" +
      "MOMO" +
      "&payType=" +
      payType +
      "&requestId=" +
      requestId +
      "&responseTime=" +
      responseTime +
      "&resultCode=" +
      resultCode +
      "&transId=" +
      transId;

    const expectedSignature = crypto
      .createHmac("sha256", "K951B6PE1waDMi640xX08PD3vg6EkVlz")
      .update(rawSignature)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.log("❌ Invalid Momo signature");
      return res.status(400).json({ message: "Invalid signature" });
    }

    // STEP 2: Find order
    const order = await Order.findOne({ momoOrderId: orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // STEP 3: Update order depending on payment result
    if (resultCode === 0) {
      order.paymentStatus = "paid";
      order.orderStatus = "confirmed";
      order.transactionId = transId;
    } else {
      order.paymentStatus = "failed";
      order.orderStatus = "cancelled";
    }

    order.orderUpdateDate = new Date();
    order.momoResponse = req.body;

    await order.save();

    // STEP 4: Reduce stock when payment success
    if (resultCode === 0) {
      for (let item of order.cartItems) {
        let product = await Product.findById(item.productId);

        if (product) {
          product.totalStock -= item.quantity;
          await product.save();
        }
      }

      await Cart.findByIdAndDelete(order.cartId);
    }

    return res.json({ message: "Order updated successfully" });
  } catch (e) {
    console.log("MOMO CALLBACK ERROR:", e);
    return res.status(500).json({ message: "Callback error" });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createOrder,
  handleMomoCallback,
  getAllOrdersByUser,
  getOrderDetails,
};
