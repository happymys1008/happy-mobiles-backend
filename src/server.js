import "dotenv/config"; 
import app from "./app.js";
import connectDB from "./config/db.js";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";   // ✅ ADD THIS


const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI not found in environment variables");
}

/* ================= CORS FIX FOR LIVE + LOCAL ================= */
/* ================= PROFESSIONAL CORS ================= */

app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:3000",      // storefront local
  "http://localhost:3001",      // admin local
  "https://varaii.com",
  "https://www.varaii.com",
  "https://api.varaii.com",
  "https://admin.varaii.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed for: " + origin));
      }
    },
    credentials: true
  })
);

app.use(cookieParser());


/* ============================================================ */

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    const shutdown = async (signal) => {
      console.log(`🛑 ${signal} received. Shutting down...`);
      try {
        await mongoose.connection.close(false);
      } catch (err) {
        console.error("❌ Error closing MongoDB:", err.message);
      }
      server.close(() => process.exit(0));
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("❌ Startup Error:", err.message);
    process.exit(1);
  }
};

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
  process.exit(1);
});

startServer();