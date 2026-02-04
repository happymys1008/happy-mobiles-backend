import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/admin", auth, isAdmin, (req, res) => {
  res.json({
    message: "🔥 Admin route working",
    user: req.user
  });
});

export default router;
