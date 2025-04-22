import sendEmail from "./sendEmail.js";

const sendLowStockEmail = async (email, product, stock) => {
  const subject = `Stock Alert: Action Required for ${product.productName}`;
  let message = "";

  if (stock === 3) {
    message = `
      <p style="font-size: 16px; color: #333;">
        Your product <strong>${product.productName}</strong> has only <strong>3 units</strong> left in stock.
        While it's still available, now would be a great time to consider restocking to maintain consistent sales momentum.
      </p>
    `;
  } else if (stock === 1) {
    message = `
      <p style="font-size: 16px; color: #333;">
        Attention! Only <strong>1 unit</strong> remaining for <strong>${product.productName}</strong>.
        Your customers might miss out if it sells out. Plan a quick restock to avoid missed opportunities.
      </p>
    `;
  } else if (stock === 0) {
    message = `
      <p style="font-size: 16px; color: #d32f2f;">
        Urgent Notification: <strong>${product.productName}</strong> is now <strong>completely out of stock</strong>!
        This product is no longer available to buyers and has been marked as <strong>Inactive</strong> in your inventory.
        Please restock soon to keep it live on the platform.
      </p>
    `;
  }

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 12px rgba(0,0,0,0.05);">
      
      <h2 style="text-align: center; color: #1976d2;">Low Stock Alert</h2>

      ${message}

      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

      <table style="width: 100%; font-size: 15px; color: #555;">
        <tr>
          <td style="padding: 10px 0;"><strong>Product:</strong></td>
          <td>${product.productName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0;"><strong>Product ID:</strong></td>
          <td>${product._id}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0;"><strong>Current Stock:</strong></td>
          <td>${stock}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0;"><strong>Status:</strong></td>
          <td>${stock === 0 ? "<span style='color: red;'>Out of Stock</span>" : "Available"}</td>
        </tr>
      </table>

      <div style="margin-top: 30px; text-align: center;">
        <a href="https://your-dashboard-link.com" style="background-color: #43a047; color: white; text-decoration: none; padding: 12px 20px; border-radius: 5px; font-weight: 500;">Go to Inventory Dashboard</a>
      </div>

      <p style="margin-top: 35px; font-size: 13px; color: #999; text-align: center;">
        You are receiving this email because you're subscribed to stock alerts in your seller settings.<br />
        Please do not reply to this email. For help, contact support.
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
  });
};

export default sendLowStockEmail;