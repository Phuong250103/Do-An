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

    const redirectUrl = "http://localhost:5000/api/shop/order/momo-callback";
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
    const { orderId, resultCode, transId } = req.query;

    // STEP 2: Find order
    const order = await Order.findOne({ momoOrderId: orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // STEP 3: Update order depending on payment result
    if (resultCode === "0" || resultCode === 0) {
      order.paymentStatus = "paid";
      order.orderStatus = "confirmed";
      order.transactionId = transId;
    } else {
      order.paymentStatus = "failed";
      order.orderStatus = "cancelled";
    }

    order.orderUpdateDate = new Date();
    order.momoResponse = req.query;

    await order.save();

    // STEP 4: Reduce stock when payment success
    if (resultCode === "0" || resultCode === 0) {
      for (let item of order.cartItems) {
        let product = await Product.findById(item.productId);

        if (product) {
          product.totalStock -= item.quantity;
          await product.save();
        }
      }

      // Remove only items that were paid (match by productId, color, size)
      if (order.userId) {
        try {
          for (let paidItem of order.cartItems) {
            const updateRes = await Cart.updateOne(
              { userId: order.userId },
              {
                $pull: {
                  items: {
                    productId: paidItem.productId,
                    color: paidItem.color,
                    size: paidItem.size,
                  },
                },
              }
            );
            console.log(`Update result for item: ${JSON.stringify(updateRes)}`);
          }
        } catch (delErr) {
          console.error("❌ Error removing paid items from cart:", delErr);
        }
      }
    }

    return res.redirect("http://localhost:5173/shop/account");
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

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    if (order.orderStatus !== "pending" && order.orderStatus !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel order with status: " + order.orderStatus,
      });
    }

    order.orderStatus = "cancelled";
    order.orderUpdateDate = new Date();
    await order.save();

    if (order.paymentStatus === "paid") {
      // Process refund
      const refundPayload = await processRefund(order);

      if (!refundPayload.success) {
        return res.status(400).json({
          success: false,
          message: "Failed to refund paid order: " + refundPayload.message,
        });
      }

      for (let item of order.cartItems) {
        let product = await Product.findById(item.productId);

        if (product && product.variants) {
          const variant = product.variants.find(
            (v) => v.color === item.color && v.size === item.size
          );
          if (variant) {
            variant.quantity += item.quantity;
            await product.save();
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
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

const processRefund = async (order) => {
  try {
    const partnerCode = "MOMO";
    const accessKey = "F8BBA842ECF85";
    const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";

    const refundOrderId = `REFUND_${Date.now()}`; //  ID HOÀN TIỀN
    const requestId = Date.now().toString();
    const description = "Order cancelled by user";

    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${order.totalAmount}` +
      `&description=${description}` +
      `&orderId=${refundOrderId}` +
      `&partnerCode=${partnerCode}` +
      `&requestId=${requestId}` +
      `&transId=${order.transactionId}`;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const refundPayload = {
      partnerCode,
      accessKey,
      requestId,
      orderId: refundOrderId,
      amount: order.totalAmount,
      transId: order.transactionId,
      lang: "vi",
      description,
      signature,
    };

    const momoRefundEndpoint =
      "https://test-payment.momo.vn/v2/gateway/api/refund";

    const refundResponse = await axios.post(momoRefundEndpoint, refundPayload, {
      headers: { "Content-Type": "application/json" },
    });

    if (refundResponse.data.resultCode === 0) {
      order.paymentStatus = "refunded";
      order.refundOrderId = refundOrderId;
      order.refundAmount = order.totalAmount;
      order.refundReason = description;
      order.refundDate = new Date();
      order.momoRefundResponse = refundResponse.data;

      await order.save();

      return { success: true, message: "Refund processed successfully" };
    }

    order.momoRefundResponse = refundResponse.data;
    await order.save();

    return {
      success: false,
      message: refundResponse.data.message || "Refund failed",
    };
  } catch (e) {
    console.error("PROCESS REFUND ERROR:", e.response?.data || e);
    return {
      success: false,
      message: "Error processing refund: " + e.message,
    };
  }
};

module.exports = {
  createOrder,
  handleMomoCallback,
  getAllOrdersByUser,
  getOrderDetails,
  cancelOrder,
};
