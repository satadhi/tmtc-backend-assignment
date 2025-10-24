const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: false, // Use TLS, not SSL
  tls: {
    rejectUnauthorized: false, // optional: helps if container lacks CA certs
  },
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});
async function sendEmail({ to, subject, html }) {
  console.log(JSON.stringify({ user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }));
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Dont send Mail when testing');
      return {};
    }
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
  } catch (err) {
    console.error('Email failed', err);
  }
}
module.exports = { sendEmail };
