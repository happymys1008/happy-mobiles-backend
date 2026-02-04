import {
  handleRazorpayEvent,
  verifyRazorpayWebhook,
} from "../services/webhook.service.js";

export const razorpayWebhookController = async (req, res, next) => {
  try {
    verifyRazorpayWebhook(req);
    const result = await handleRazorpayEvent(req.body);
    res.json({ ok: true, handled: result.handled });
  } catch (err) {
    next(err);
  }
};
