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
      title,
      description,
      category,
      brand,
      size,
      color,
      price,
      salePrice,
      totalStock,
      averageReview,
      season,
      discountAfterSeason,
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
        seasonEndDate = new Date(year, 10, 30); // 30/11
        break;
      case "winter":
        seasonEndDate = new Date(year + 1, 1, 28);
        break;
      default:
        seasonEndDate = null;
    }

    // Kiểm tra nếu mùa đã kết thúc ngay khi thêm
    let finalSalePrice = 0; // mặc định không giảm
    let isSeasonalDiscountApplied = false;

    if (seasonEndDate && now >= seasonEndDate) {
      // mùa đã hết → áp dụng giảm giá
      finalSalePrice = Math.round(
        price * (1 - (discountAfterSeason || 70) / 100)
      );
      isSeasonalDiscountApplied = true;
    } else {
      // mùa chưa hết → giữ salePrice admin nhập nếu có
      finalSalePrice = salePrice || 0;
    }

    const newlyCreatedProduct = new Product({
      image,
      title,
      description,
      category,
      brand,
      size,
      color,
      price,
      salePrice: finalSalePrice, // Lưu giá đã tính toán
      totalStock,
      averageReview,
      season,
      seasonEndDate,
      discountAfterSeason: discountAfterSeason || 70,
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

// Helper function để tính giá dựa trên thời gian hiện tại
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

//fetch all products

const fetchAllProducts = async (req, res) => {
  try {
    const listOfProducts = await Product.find({});
    // Tính toán giá động cho từng sản phẩm
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
      title,
      description,
      category,
      brand,
      size,
      color,
      price,
      salePrice,
      totalStock,
      averageReview,
      season,
      discountAfterSeason,
    } = req.body;

    let findProduct = await Product.findById(id);
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
          seasonEndDate = new Date(year, 10, 30); // 30/11
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
    findProduct.size = size || findProduct.size;
    findProduct.color = color || findProduct.color;
    findProduct.price = price === "" ? 0 : price || findProduct.price;
    findProduct.totalStock = totalStock || findProduct.totalStock;
    findProduct.image = image || findProduct.image;
    findProduct.averageReview = averageReview || findProduct.averageReview;
    if (discountAfterSeason !== undefined) {
      findProduct.discountAfterSeason = discountAfterSeason;
    }

    // Kiểm tra và áp dụng giá khi hết mùa
    const now = new Date();
    if (
      findProduct.seasonEndDate &&
      now >= new Date(findProduct.seasonEndDate) &&
      !findProduct.isSeasonalDiscountApplied
    ) {
      // Mùa đã hết → áp dụng giảm giá
      const discountPercent = findProduct.discountAfterSeason || 70;
      findProduct.salePrice = Math.round(
        findProduct.price * (1 - discountPercent / 100)
      );
      findProduct.isSeasonalDiscountApplied = true;
    } else if (
      findProduct.seasonEndDate &&
      now < new Date(findProduct.seasonEndDate)
    ) {
      // Mùa chưa hết → giữ salePrice admin nhập nếu có
      findProduct.salePrice =
        salePrice === "" ? 0 : salePrice || findProduct.salePrice;
      findProduct.isSeasonalDiscountApplied = false;
    } else if (salePrice !== undefined) {
      // Nếu admin chỉnh sửa salePrice trực tiếp
      findProduct.salePrice = salePrice === "" ? 0 : salePrice;
    }

    await findProduct.save();
    
    // Tính toán giá cuối cùng trước khi trả về
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
