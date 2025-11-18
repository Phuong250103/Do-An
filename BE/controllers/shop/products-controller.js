const Product = require("../../models/Product");

const calculateSeasonalPrice = (product) => {
  const now = new Date();
  const productData = product.toObject ? product.toObject() : product;

  if (productData.seasonEndDate) {
    // So sánh ngày (không tính giờ phút giây) để chính xác
    const todayDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const seasonEndDateOnly = new Date(
      new Date(productData.seasonEndDate).getFullYear(),
      new Date(productData.seasonEndDate).getMonth(),
      new Date(productData.seasonEndDate).getDate()
    );

    // Nếu mùa đã hết (phải qua ngày endseason) và chưa áp dụng giảm giá
    if (
      todayDate > seasonEndDateOnly &&
      !productData.isSeasonalDiscountApplied
    ) {
      const discountPercent = productData.discountAfterSeason || 70;
      const calculatedSalePrice = Math.round(
        productData.price * (1 - discountPercent / 100)
      );

      // Cập nhật trong database
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

    // Nếu mùa đã hết (phải qua ngày endseason) và đã áp dụng giảm giá, đảm bảo giá đúng
    if (
      todayDate > seasonEndDateOnly &&
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

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (e) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

module.exports = {
  getFilteredProducts,
  calculateSeasonalPrice,
  getProductDetails,
};
