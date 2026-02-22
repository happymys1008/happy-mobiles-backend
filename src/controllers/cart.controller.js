import Cart from "../models/Cart.model.js";
import Product from "../models/Product.model.js";

/* =====================================================
   🛒 GET CART
===================================================== */
export const getCartController = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product", "name images displayPrice sellingPrice price mrp");

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    res.json(cart);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

/* =====================================================
   ➕ ADD TO CART
===================================================== */
export const addToCartController = async (req, res, next) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID required" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    // ✅ Verify product exists
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existing = cart.items.find(
      (i) =>
        String(i.product) === String(productId) &&
        String(i.variantId || "") === String(variantId || "")
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        variantId,
        quantity,
      });
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate("items.product", "name images price");

    res.json(updatedCart);

  } catch (err) {
    console.error("ADD TO CART ERROR:", err);
    next(err);
  }
};

/* =====================================================
   🔄 UPDATE CART ITEM
===================================================== */
export const updateCartItemController = async (req, res, next) => {
  try {
    const { productId, variantId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (i) =>
        String(i.product) === String(productId) &&
        String(i.variantId || "") === String(variantId || "")
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.quantity = quantity;

    await cart.save();

    res.json(cart);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

/* =====================================================
   ❌ REMOVE ITEM
===================================================== */
export const removeCartItemController = async (req, res, next) => {
  try {
    const { productId, variantId } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (i) =>
        !(
          String(i.product) === String(productId) &&
          String(i.variantId || "") === String(variantId || "")
        )
    );

    await cart.save();

    res.json(cart);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

/* =====================================================
   🧹 CLEAR CART
===================================================== */
export const clearCartController = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.json({ message: "Cart already empty" });
    }

    cart.items = [];
    await cart.save();

    res.json(cart);
  } catch (err) {
    console.error(err);
    next(err);
  }
};
