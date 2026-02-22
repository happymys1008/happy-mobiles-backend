import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.model.js";
import User from "../models/User.model.js";

const createHttpError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw createHttpError(500, "Razorpay keys are not configured");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const buildOrderNo = () => `ORD-${Date.now()}`;

const STATUS_FLOW = [
  "CREATED",
  "PAID",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
];

const isValidStatus = (status) =>
  [...STATUS_FLOW, "CANCELLED"].includes(status);

const nextAllowedStatuses = (current) => {
  if (!current) return ["CREATED"];
  if (current === "CANCELLED" || current === "DELIVERED") return [];
  if (current === "CREATED") return ["PAID", "CANCELLED"];
  if (current === "PAID") return ["PACKED", "CANCELLED"];
  if (current === "PACKED") return ["SHIPPED", "CANCELLED"];
  if (current === "SHIPPED") return ["DELIVERED", "CANCELLED"];
  return [];
};

const applyStatusTimestamp = (order, status) => {
  const now = new Date();
  order.statusTimestamps = order.statusTimestamps || {};
  if (status === "CREATED") order.statusTimestamps.createdAt = now;
  if (status === "PAID") order.statusTimestamps.paidAt = now;
  if (status === "PACKED") order.statusTimestamps.packedAt = now;
  if (status === "SHIPPED") order.statusTimestamps.shippedAt = now;
  if (status === "DELIVERED") order.statusTimestamps.deliveredAt = now;
  if (status === "CANCELLED") order.statusTimestamps.cancelledAt = now;
};

export const updateOrderStatus = async ({ orderId, status }) => {
  if (!isValidStatus(status)) {
    throw createHttpError(400, "Invalid status");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw createHttpError(404, "Order not found");
  }

  if (order.status === status) {
    return order;
  }

  const allowed = nextAllowedStatuses(order.status);
  if (!allowed.includes(status)) {
    throw createHttpError(400, "Invalid status transition");
  }

  order.status = status;
  if (status === "PAID") order.paymentStatus = "PAID";
  if (status === "CANCELLED" && order.paymentStatus !== "PAID") {
    order.paymentStatus = "PENDING";
  }
  applyStatusTimestamp(order, status);
  await order.save();
  return order;
};

export const listOrders = async ({ status, customerId } = {}) => {
  const query = {};
  if (status) query.status = status;

  if (customerId) {
    query.$or = [
      { customerMobile: customerId },
      { customerName: customerId },
    ];
    if (customerId.match?.(/^[0-9a-fA-F]{24}$/)) {
      query.$or.push({ user: customerId });
    }
  }

  return Order.find(query).sort({ createdAt: -1 });
};

export const getOrderById = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) throw createHttpError(404, "Order not found");
  return order;
};

const normalizeItems = (items) =>
  (Array.isArray(items) ? items : [])
    .map((item) => ({
      product: item.productId || item.product,
      variantId: item.variantId || null,
      name: item.name || "",
      quantity: Number(item.qty || item.quantity || 0),
      price: Number(item.price || 0),
    }))
    .filter((item) => item.product && item.quantity > 0);

export const createOrder = async (payload) => {
  const {
    items,
    total,
    shippingCharge = 0,
    grandTotal,
    paymentMode,
    paymentStatus = "PENDING",
    customerName,
    deliveryAddress,
    user, // 🔥 coming from controller (req.user._id)
  } = payload;

  const normalizedItems = normalizeItems(items);

  if (normalizedItems.length === 0) {
    throw createHttpError(400, "Order must have at least one item");
  }

  // 🔥 USE AUTH USER DIRECTLY
  const existingUser = await User.findById(user);

  if (!existingUser) {
    throw createHttpError(400, "Customer not found");
  }

  const order = await Order.create({
    user: existingUser._id,
    orderNo: buildOrderNo(),
    customerName: customerName || existingUser.name,
    customerMobile: existingUser.mobile,
    deliveryAddress,
    items: normalizedItems,
    totalAmount: Number(total || 0),
    shippingCharge: Number(shippingCharge || 0),
    grandTotal: Number(grandTotal ?? total ?? 0),
    paymentMode,
    paymentStatus,
    status: "CREATED",
    statusTimestamps: {
      createdAt: new Date(),
    },
  });

  if (paymentStatus === "PAID") {
    await updateOrderStatus({ orderId: order._id, status: "PAID" });
  }

  return order;
};


export const createRazorpayOrder = async ({ order, amount }) => {
  const razorpay = getRazorpayClient();
  const totalPaise = Math.round(Number(amount || 0) * 100);
  if (!Number.isFinite(totalPaise) || totalPaise <= 0) {
    throw createHttpError(400, "Invalid amount");
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: totalPaise,
    currency: "INR",
    receipt: order.orderNo,
  });

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  return razorpayOrder;
};

export const verifyRazorpayPayment = async ({
  orderId,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw createHttpError(400, "Invalid payment payload");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw createHttpError(404, "Order not found");
  }

  if (order.razorpayOrderId !== razorpay_order_id) {
    throw createHttpError(400, "Order mismatch");
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expected.length !== razorpay_signature.length) {
    throw createHttpError(400, "Invalid payment signature");
  }

  const isValid = crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(razorpay_signature)
  );

  if (!isValid) {
    throw createHttpError(400, "Invalid payment signature");
  }

  order.razorpayPaymentId = razorpay_payment_id;
  order.razorpaySignature = razorpay_signature;
  await order.save();
  await updateOrderStatus({ orderId: order._id, status: "PAID" });

  return order;
};
