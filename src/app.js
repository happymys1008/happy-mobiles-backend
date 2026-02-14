import dotenv from "dotenv";
dotenv.config();

console.log("CLOUDINARY:", process.env.CLOUDINARY_CLOUD_NAME);

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

/* ================= ROUTES ================= */
import authRoutes from "./routes/auth.routes.js";
import testRoutes from "./routes/test.routes.js";
import productRoutes from "./routes/product.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import orderRoutes from "./routes/order.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import userRoutes from "./routes/user.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import brandRoutes from "./routes/brand.routes.js";
import productAttributeRoutes from "./routes/productAttribute.routes.js";
import purchaseRoutes from "./routes/purchase.routes.js";
import shopRoutes from "./routes/shop.routes.js";
import variantRoutes from "./routes/variant.routes.js";
import homeSectionRoutes from "./routes/homeSection.routes.js";
import homeBannerRoutes from "./routes/homeBanner.routes.js";
import subCategoryRoutes from "./routes/subCategory.routes.js";
import childCategoryRoutes from "./routes/childCategory.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import supplierRoutes from "./routes/supplier.routes.js";
import seoRoutes from "./routes/seo.routes.js";   // ✅ ADD THIS
import reviewRoutes from "./routes/review.routes.js";   // ✅ ADD THIS
import imagekitRoutes from "./routes/imagekit.routes.js";   // ✅ ADD THIS
import profileSchemaRoutes from "./routes/profileSchema.routes.js";
import addressRoutes from "./routes/address.routes.js";
import adminRoutes from "./routes/admin.routes.js";






/* ✅ STEP-1 NEW (SAFE) */
import appRoutes from "./routes/app.routes.js";

import errorHandler from "./middlewares/error.middleware.js";


const app = express();

/* ================= RATE LIMIT ================= */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

/* ================= MIDDLEWARE ================= */
app.use(helmet());
app.use(morgan("combined"));


app.use(
  cors({
    origin: true,        // 🔥 Allow dynamic origin
    credentials: true
  })
);



app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());


// ✅ SEO ROUTES (Sitemap + Robots)
app.use("/", seoRoutes);

/* ================= FIXED ROUTE ORDER ================= */

// ✅ MOST SPECIFIC FIRST
app.use("/api/shop", shopRoutes);
app.use("/api/home-sections", homeSectionRoutes);
app.use("/api/home-banners", homeBannerRoutes);
app.use("/api/sub-categories", subCategoryRoutes);
app.use("/api/child-categories", childCategoryRoutes);

// ✅ APP BOOTSTRAP (STEP-1 SINGLE SOURCE)
app.use("/api/app", appRoutes);

// ✅ NORMAL ROUTES
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/test", testRoutes);
app.use("/api/products", productRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/product-attributes", productAttributeRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/reviews", reviewRoutes);   // ✅ ADD THIS


app.use("/api/imagekit", imagekitRoutes);   // ✅ IMAGEKIT ROUTE
app.use("/api/profile-schema", profileSchemaRoutes);
app.use("/api/addresses", addressRoutes);





// ❌ GENERIC ROUTES ALWAYS LAST
app.use("/api", categoryRoutes);



/* ================= HEALTH ================= */
app.get("/", (req, res) => {
  res.send("API running...");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ================= ERROR ================= */
app.use(errorHandler);

export default app;
