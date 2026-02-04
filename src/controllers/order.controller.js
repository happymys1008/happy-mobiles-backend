import {
  createOrder,
  createRazorpayOrder,
  getOrderById,
  listOrders,
  updateOrderStatus,
  verifyRazorpayPayment,
} from "../services/order.service.js";

export const createOrderController = async (req, res, next) => {
  try {
    const order = await createOrder(req.body);
    if (order.paymentMode === "ONLINE") {
      const razorpayOrder = await createRazorpayOrder({
        order,
        amount: order.grandTotal,
      });
      return res.json({
        order,
        razorpayOrder,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    }
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

export const verifyPaymentController = async (req, res, next) => {
  try {
    const order = await verifyRazorpayPayment(req.body);
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

export const listOrdersController = async (req, res, next) => {
  try {
    const { status, customerId } = req.query;
    const orders = await listOrders({ status, customerId });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const getOrderController = async (req, res, next) => {
  try {
    const order = await getOrderById(req.params.id);
    res.json(order);
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatusController = async (req, res, next) => {
  try {
    const order = await updateOrderStatus({
      orderId: req.params.id,
      status: req.body.status,
    });
    res.json(order);
  } catch (err) {
    next(err);
  }
};
