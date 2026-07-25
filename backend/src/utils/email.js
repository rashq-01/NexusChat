require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // 587 uses STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"NexusChat" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent successfully");
  } catch (err) {
    console.error("Email Error:", err);
    throw err;
  }
};

module.exports = sendEmail;