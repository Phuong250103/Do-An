const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    image: String,
    title: String,
    description: String,
    category: String,
    brand: String,
    size: String,
    color: String,
    price: Number,
    salePrice: Number,
    totalStock: Number,
    averageReview: Number,
    season: {
      type: String,
      enum: ["spring", "summer", "autumn", "winter"],
      required: true,
    },
    seasonEndDate: { type: Date },
    discountAfterSeason: { type: Number, default: 70 },
    isSeasonalDiscountApplied: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
