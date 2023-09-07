const nodemailer = require("nodemailer");
const email = process.env.SMTP_EMAIL;
const password = process.env.SMTP_PASSWORD;

const transporter = nodemailer.createTransport({
  host: "smtp.elasticemail.com",
  port: 2525,
  secure: false, // Use SSL/TLS
  auth: {
    user: email,
    pass: password,
  },
});

const sendEmail = async (content, receiverEmail) => {
  const mailOptions = {
    from: email,
    to: receiverEmail,
    subject: "Password Reset Request",
    text: `Click the following link to reset your password: ${content}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return true;
  } catch (error) {
    console.error("Error sending email: ", error);
    return false;
  }
};

module.exports = sendEmail;
