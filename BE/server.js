const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRoute = require("./routes/auth/auth-routes");
const adminProductRoute = require("./routes/admin/products-routes");
const adminOptionsRoute = require("./routes/admin/options-routes");
const adminOrderRoute = require("./routes/admin/order-routes");
const adminUsersRoute = require("./routes/admin/users-routes");

const shopProductRoute = require("./routes/shop/products-routes");
const shopCartRoute = require("./routes/shop/cart-routes");
const shopAddressRoute = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");

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
cron.schedule("* * * * *", async () => {
  const today = new Date();
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  try {
    const products = await Product.find({
      seasonEndDate: { $exists: true },
      saleSource: { $ne: "manual" }, //not equal
    });

    for (const p of products) {
      const seasonEndDateOnly = new Date(
        new Date(p.seasonEndDate).getFullYear(),
        new Date(p.seasonEndDate).getMonth(),
        new Date(p.seasonEndDate).getDate()
      );

      if (
        todayDate > seasonEndDateOnly &&
        (!p.isSeasonalDiscountApplied || p.saleSource === "seasonal")
      ) {
        const expectedSalePrice = Math.round(
          p.price * (1 - p.discountAfterSeason / 100)
        );

        p.salePrice = expectedSalePrice;
        p.saleSource = "seasonal";
        p.isSeasonalDiscountApplied = true;

        await p.save();
      }
    }

    const productsReset = await Product.find({
      seasonEndDate: { $gt: today },
      saleSource: "seasonal",
      isSeasonalDiscountApplied: true,
    });

    for (const p of productsReset) {
      p.isSeasonalDiscountApplied = false;
      p.saleSource = "none";
      p.salePrice = 0;
      await p.save();
    }
  } catch (error) {
    console.error("❌ Lỗi cron seasonal:", error);
  }
});

app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/admin/products", adminProductRoute);
app.use("/api/admin/options", adminOptionsRoute);
app.use("/api/admin/orders", adminOrderRoute);
app.use("/api/admin/users", adminUsersRoute);

app.use("/api/shop/products", shopProductRoute);
app.use("/api/shop/cart", shopCartRoute);
app.use("/api/shop/address", shopAddressRoute);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
