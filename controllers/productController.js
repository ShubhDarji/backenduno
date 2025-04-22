import Product from "../models/Product.js";
import mongoose from "mongoose";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sendEmail from "../utils/sendEmail.js";
// Path Setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../uploads");

// Ensure Uploads Directory Exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ✅ Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Corrected 5MB limit
}).fields([{ name: "primaryImage", maxCount: 1 }, { name: "secondaryImages", maxCount: 5 }]);


export const uploadProductImages = upload; // Export multer middleware

// ✅ Add Product
export const addProduct = async (req, res) => {
  try {
    const {
      productName,
      category,
      companyName,
      originalPrice,
      price,
      stock,
      shortDesc,
      description,
      specifications,
      shippingPolicy,
      returnPolicy,
    } = req.body;

    const primaryImage = req.files?.primaryImage?.[0]?.filename;
    const secondaryImages = req.files?.secondaryImages?.map((file) => file.filename);

    if (!primaryImage || !secondaryImages || secondaryImages.length < 2) {
      return res.status(400).json({ message: "Primary and at least 2 secondary images are required." });
    }

    const product = new Product({
      sellerId: req.seller.id,
      productName,
      category,
      companyName,
      originalPrice,
      price,
      stock,
      shortDesc,
      description,
      specifications,
      shippingPolicy,
      returnPolicy,
      primaryImage,
      secondaryImages,
      status: "Active",
    });

    await product.save();

    const sellerEmail = req.seller.email;

    if (sellerEmail) {
      const emailHtml = `
        <div style="font-family: 'Segoe UI', sans-serif; padding: 20px; background-color: #f8f9fa; color: #333;">
          <h2 style="color: #2a7ae4;">New Product Added Successfully</h2>
          <p>Hello,</p>
          <p>You have successfully added a new product to your shop. Here are the details:</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold;">Product Name:</td><td style="padding: 8px;">${productName}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Category:</td><td style="padding: 8px;">${category}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Company:</td><td style="padding: 8px;">${companyName}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Original Price:</td><td style="padding: 8px;">₹${originalPrice}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Selling Price:</td><td style="padding: 8px;">₹${price}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Stock:</td><td style="padding: 8px;">${stock} units</td></tr>
          </table>
          ${shortDesc ? `<p><strong>Short Description:</strong> ${shortDesc}</p>` : ""}
          ${description ? `<p><strong>Description:</strong> ${description}</p>` : ""}
          ${specifications ? `<p><strong>Specifications:</strong> ${specifications}</p>` : ""}
          ${shippingPolicy ? `<p><strong>Shipping Policy:</strong> ${shippingPolicy}</p>` : ""}
          ${returnPolicy ? `<p><strong>Return Policy:</strong> ${returnPolicy}</p>` : ""}
          <br/>
          <p style="text-align: center;">
            <img src="http://localhost:5000/uploads/${primaryImage}" alt="Product Image" style="max-width: 300px; border-radius: 8px;" />
          </p>
          <p>Thanks for using Etek Platform!</p>
        </div>
      `;

      await sendEmail({
        to: sellerEmail,
        subject: `Product Added: ${productName}`,
        html: emailHtml,
      });
    }

    res.status(201).json({ message: "Product added successfully", product });
  } catch (error) {
    console.error("Error adding product:", error.message);
    res.status(500).json({ message: "Failed to add product", error: error.message });
  }
};

// ✅ Get All Products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    console.error("🚨 Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products." });
  }
};

// ✅ Get Product by ID
export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    // ✅ Check for Static Product (ID starting with 'static-')
    if (id.startsWith("static-")) {
      return res.status(404).json({ message: "Static products are not handled on the backend." });
    }

    // ✅ Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    // ✅ Find Product
    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Delete Product
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Product ID" });
  }

  try {
    // ✅ Find the Product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ Authorization Check
    if (product.sellerId.toString() !== req.seller._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this product" });
    }

    // ✅ Delete Images from Server
    const uploadsDir = path.join(process.cwd(), "uploads");

    // Delete Primary Image
    if (product.primaryImage) {
      const primaryImagePath = path.join(uploadsDir, product.primaryImage);
      if (fs.existsSync(primaryImagePath)) {
        fs.unlinkSync(primaryImagePath);
      }
    }

    // Delete Secondary Images
    if (product.secondaryImages && product.secondaryImages.length > 0) {
      product.secondaryImages.forEach((image) => {
        const secondaryImagePath = path.join(uploadsDir, image);
        if (fs.existsSync(secondaryImagePath)) {
          fs.unlinkSync(secondaryImagePath);
        }
      });
    }

    // ✅ Delete Product from Database
    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully!" });

  } catch (error) {
    console.error("🚨 Delete Product Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Update Product

export const updateProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Product ID" });
  }

  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.sellerId.toString() !== req.seller._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to update this product" });
    }

    let primaryImage = product.primaryImage;
    let secondaryImages = product.secondaryImages;

    if (req.files?.primaryImage?.[0]) {
      const uploadedPrimaryImage = req.files.primaryImage[0].filename;
      const oldPrimaryImagePath = path.join(uploadsDir, primaryImage);
      if (primaryImage && fs.existsSync(oldPrimaryImagePath)) fs.unlinkSync(oldPrimaryImagePath);
      primaryImage = uploadedPrimaryImage;
    }

    if (req.files?.secondaryImages) {
      const uploadedSecondaryImages = req.files.secondaryImages.map((file) => file.filename);
      secondaryImages.forEach((image) => {
        const oldSecondaryImagePath = path.join(uploadsDir, image);
        if (fs.existsSync(oldSecondaryImagePath)) fs.unlinkSync(oldSecondaryImagePath);
      });
      secondaryImages = uploadedSecondaryImages;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...req.body, primaryImage, secondaryImages },
      { new: true }
    );

    // ✅ Build image URLs
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const primaryImageUrl = `${baseUrl}/uploads/${primaryImage}`;
    const secondaryImageUrls = secondaryImages.map(img => `${baseUrl}/uploads/${img}`);

    // ✅ Send email
    await sendEmail({
      to: req.seller.email, // make sure `req.seller.email` is populated
      subject: `Product Updated: ${updatedProduct.productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
          <h2 style="color: #007BFF;">Product Updated Successfully</h2>
          <p>The following product was updated:</p>

          <h3>${updatedProduct.productName}</h3>
          <p><strong>Category:</strong> ${updatedProduct.category}</p>
          <p><strong>Company:</strong> ${updatedProduct.companyName}</p>
          <p><strong>Price:</strong> $${updatedProduct.price}</p>
          <p><strong>Stock:</strong> ${updatedProduct.stock}</p>

          <img src="${primaryImageUrl}" alt="Primary" style="width: 200px; margin: 10px 0;" />

          <div>
            <p><strong>Secondary Images:</strong></p>
            ${secondaryImageUrls.map(url => `<img src="${url}" style="width:100px; margin:5px;" />`).join("")}
          </div>

          <hr />
          <p style="font-size: 0.9em; color: #999;">If you did not perform this update, please contact support.</p>
        </div>
      `,
    });

    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });

  } catch (error) {
    console.error("🚨 Update Product Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// ✅ Get Products by Seller
export const getProductsBySeller = async (req, res) => {
  try {
    const sellerId = req.sellerId || req.body.sellerId;

    if (!sellerId) {
      return res.status(401).json({ message: "Unauthorized. Seller ID is missing." });
    }

    const products = await Product.find({ sellerId });

    if (!products.length) {
      return res.status(404).json({ message: "No products found for this seller." });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("🚨 Get Products by Seller Error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const updateProductStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Product ID" });
  }

  if (!["Active", "Inactive"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ Check if the seller is authorized
    if (product.sellerId.toString() !== req.seller._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to update status" });
    }

    product.status = status;
    await product.save();

    res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Status Update Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

import Review from "../models/Review.js"; // Ensure you import Review model


// Utility function to get start of the week
const getStartOfWeek = () => {
  const now = new Date();
  const first = now.getDate() - now.getDay(); // Sunday
  return new Date(now.setDate(first));
};

// ✅ New: Fetch Big Discount, New Arrivals & Best Sales
export const getHomeProducts = async (req, res) => {
  try {
    const startOfWeek = getStartOfWeek();

    const [allProducts, allReviews] = await Promise.all([
      Product.find({ status: "Active" }).lean(),
      Review.find().lean(),
    ]);

    // Big Discount: More than 35% off
    const bigDiscount = allProducts
      .filter(p => p.originalPrice && p.price && ((p.originalPrice - p.price) / p.originalPrice) * 100 > 35)
      .sort(() => 0.5 - Math.random()) // Random
      .slice(0, 10);

    // New Arrivals: Added this week
    const newArrivals = allProducts
      .filter(p => new Date(p.createdAt) >= startOfWeek)
      .sort(() => 0.5 - Math.random())
      .slice(0, 10);

    // Best Sales: Based on rating + number of reviews
    const productReviewMap = {};
    for (const review of allReviews) {
      const pid = review.productId.toString();
      if (!productReviewMap[pid]) productReviewMap[pid] = { totalRating: 0, count: 0 };
      productReviewMap[pid].totalRating += review.rating;
      productReviewMap[pid].count += 1;
    }

    const ratedProducts = allProducts
      .map(p => {
        const r = productReviewMap[p._id.toString()] || { totalRating: 0, count: 0 };
        const avg = r.count ? r.totalRating / r.count : 0;
        return { ...p, rating: avg, reviewCount: r.count };
      })
      .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
      .slice(0, 10);

    res.status(200).json({
      bigDiscount,
      newArrivals,
      bestSales: ratedProducts,
    });
  } catch (error) {
    console.error("Error fetching home products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};