const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../config/email');

const signToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already used' });
    const user = await User.create({ email, password, name });
    const token = signToken(user);

    // send welcome or verification email
    const subject = 'Welcome to Our App!';
    const html = `
      <div style="font-family: Arial, sans-serif;">
        <h2>Hi ${name || 'there'},</h2>
        <p> Welcome to <strong>Our App</strong>!</p>
        <p>Your account has been created successfully.</p>
        <p>You can now log in and start exploring.</p>
        <br />
        <p style="font-size: 0.9em; color: #666;">If you did not sign up, please ignore this email.</p>
      </div>
    `;

    // don’t block response
    sendEmail({ to: email, subject, html })
      .then(() => console.log('Welcome email sent to', email))
      .catch((err) => console.error('Failed to send email:', err.message));

    res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken(user);
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
