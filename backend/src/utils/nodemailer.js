const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log("Starting email...");
    console.log("EMAIL:", process.env.EMAIL);
    console.log("PASSWORD EXISTS:", !!process.env.PASSWORD);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    console.log("Verifying SMTP...");
    await transporter.verify();
    console.log("SMTP Verified");

    const info = await transporter.sendMail({
      from: `"NexusChat" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("Mail sent:", info.messageId);
    return info;

  } catch (err) {
    console.error("MAIL ERROR:");
    console.error(err);
    throw err;
  }
};

module.exports = sendEmail;