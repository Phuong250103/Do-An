const Product = require("../../models/Product");

const calculateSeasonalPrice = (product) => {
  const now = new Date();
  const productData = product.toObject ? product.toObject() : product;

  // Nếu mùa đã hết và chưa áp dụng giảm giá
  if (
    productData.seasonEndDate &&
    now >= new Date(productData.seasonEndDate) &&
    !productData.isSeasonalDiscountApplied
  ) {
    const discountPercent = productData.discountAfterSeason || 70;
    const calculatedSalePrice = Math.round(
      productData.price * (1 - discountPercent / 100)
    );

    // Cập nhật trong database (async, không cần đợi)
    Product.findByIdAndUpdate(productData._id, {
      salePrice: calculatedSalePrice,
      isSeasonalDiscountApplied: true,
    }).catch((err) => console.log("Error updating price:", err));

    return {
      ...productData,
      salePrice: calculatedSalePrice,
      isSeasonalDiscountApplied: true,
    };
  }

  // Nếu mùa đã hết và đã áp dụng giảm giá, đảm bảo giá đúng
  if (
    productData.seasonEndDate &&
    now >= new Date(productData.seasonEndDate) &&
    productData.isSeasonalDiscountApplied
  ) {
    const discountPercent = productData.discountAfterSeason || 70;
    const expectedSalePrice = Math.round(
      productData.price * (1 - discountPercent / 100)
    );

    // Nếu giá hiện tại không đúng, cập nhật lại
    if (productData.salePrice !== expectedSalePrice) {
      Product.findByIdAndUpdate(productData._id, {
        salePrice: expectedSalePrice,
      }).catch((err) => console.log("Error updating price:", err));

      return {
        ...productData,
        salePrice: expectedSalePrice,
      };
    }
  }

  return productData;
};

const getFilteredProducts = async (req, res) => {
  try {
    // const { category = [], brand = [], sortBy = "price-lowtohigh" } = req.query;

    // let filters = {};

    // if (category.length) {
    //   filters.category = { $in: category.split(",") };
    // }

    // if (brand.length) {
    //   filters.brand = { $in: brand.split(",") };
    // }

    // let sort = {};

    // switch (sortBy) {
    //   case "price-lowtohigh":
    //     sort.price = 1;

    //     break;
    //   case "price-hightolow":
    //     sort.price = -1;

    //     break;
    //   case "title-atoz":
    //     sort.title = 1;

    //     break;

    //   case "title-ztoa":
    //     sort.title = -1;

    //     break;

    //   default:
    //     sort.price = 1;
    //     break;
    // }

    const products = await Product.find({});
    
    // Tính toán giá động cho từng sản phẩm
    const productsWithCalculatedPrice = products.map((product) =>
      calculateSeasonalPrice(product)
    );

    res.status(200).json({
      success: true,
      data: productsWithCalculatedPrice,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

module.exports = {
  getFilteredProducts,
};
