import nodemailer from "nodemailer";

//* Create transporter to send email
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

//* Function to send emails
const sendEmail = async ({ to, subject, body }) => {
  // Email Response to send
  const response = await transporter.sendMail({
    from: process.env.SENDER_EMAIL,
    to,
    subject,
    html: body,
  });

  return response;
};

export default sendEmail;
