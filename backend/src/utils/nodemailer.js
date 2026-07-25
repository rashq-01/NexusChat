const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
    logger: true,
    debug: true,
  });

  transporter.on("log", console.log);

  try {
    console.log("Before verify");
    await transporter.verify();
    console.log("After verify");

    console.log("Before send");

    const info = await transporter.sendMail({
      from: `"NexusChat" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("After send");
    console.log(info);

  } catch (e) {
    console.error("FULL ERROR");
    console.error(e);
    throw e;
  }
};

module.exports = sendEmail;
