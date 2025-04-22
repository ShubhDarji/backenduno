import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import multer from "multer";
import { EventEmitter } from "events";
import path from "path";
import { fileURLToPath } from "url";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import sellerAuthRoutes from "./routes/sellerAuthRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import sellerOrderRoutes from "./routes/sellerOrders.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import promoRoutes from "./routes/promoRoutes.js";

// Middleware
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import connectDB from "./config/db.js";

// Path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables and connect DB
dotenv.config();
connectDB();

// Increase default max event listeners
EventEmitter.defaultMaxListeners = 15;

const app = express();

//////////////////////////////////////////////////
// ✅ CORS SETUP
//////////////////////////////////////////////////
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.CLIENT_URL || "http://localhost:3000",
        "https://shubh.poojahost.net",
        "http://localhost:3001",
        "http://localhost:3002",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//////////////////////////////////////////////////
// ✅ MIDDLEWARE
//////////////////////////////////////////////////
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//////////////////////////////////////////////////
// ✅ STATIC FILES
//////////////////////////////////////////////////
const uploadsPath = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsPath));

//////////////////////////////////////////////////
// ✅ API ROUTES
//////////////////////////////////////////////////
app.use("/api/auth", authRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/auth/seller", sellerAuthRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/ordersseller", sellerOrderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/promotions", promoRoutes); // ✅ Promo video route

//////////////////////////////////////////////////
// ✅ ERROR HANDLING
//////////////////////////////////////////////////
app.use(notFound);
app.use(errorHandler);

// ✅ Multer-specific error handling
app.use((err, req, res, next) => {
  console.error("Error:", err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: "File upload error",
      error: err.message,
    });
  }
  res.status(500).json({
    message: "Internal server error",
    error: err.message,
  });
});

//////////////////////////////////////////////////
// ✅ START SERVER
//////////////////////////////////////////////////
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${server.address().port}`)
);
