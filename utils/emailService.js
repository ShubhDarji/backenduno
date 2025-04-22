// utils/sendEmail.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendLowStockEmail = async (sellerEmail, product, sellerBusinessName = "Seller") => {
  try {
    const mailOptions = {
      from: `"${sellerBusinessName}" <${process.env.SMTP_EMAIL}>`,
      to: sellerEmail,
      subject: `Low Stock Alert: "${product.productName}"`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #d9534f;">Only 1 item left in stock!</h2>
          <p>Hello,</p>
          <p><strong>${product.productName}</strong> has only <strong>1 unit</strong> remaining in your store inventory.</p>
          <ul>
            <li><strong>Category:</strong> ${product.category || "N/A"}</li>
            <li><strong>Price:</strong> ₹${product.price?.toFixed(2) || "0.00"}</li>
            <li><strong>Description:</strong> ${product.shortDesc || "No description provided."}</li>
          </ul>
          ${
            product.primaryImage
              ? `<img src="${process.env.SERVER_URL || 'http://localhost:5000'}/uploads/${product.primaryImage}" alt="${product.productName}" style="width:300px; border: 1px solid #ccc;"/>`
              : ""
          }
          <p style="margin-top: 20px;">Please restock this item soon to avoid losing potential sales.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending low stock email:", error.message);
  }
};