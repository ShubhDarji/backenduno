import Product from "../models/Product.js"; // ✅ Use ES module import

// ✅ Add a New Product
export const addProduct = async (req, res) => {
    try {
        console.log("Incoming Product Data:", req.body);  // ✅ Debugging

        // Validate request body
        const { 
            productName, shortDesc, description, originalPrice, returnPolicy,
            category, companyName, price, stock, status, primaryImage, secondaryImages
        } = req.body;

        if (!productName || !shortDesc || !description || !originalPrice || !returnPolicy) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newProduct = new Product({
            productName, shortDesc, description, originalPrice, returnPolicy,
            category, companyName, price, stock, status, primaryImage, secondaryImages
        });

        await newProduct.save();
        res.status(201).json({ message: "Product added successfully", product: newProduct });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ message: "Server error while adding product" });
    }
};


// ✅ Get All Products
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while fetching products" });
    }
};

// ✅ Get a Single Product by ID
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while fetching product" });
    }
};

// ✅ Update a Product
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Server error while updating product" });
    }
};


// ✅ Delete a Product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Server error while deleting product" });
    }
};

