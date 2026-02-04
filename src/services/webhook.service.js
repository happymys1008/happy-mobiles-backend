import crypto from "crypto";
import Order from "../models/Order.model.js";
import { updateOrderStatus } from "./order.service.js";

const createHttpError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const getSignature = (req) =>
  req.headers["x-razorpay-signature"] || "";

const computeSignature = (secret, body) =>
  crypto.createHmac("sha256", secret).update(body).digest("hex");

const safeEqual = (a, b) => {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

export const verifyRazorpayWebhook = (req) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw createHttpError(500, "Razorpay webhook secret not configured");
  }

  const signature = getSignature(req);
  if (!signature) {
    throw createHttpError(400, "Missing Razorpay signature");
  }

  const rawBody = req.rawBody;
  if (!rawBody) {
    throw createHttpError(400, "Missing raw body for signature");
  }

  const expected = computeSignature(secret, rawBody);
  if (!safeEqual(expected, signature)) {
    throw createHttpError(400, "Invalid webhook signature");
  }
};

export const handleRazorpayEvent = async (eventPayload) => {
  const { event, payload } = eventPayload || {};

  const paymentEntity = payload?.payment?.entity;
  const orderEntity = payload?.order?.entity;

  const razorpayOrderId =
    paymentEntity?.order_id || orderEntity?.id || null;
  const razorpayPaymentId = paymentEntity?.id || null;

  if (!razorpayOrderId) {
    throw createHttpError(400, "Order id missing in webhook payload");
  }

  const order = await Order.findOne({ razorpayOrderId });
  if (!order) {
    throw createHttpError(404, "Order not found");
  }

  if (event === "payment.captured" || event === "order.paid") {
    if (razorpayPaymentId) {
      order.razorpayPaymentId = razorpayPaymentId;
      await order.save();
    }
    await updateOrderStatus({ orderId: order._id, status: "PAID" });
    return { handled: true };
  }

  if (event === "payment.failed") {
    if (razorpayPaymentId) {
      order.razorpayPaymentId = razorpayPaymentId;
      await order.save();
    }
    if (order.status !== "DELIVERED") {
      await updateOrderStatus({
        orderId: order._id,
        status: "CANCELLED",
      });
    }
    return { handled: true };
  }

  return { handled: false };
};
