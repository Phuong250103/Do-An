const mongoose = require("mongoose");

const VariantSchema = new mongoose.Schema({
  color: { type: String, required: true },
  size: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
});

const ProductSchema = new mongoose.Schema(
  {
    image: String,
    colorImages: {
      type: Map,
      of: String,
      default: {},
    },
    title: String,
    description: String,
    category: String,
    brand: String,
    variants: [VariantSchema],
    price: Number,
    salePrice: Number,
    averageReview: Number,
    season: {
      type: String,
      enum: ["spring", "summer", "autumn", "winter"],
      required: true,
    },
    seasonEndDate: { type: Date },
    discountAfterSeason: { type: Number, default: 70 },
    isSeasonalDiscountApplied: { type: Boolean, default: false },
    saleSource: {
      type: String,
      enum: ["manual", "seasonal", "none"],
      default: "none",
    },
  },
  { timestamps: true }
);

ProductSchema.virtual("totalStock").get(function () {
  if (this.variants && this.variants.length > 0) {
    return this.variants.reduce(
      (sum, variant) => sum + (variant.quantity || 0),
      0
    );
  }
  return 0;
});

ProductSchema.set("toJSON", { virtuals: true });
ProductSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Product", ProductSchema);
