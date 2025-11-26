const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, color, size } = req.body;

    if (!userId || !productId || quantity <= 0 || !color || !size) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const findCurrentProductIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.color === color &&
        item.size === size
    );

    if (findCurrentProductIndex === -1) {
      cart.items.push({ productId, quantity, color, size });
    } else {
      cart.items[findCurrentProductIndex].quantity += quantity;
    }

    await cart.save();
    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is manadatory!",
      });
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "image colorImages title price salePrice",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    const validItems = cart.items.filter(
      (productItem) => productItem.productId
    );

    if (validItems.length < cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const populateCartItems = validItems.map((item) => {
      // Lấy ảnh theo màu
      let imageUrl = item.productId.image; // Ảnh mặc định
      if (item.color && item.productId.colorImages) {
        const colorImages = item.productId.colorImages;
        // colorImages có thể là Map hoặc object
        if (colorImages instanceof Map) {
          imageUrl = colorImages.get(item.color) || imageUrl;
        } else if (typeof colorImages === "object" && colorImages[item.color]) {
          imageUrl = colorImages[item.color];
        }
      }

      return {
        productId: item.productId._id,
        image: imageUrl,
        title: item.productId.title,
        color: item.color,
        size: item.size,
        price: item.productId.price,
        salePrice: item.productId.salePrice,
        quantity: item.quantity,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const updateCartItemQty = async (req, res) => {
  try {
    const { userId, productId, quantity, color, size } = req.body;

    if (!userId || !productId || quantity <= 0 || !color || !size) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    const findCurrentProductIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.color === color &&
        item.size === size
    );

    if (findCurrentProductIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cart item not present !",
      });
    }

    cart.items[findCurrentProductIndex].quantity = quantity;
    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image colorImages title price salePrice",
    });

    const populateCartItems = cart.items.map((item) => {
      // Lấy ảnh theo màu
      let imageUrl = item.productId ? item.productId.image : null;
      if (item.color && item.productId && item.productId.colorImages) {
        const colorImages = item.productId.colorImages;
        if (colorImages instanceof Map) {
          imageUrl = colorImages.get(item.color) || imageUrl;
        } else if (typeof colorImages === "object" && colorImages[item.color]) {
          imageUrl = colorImages[item.color];
        }
      }

      return {
        productId: item.productId ? item.productId._id : null,
        image: imageUrl,
        title: item.productId ? item.productId.title : "Product not found",
        price: item.productId ? item.productId.price : null,
        salePrice: item.productId ? item.productId.salePrice : null,
        color: item.color ? item.color : null,
        size: item.size ? item.size : null,
        quantity: item.quantity,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { color, size } = req.query;
    
    if (!userId || !productId || !color || !size) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.productId.toString() === productId &&
          item.color === color &&
          item.size === size
        )
    );

    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image colorImages title price salePrice",
    });

    const populateCartItems = cart.items.map((item) => {
      // Lấy ảnh theo màu
      let imageUrl = item.productId ? item.productId.image : null;
      if (item.color && item.productId && item.productId.colorImages) {
        const colorImages = item.productId.colorImages;
        if (colorImages instanceof Map) {
          imageUrl = colorImages.get(item.color) || imageUrl;
        } else if (typeof colorImages === "object" && colorImages[item.color]) {
          imageUrl = colorImages[item.color];
        }
      }

      return {
        productId: item.productId ? item.productId._id : null,
        image: imageUrl,
        title: item.productId ? item.productId.title : "Product not found",
        price: item.productId ? item.productId.price : null,
        color: item.color ? item.color : null,
        size: item.size ? item.size : null,
        salePrice: item.productId ? item.productId.salePrice : null,
        quantity: item.quantity,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

module.exports = {
  addToCart,
  fetchCartItems,
  updateCartItemQty,
  deleteCartItem,
};
