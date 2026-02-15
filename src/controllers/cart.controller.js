import Cart from "../models/Cart.model.js";

/* =====================================================
   🛒 GET CART
===================================================== */
export const getCartController = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product", "name images price");

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    res.json(cart);
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   ➕ ADD TO CART
===================================================== */
export const addToCartController = async (req, res, next) => {
  try {
    const { productId, variantId, name, price, quantity = 1 } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
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
        name,
        price,
        quantity,
      });
    }

    await cart.save();

    res.json(cart);
  } catch (err) {
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
    next(err);
  }
};
