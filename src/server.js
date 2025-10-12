require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redisClient');
const logger = require('./config/logger');

console.log = (...args) => logger.info(args.join(' '));
console.error = (...args) => logger.error(args.join(' '));

const PORT = process.env.PORT || 4000;
(async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    await connectRedis();
    app.listen(PORT, () => console.log(`Server up on port ${PORT}`));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
