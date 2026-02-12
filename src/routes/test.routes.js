import express from "express";
import auth from "../middlewares/auth.middleware.js";
import role from "../middlewares/role.middleware.js"; // ✅ FIXED

const router = express.Router();

/* =========================================================
   ADMIN TEST ROUTE
========================================================= */
router.get("/admin", auth, role("admin"), (req, res) => {
  res.json({
    message: "🔥 Admin route working",
    user: req.user,
  });
});

export default router;
