const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log("Before sendMail");

    const info = await transporter.sendMail({
      from: `"NexusChat" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("After sendMail");
    console.log(info);
  } catch (err) {
    console.error("ERROR:");
    console.error(err);
  }
};

module.exports = sendEmail;
