require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redisClient');
const logger = require('./config/logger');

// Override console logs to use your logger
console.log = (...args) => logger.info(args.join(' '));
console.error = (...args) => logger.error(args.join(' '));

// List of required environment variables
const REQUIRED_ENV = [
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'REDIS_URL',
  'SHARE_BASE_URL',
  'EMAIL_USER',
  'EMAIL_PASS',
  'EMAIL_FROM',
  'NODE_ENV',
  'SWAGGER_SERVER',
];

// Function to validate env vars
function validateEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error('Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }
}

validateEnv();

const PORT = process.env.PORT;

(async () => {
  try {
    // Connect to MongoDB
    await connectDB(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Connect to Redis
    await connectRedis();
    console.log('Redis connected');

    // Start Express server
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
})();
