const { imageUploadUtil } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");

const handleImageUpload = async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await imageUploadUtil(url);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error occured",
    });
  }
};

//add a new product
const addProduct = async (req, res) => {
  try {
    const {
      image,
      colorImages,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      averageReview,
      season,
      discountAfterSeason,
      variants,
    } = req.body;

    const now = new Date();
    const year = now.getFullYear();
    let seasonEndDate;

    switch (season) {
      case "spring":
        seasonEndDate = new Date(year, 4, 31); // 31/05
        break;
      case "summer":
        seasonEndDate = new Date(year, 7, 31); // 31/08
        break;
      case "autumn":
        seasonEndDate = new Date(2025, 10, 30); // 30/11
        break;
      case "winter":
        seasonEndDate = new Date(year + 1, 1, 28);
        break;
      default:
        seasonEndDate = null;
    }

    let finalSalePrice = 0;
    let isSeasonalDiscountApplied = false;
    let finalSaleSource = "none";

    if (salePrice && salePrice > 0) {
      finalSalePrice = Number(salePrice);
      finalSaleSource = "manual";
    }

    // Validate variants
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Vui lòng thêm ít nhất một biến thể (màu, kích thước, số lượng)",
      });
    }

    const newlyCreatedProduct = new Product({
      image,
      colorImages: colorImages || {},
      title,
      description,
      category,
      brand,
      variants: variants,
      price,
      salePrice: finalSalePrice,
      saleSource: finalSaleSource,
      averageReview,
      season,
      seasonEndDate,
      discountAfterSeason: discountAfterSeason,
      isSeasonalDiscountApplied,
    });

    await newlyCreatedProduct.save();
    res.status(201).json({
      success: true,
      data: newlyCreatedProduct,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

const calculateSeasonalPrice = (product) => {
  const productData = product.toObject ? product.toObject() : product;

  return productData;
};

//fetch all products

const fetchAllProducts = async (req, res) => {
  try {
    const listOfProducts = await Product.find({}).lean();
    const productsWithCalculatedPrice = listOfProducts.map((product) =>
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
      message: "Error occured",
    });
  }
};

//edit a product
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      image,
      colorImages,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      averageReview,
      season,
      discountAfterSeason,
      variants,
    } = req.body;

    let findProduct = await Product.findById(id);
    const incomingSalePrice =
      salePrice === "" || salePrice === undefined ? null : Number(salePrice);

    const currentSalePrice =
      findProduct.salePrice === null || findProduct.salePrice === undefined
        ? null
        : Number(findProduct.salePrice);

    const isSalePriceChanged = incomingSalePrice !== currentSalePrice;

    if (!findProduct)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    // Nếu season thay đổi, tính lại seasonEndDate
    if (season && season !== findProduct.season) {
      const now = new Date();
      const year = now.getFullYear();
      let seasonEndDate;

      switch (season) {
        case "spring":
          seasonEndDate = new Date(year, 4, 31); // 31/05
          break;
        case "summer":
          seasonEndDate = new Date(year, 7, 31); // 31/08
          break;
        case "autumn":
          seasonEndDate = new Date(2025, 10, 30); // 30/11
          break;
        case "winter":
          seasonEndDate = new Date(year + 1, 1, 28);
          break;
        default:
          seasonEndDate = null;
      }

      findProduct.season = season;
      findProduct.seasonEndDate = seasonEndDate;
      findProduct.isSeasonalDiscountApplied = false; // Reset khi đổi mùa
    }

    findProduct.title = title || findProduct.title;
    findProduct.description = description || findProduct.description;
    findProduct.category = category || findProduct.category;
    findProduct.brand = brand || findProduct.brand;
    findProduct.price = price === "" ? 0 : price || findProduct.price;
    findProduct.image = image || findProduct.image;
    if (isSalePriceChanged) {
      if (incomingSalePrice !== null && incomingSalePrice > 0) {
        findProduct.salePrice = incomingSalePrice;
        findProduct.saleSource = "manual";
        findProduct.isSeasonalDiscountApplied = false;
      } else {
        findProduct.salePrice = null;
        findProduct.saleSource = "none";
        findProduct.isSeasonalDiscountApplied = false;
      }
    }

    if (colorImages !== undefined) {
      findProduct.colorImages = colorImages;
    }
    findProduct.averageReview = averageReview || findProduct.averageReview;

    // Cập nhật variants
    if (variants && Array.isArray(variants) && variants.length > 0) {
      findProduct.variants = variants;
    } else if (variants !== undefined) {
      return res.status(400).json({
        success: false,
        message:
          "Vui lòng thêm ít nhất một biến thể (màu, kích thước, số lượng)",
      });
    }
    if (discountAfterSeason !== undefined) {
      findProduct.discountAfterSeason = discountAfterSeason;
    }

    await findProduct.save();

    const finalProduct = calculateSeasonalPrice(findProduct);

    res.status(200).json({
      success: true,
      data: finalProduct,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    res.status(200).json({
      success: true,
      message: "Product delete successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

module.exports = {
  handleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
};
