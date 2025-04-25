import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();
// Gmail transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Gmail address
    pass: process.env.EMAIL_PASS, // App Password
  },
});

/**
 * Wraps your HTML content in a styled email layout
 * @param {string} subject - Subject for the title
 * @param {string} content - The core email content (HTML string)
 */
const wrapEmailTemplate = (subject, content) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      <div style="background-color:rgb(0, 0, 0); color: white; padding: 20px 30px;">
        <h2 style="margin: 0;">${subject}</h2>
      </div>
      <div style="padding: 30px; font-size: 16px; line-height: 1.6; color: #333;">
        ${content}
      </div>
      <div style="background-color: #f9f9f9; padding: 20px 30px; font-size: 13px; color: #777; text-align: center;">
        &copy; ${new Date().getFullYear()} Etek Online Shopping. All rights reserved.
      </div>
    </div>
  </div>
`;

/**
 * Sends an email using Gmail via Nodemailer
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Subject line of the email
 * @param {string} options.html - Raw HTML content (without header/footer)
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const finalHtml = wrapEmailTemplate(subject, html);

    const info = await transporter.sendMail({
      from: `"Etek Online Shopping" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: finalHtml,
    });

    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`SMTP Response: ${info.response}`);
  } catch (error) {
    console.error("❌ Failed to send email:");
    console.error("Error Message:", error.message);
    if (error.response) {
      console.error("SMTP Response:", error.response);
    }
    throw error;
  }
};

export default sendEmail;