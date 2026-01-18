const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: String,
  cartId: String,
  cartItems: [
    {
      productId: String,
      title: String,
      image: String,
      price: String,
      salePrice: String,
      quantity: Number,
      color: String,
      size: String,
    },
  ],

  addressInfo: {
    addressId: String,
    address: String,
    city: String,
    pincode: String,
    phone: String,
    notes: String,
  },

  orderStatus: {
    type: String,
    default: "pending", // pending | confirmed | shipping | delivered | cancelled | refunded
  },

  paymentMethod: {
    type: String,
    default: "MOMO", // Momo cố định
  },

  paymentStatus: {
    type: String,
    default: "pending", // pending | paid | failed | refunded
  },

  totalAmount: Number,
  orderDate: Date,
  orderUpdateDate: Date,

  momoOrderId: String, // orderId Momo trả về
  momoRequestId: String, // requestId của Momo
  transactionId: String, // mã giao dịch Momo trả về khi thanh toán thành công
  momoSignature: String, // chữ ký từ callback
  extraData: String, // dữ liệu đính kèm

  // Refund fields
  refundId: String, // refund ID từ MoMo
  refundAmount: Number, // số tiền hoàn lại
  refundReason: String, // lý do hoàn lại
  refundDate: Date, // ngày hoàn lại
  momoRefundResponse: Object, // response từ MoMo refund API

  // Nếu bạn cần kiểm tra lại response gốc từ Momo
  momoResponse: Object,
});

module.exports = mongoose.model("Order", OrderSchema);
