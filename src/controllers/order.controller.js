import Order from "../models/Order.model.js";
import {
  createOrder,
  createRazorpayOrder,
  getOrderById,
  listOrders,
  updateOrderStatus,
  verifyRazorpayPayment,
} from "../services/order.service.js";

/* =====================================================
   🛒 CREATE ORDER (Customer Only)
===================================================== */
export const createOrderController = async (req, res, next) => {
  try {
    const order = await createOrder({
      ...req.body,
      user: req.user._id,
    });

    res.json({ order });

  } catch (err) {
    next(err);
  }
};

/* =====================================================
   💳 CREATE RAZORPAY ORDER (Payment Page)
===================================================== */
export const createRazorpayOrderController = async (req, res, next) => {
  try {
    const orderId = req.params.id;

    const order = await getOrderById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔐 Customer cannot pay someone else's order
    if (
      req.user.role === "customer" &&
      String(order.user) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const razorpayOrder = await createRazorpayOrder({
      order,
      amount: order.grandTotal,
    });

    res.json({
      razorpayOrder,
      keyId: process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    next(err);
  }
};

/* =====================================================
   💳 VERIFY PAYMENT
===================================================== */
export const verifyPaymentController = async (req, res, next) => {
  try {
    const order = await verifyRazorpayPayment({
      ...req.body,
      userId: req.user._id,
    });

    res.json({ order });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   📦 GET MY ORDERS (Customer)
===================================================== */
export const getMyOrdersController = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name images price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   📋 LIST ORDERS (Admin Only)
===================================================== */
export const listOrdersController = async (req, res, next) => {
  try {
    const { status, customerId } = req.query;

    if (req.user.role === "customer") {
      const orders = await Order.find({ user: req.user._id })
        .sort({ createdAt: -1 });

      return res.json(orders);
    }

    const orders = await listOrders({ status, customerId });
    res.json(orders);

  } catch (err) {
    next(err);
  }
};

/* =====================================================
   🔍 GET SINGLE ORDER
===================================================== */
export const getOrderController = async (req, res, next) => {
  try {
    const order = await getOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (
      req.user.role === "customer" &&
      String(order.user) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);

  } catch (err) {
    next(err);
  }
};

/* =====================================================
   🔄 UPDATE ORDER STATUS (Admin Only)
===================================================== */
export const updateOrderStatusController = async (req, res, next) => {
  try {
    if (req.user.role === "customer") {
      return res.status(403).json({ message: "Not allowed" });
    }

    const order = await updateOrderStatus({
      orderId: req.params.id,
      status: req.body.status,
    });

    res.json(order);

  } catch (err) {
    next(err);
  }
};
