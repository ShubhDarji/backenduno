import Product from "../models/Product.js";

// ✅ Add Product (Seller Only)
export const addProduct = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const {
      productName,
      shortDesc,
      description,
      originalPrice,
      returnPolicy,
      category,
      companyName,
      price,
      stock,
    } = req.body;

    if (!productName || !shortDesc || !description || !originalPrice || !returnPolicy || !category || !companyName || !price || !stock) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const primaryImage = req.files?.primaryImage ? req.files.primaryImage[0].path : null;
    const secondaryImages = req.files?.secondaryImages ? req.files.secondaryImages.map(file => file.path) : [];

    if (!primaryImage || secondaryImages.length < 2) {
      return res.status(400).json({ message: "Primary image and at least 2 secondary images are required" });
    }

    const newProduct = new Product({
      sellerId,
      productName,
      shortDesc,
      description,
      originalPrice,
      returnPolicy,
      category,
      companyName,
      price,
      stock,
      primaryImage,
      secondaryImages,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });

  } catch (error) {
    res.status(500).json({ message: "Server error while adding product" });
  }
};

// ✅ Get All Products (Public)
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching products" });
  }
};

// ✅ Get Product by ID (Public)
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching product" });
  }
};

// ✅ Update Product (Seller Only)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller._id;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.sellerId.toString() !== sellerId.toString()) {
      return res.status(403).json({ message: "Unauthorized: You can only update your own products" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });

  } catch (error) {
    res.status(500).json({ message: "Server error while updating product" });
  }
};

// ✅ Delete Product (Seller Only)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller._id;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.sellerId.toString() !== sellerId.toString()) {
      return res.status(403).json({ message: "Unauthorized: You can only delete your own products" });
    }

    await product.deleteOne();
    res.status(200).json({ message: "Product deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error while deleting product" });
  }
};
