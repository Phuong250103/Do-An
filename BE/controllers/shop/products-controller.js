const Product = require("../../models/Product");

const calculateSeasonalPrice = (product) => {
  const productData = product.toObject ? product.toObject() : product;

  return productData;
};

const getFilteredProducts = async (req, res) => {
  try {
    const { category, brand } = req.query;

    let filters = {};

    if (category) {
      filters.category = { $in: category.split(",") };
    }

    if (brand) {
      filters.brand = { $in: brand.split(",") };
    }

    const products = await Product.find(filters);

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
