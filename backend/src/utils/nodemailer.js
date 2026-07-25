const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async ({to,subject,html})=>{
    console.log("Email service stared.")
    const transporter = nodemailer.createTransport({
        service : "gmail",
        auth : {
            user : process.env.EMAIL,
            pass : process.env.PASSWORD
        }
    });

    await transporter.sendMail({
        from : `"NexusChat" <${process.env.EMAIL}>`,
        to,
        subject,
        html,
    });
}
console.log("Email status:  ",sendEmail);

module.exports = sendEmail;