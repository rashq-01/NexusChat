const axios = require("axios");

const sendEmail = async ({ to, subject, html }) => {
  try {

    // 👇 YAHAN ADD KARO
    console.log("EMAIL:", process.env.EMAIL);
    console.log("BREVO_API_KEY exists:", !!process.env.BREVO_API_KEY);
    console.log("Key prefix:", process.env.BREVO_API_KEY?.substring(0, 8));

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "NexusChat",
          email: process.env.EMAIL,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Mail sent:", response.data);

  } catch (err) {
    console.error(err.response?.data || err.message);
    throw err;
  }
};

module.exports = sendEmail;