const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoice = async (order) => {
  return new Promise((resolve, reject) => {
    const invoicePath = path.join(__dirname, `../invoices/invoice_${order._id}.pdf`);
    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream(invoicePath));

    doc.fontSize(20).text("Invoice", { align: "center" });
    doc.text(`Order ID: ${order._id}`);
    doc.text(`Total: ₹${order.total.toFixed(2)}`);
    doc.text(`Payment Method: ${order.paymentMethod}`);
    doc.text("Items:");
    order.items.forEach((item) => doc.text(`${item.name} - ₹${item.price} x ${item.qty}`));

    doc.end();
    resolve(invoicePath);
  });
};

module.exports = generateInvoice;
