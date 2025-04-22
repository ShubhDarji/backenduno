// backend/utils/sendLowStockEmail.js
import nodemailer from "nodemailer";

const sendLowStockEmail = async (sellerEmail, product) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: sellerEmail,
      subject: "Low Stock Alert",
      html: `
        <h3>Only 1 unit left in stock!</h3>
        <p><strong>Product:</strong> ${product.productName}</p>
        <p><strong>Category:</strong> ${product.category}</p>
        <p><strong>Company:</strong> ${product.companyName}</p>
        <p><strong>Price:</strong> ₹${product.price}</p>
        <p><strong>Description:</strong> ${product.description}</p>
        <img src="${product.primaryImage}" alt="Product Image" style="max-width:300px;" />
        ${product.secondaryImages.map(img => `<img src="${img}" style="max-width:100px; margin-right:10px;" />`).join("")}
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Low stock email sent successfully");
  } catch (error) {
    console.error("Error sending low stock email:", error.message);
  }
};

export default sendLowStockEmail;