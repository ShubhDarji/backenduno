import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';

// Setup __dirname in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory to store invoices
const invoicesDir = path.join(__dirname, '../invoices');
if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir, { recursive: true });
}

// Function to generate invoice PDF
export const generateInvoice = (order, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });

      const invoicePath = path.join(invoicesDir, `invoice-${order._id}.pdf`);
      const stream = fs.createWriteStream(invoicePath);
      doc.pipe(stream);

      // Header
      doc
        .fontSize(20)
        .text('Etek - Invoice', { align: 'center' })
        .moveDown();

      // Customer Info
      doc
        .fontSize(12)
        .text(`Invoice ID: ${order._id}`)
        .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`)
        .moveDown()
        .text(`Customer: ${user.name}`)
        .text(`Email: ${user.email}`)
        .text(`Phone: ${order.phoneNumber}`)
        .text(`Shipping Address: ${order.address}`)
        .moveDown();

      // Product Table Header
      doc
        .fontSize(13)
        .text('Items', { underline: true })
        .moveDown(0.5);

      // Table Rows
      order.items.forEach((item, index) => {
        doc
          .fontSize(12)
          .text(
            `${index + 1}. ${item.productName} - Qty: ${item.qty} - ₹${
              item.price * item.qty
            }`
          );
      });

      doc
        .moveDown()
        .fontSize(13)
        .text(`Total Amount: ₹${order.totalAmount}`, { bold: true });

      doc.moveDown().text('Thank you for shopping with Etek!');

      doc.end();

      stream.on('finish', () => {
        resolve(invoicePath); // Return the path to attach in email
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};
