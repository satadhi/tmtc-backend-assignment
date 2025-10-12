const { createClient } = require('redis');
const client = createClient({ url: process.env.REDIS_URL });
client.on('error', (err) => console.error('Redis Client Error', err));
async function connectRedis() {
  if (!client.isOpen) await client.connect();
  console.log('Redis connected');
}
module.exports = { client, connectRedis };
