require("dotenv").config();

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({to,subject,html})=>{
  const { data, error } = await resend.emails.send({
    from : `"NexusChat" <${process.env.EMAIL}>`,
    to,
    subject,
    html,
  });

  if(error){
    console.error(error);
    throw new Error(error.message);
  }
  console.log("Mail sent : ",data);
};

module.exports = sendEmail

