const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});
async function sendEmail({ to, subject, html }) {
  try {
    if ((process.env.NODE_ENV = 'development')) {
      console.log('Dont send Mail when testing');
      return {};
    }
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
  } catch (err) {
    console.error('Email failed', err);
  }
}
module.exports = { sendEmail };
