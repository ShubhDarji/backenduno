import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js"; // ✅ Fixed import
import uploadRoutes from "./routes/uploadRoutes.js"; // ✅ Fixed import
import path from "path";

dotenv.config(); // ✅ Ensure dotenv loads environment variables

connectDB(); // ✅ Connect to MongoDB

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Register API Routes
app.use("/api/seller", sellerRoutes);
app.use("/api/upload", uploadRoutes); 
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes); // ✅ Fixed Products API
app.use("/uploads", express.static(path.resolve("uploads")));
app.use("/api", uploadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
