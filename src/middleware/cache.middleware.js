const { client } = require('../config/redisClient');
const cacheItinerary = async (req, res, next) => {
  const id = req.params.id;
  if (!id) return next();
  try {
    const data = await client.get(`itinerary:${id}`);
    if (!data) return next();
    const parsed = JSON.parse(data);
    return res.json(parsed);
  } catch (err) {
    return next();
  }
};
module.exports = { cacheItinerary };
