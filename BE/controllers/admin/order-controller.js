const Order = require("../../models/Order");
const Product = require("../../models/Product");
const crypto = require("crypto");
const axios = require("axios");

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const orders = await Order.find({});

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

const getOrderDetailsForAdmin = async (req, res) => {
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

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order has already been cancelled",
      });
    }

    if (orderStatus === "cancelled") {
      if (order.paymentStatus === "paid") {
        const refundResult = await processRefund(order);

        if (!refundResult.success) {
          return res.status(400).json({
            success: false,
            message: "Refund failed: " + refundResult.message,
          });
        }

        order.paymentStatus = "refunded";
      }

      for (const item of order.cartItems) {
        const product = await Product.findById(item.productId);

        if (product?.variants) {
          const variant = product.variants.find(
            (v) => v.color === item.color && v.size === item.size
          );

          if (variant) {
            variant.quantity += item.quantity;
            await product.save();
          }
        }
      }

      order.orderStatus = "cancelled";
      order.cancelledBy = "admin";
      order.cancelledAt = new Date();
    } else {
      order.orderStatus = orderStatus;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message:
        orderStatus === "cancelled"
          ? "Order cancelled and refunded successfully"
          : "Order status updated successfully",
    });
  } catch (e) {
    console.log("UPDATE ORDER STATUS ERROR:", e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
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
    const description = "Order cancelled by Admin";

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
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
};
