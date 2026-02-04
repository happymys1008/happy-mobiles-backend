import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import testRoutes from "./routes/test.routes.js";
import productRoutes from "./routes/product.routes.js"; // ✅ ADD THIS
import inventoryRoutes from "./routes/inventory.routes.js";
import orderRoutes from "./routes/order.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import userRoutes from "./routes/user.routes.js";
import errorHandler from "./middlewares/error.middleware.js";

const app = express();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(morgan("combined"));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes); 
app.use("/api/test", testRoutes);
app.use("/api/products", productRoutes); // ✅ ADD THIS
app.use("/api/inventory", inventoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/webhooks", webhookRoutes);

app.get("/", (req, res) => {
  res.send("API running...");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);

export default app;
