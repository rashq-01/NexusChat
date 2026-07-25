const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async ({ to, subject, html }) => {
    try {
        console.log("Starting email...");

        console.log("EMAIL:", process.env.EMAIL);
        console.log("PASSWORD EXISTS:", !!process.env.PASSWORD);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });

        const info = await transporter.sendMail({
            from: `"NexusChat" <${process.env.EMAIL}>`,
            to,
            subject,
            html,
        });

        console.log("Mail sent:", info.messageId);
    } catch (err) {
        console.error("MAIL ERROR:");
        console.error(err);
        throw err;
    }
};

module.exports = sendEmail;