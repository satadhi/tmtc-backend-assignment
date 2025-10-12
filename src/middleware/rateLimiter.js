const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { client } = require('../config/redisClient');

const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => client.sendCommand(args),
  }),
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => client.sendCommand(args),
  }),
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per window
  message: 'Too many requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, apiLimiter };
