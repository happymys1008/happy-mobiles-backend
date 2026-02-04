import {
  loginCustomer,
  loginUser,
  registerAdmin,
  registerCustomer,
} from "../services/auth.service.js";

/* ================= ADMIN ================= */

export const register = async (req, res, next) => {
  try {
    const { name, mobile, password } = req.body;
    await registerAdmin({ name, mobile, password });
    res.json({ message: "Admin created" });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { mobile, password } = req.body;
    const payload = await loginUser({ mobile, password });
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

/* ================= CUSTOMER SMART AUTH ================= */

export const customerAuthController = async (req, res, next) => {
  try {
    const { name, mobile, password } = req.body;

    try {
      // 🔁 Try login first (existing user)
      const payload = await loginCustomer({ mobile, password });
      return res.json({
        ...payload,
        isNewUser: false,
      });
    } catch (loginErr) {
      // 👇 If not found → auto register
      await registerCustomer({ name, mobile, password });

      const payload = await loginCustomer({ mobile, password });

      return res.json({
        ...payload,
        isNewUser: true,
      });
    }
  } catch (err) {
    next(err);
  }
};