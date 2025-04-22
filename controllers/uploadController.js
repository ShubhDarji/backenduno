export const uploadSingleImage = (req, res) => {
    console.log("Received request:", req.body);
    console.log("Received File:", req.file);

    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    res.json({
        message: "Image uploaded successfully",
        imageUrl: `/uploads/${req.file.filename}`,
    });
};

export const uploadMultipleImages = (req, res) => {
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("Files:", req.files);

    if (!req.files || !req.files.primaryImage) {
        return res.status(400).json({ message: "Primary image is required" });
    }

    const primaryImage = `/uploads/${req.files.primaryImage[0].filename}`;
    const secondaryImages = req.files.secondaryImages?.map(file => `/uploads/${file.filename}`) || [];

    res.json({
        message: "Product images uploaded successfully",
        primaryImage,
        secondaryImages,
    });
};
