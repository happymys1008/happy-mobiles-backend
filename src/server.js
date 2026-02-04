import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import mongoose from "mongoose";

dotenv.config();

const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI not found in environment variables");
}

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