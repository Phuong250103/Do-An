const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRoute = require("./routes/auth/auth-routes");
const adminProductRoute = require("./routes/admin/products-routes");
const adminOptionsRoute = require("./routes/admin/options-routes");
const shopProductRoute = require("./routes/shop/products-routes");
const shopCartRoute = require("./routes/shop/cart-routes");
const shopAddressRoute = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");

const cron = require("node-cron");
const Product = require("./models/Product");

mongoose
  .connect(
    "mongodb+srv://dongnam250_db_user:GDXU2phByu3CGIq2@doan.mcwcxgi.mongodb.net/"
  )
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB", err);
  });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "cache-control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);
// Khởi động cron job ở đây
cron.schedule("0 0 * * *", async () => {
  const today = new Date();
  // So sánh ngày (không tính giờ phút giây) để chính xác
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  try {
    // Tìm tất cả sản phẩm có mùa đã hết (phải qua ngày endseason)
    const allProducts = await Product.find({
      seasonEndDate: { $exists: true },
      isSeasonalDiscountApplied: false,
    });

    // Áp dụng giảm giá cho các sản phẩm mùa đã hết (phải qua ngày endseason) nhưng chưa được áp dụng
    for (const p of allProducts) {
      if (p.seasonEndDate && p.discountAfterSeason > 0) {
        const seasonEndDateOnly = new Date(
          new Date(p.seasonEndDate).getFullYear(),
          new Date(p.seasonEndDate).getMonth(),
          new Date(p.seasonEndDate).getDate()
        );

        // Chỉ áp dụng khi đã qua ngày endseason (không áp dụng trong ngày endseason)
        if (todayDate > seasonEndDateOnly) {
          const calculatedSalePrice = Math.round(
            p.price * (1 - p.discountAfterSeason / 100)
          );
          p.salePrice = calculatedSalePrice;
          p.isSeasonalDiscountApplied = true;
          await p.save();
        }
      }
    }

    // Tìm các sản phẩm có mùa chưa hết nhưng đang có isSeasonalDiscountApplied = true
    // (có thể do admin vừa chỉnh sửa chuyển từ mùa cũ sang mùa mới)
    const productsWithActiveSeason = await Product.find({
      seasonEndDate: { $gt: today },
      isSeasonalDiscountApplied: true,
    });

    for (const p of productsWithActiveSeason) {
      // Khi chuyển sang mùa mới chưa hết, chỉ cần reset flag
      // Giữ nguyên salePrice vì có thể là giá admin đã set hoặc muốn giữ
      // Mùa mới chưa hết nên không áp dụng giảm giá tự động, nhưng salePrice vẫn có thể được dùng
      p.isSeasonalDiscountApplied = false;
      await p.save();
    }

    // Đảm bảo giá đúng cho các sản phẩm mùa đã hết (phải qua ngày endseason)
    // (kiểm tra lại các sản phẩm đã có isSeasonalDiscountApplied = true nhưng giá có thể không đúng)
    const productsWithExpiredSeasonButWrongPrice = await Product.find({
      seasonEndDate: { $exists: true },
      isSeasonalDiscountApplied: true,
    });

    for (const p of productsWithExpiredSeasonButWrongPrice) {
      if (p.seasonEndDate) {
        const seasonEndDateOnly = new Date(
          new Date(p.seasonEndDate).getFullYear(),
          new Date(p.seasonEndDate).getMonth(),
          new Date(p.seasonEndDate).getDate()
        );

        if (todayDate > seasonEndDateOnly) {
          const expectedSalePrice = Math.round(
            p.price * (1 - p.discountAfterSeason / 100)
          );

          // Nếu giá hiện tại không đúng với giá nên có, cập nhật lại
          if (p.salePrice !== expectedSalePrice) {
            p.salePrice = expectedSalePrice;
            await p.save();
          }
        }
      }
    }
  } catch (error) {
    console.error("❌ Lỗi trong cron job:", error);
  }
});

app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/admin/products", adminProductRoute);
app.use("/api/admin/options", adminOptionsRoute);
app.use("/api/shop/products", shopProductRoute);
app.use("/api/shop/cart", shopCartRoute);
app.use("/api/shop/address", shopAddressRoute);
app.use("/api/shop/order", shopOrderRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
