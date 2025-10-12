const Itinerary = require('../models/Itinerary');
const { client } = require('../config/redisClient');
const { sendEmail } = require('../config/email');
exports.createItinerary = async (req, res) => {
  try {
    const data = { ...req.body, userId: req.user._id };
    const it = await Itinerary.create(data);
    if (req.user && req.user.email) {
      sendEmail({
        to: req.user.email,
        subject: `New Itinerary Created: ${it.title}`,
        html: `<h2>Hello ${req.user.name || ''}</h2><p>Your itinerary for <strong>${it.destination}</strong> has been created.</p><p><a href="${process.env.SHARE_BASE_URL}/${it.shareableId}">Shareable Link</a></p>`,
      }).catch((err) => console.error(err));
    }
    res.status(201).json(it);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getItineraries = async (req, res) => {
  try {
    const { page = 1, limit = 10, destination, sort } = req.query;
    const q = {};
    if (destination) q.destination = new RegExp(destination, 'i');
    q.userId = req.user ? req.user._id : undefined;
    if (!q.userId) delete q.userId;
    const skip = (page - 1) * limit;
    const sortBy = {};
    if (sort) {
      const [field, order = 'asc'] = sort.split(':');
      sortBy[field] = order === 'desc' ? -1 : 1;
    } else {
      sortBy.createdAt = -1;
    }
    const [items, total] = await Promise.all([
      Itinerary.find(q).sort(sortBy).skip(Number(skip)).limit(Number(limit)),
      Itinerary.countDocuments(q),
    ]);
    res.json({ page: Number(page), limit: Number(limit), total, items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getItinerary = async (req, res) => {
  try {
    const id = req.params.id;
    const it = await Itinerary.findById(id).lean();
    if (!it) return res.status(404).json({ message: 'Not found' });
    try {
      await client.setEx(`itinerary:${id}`, 300, JSON.stringify(it));
    } catch (e) {}
    res.json(it);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.updateItinerary = async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await Itinerary.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    try {
      await client.del(`itinerary:${id}`);
    } catch (e) {}
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.deleteItinerary = async (req, res) => {
  try {
    const id = req.params.id;
    const removed = await Itinerary.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ message: 'Not found' });
    try {
      await client.del(`itinerary:${id}`);
    } catch (e) {}
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getSharedItinerary = async (req, res) => {
  try {
    const shareableId = req.params.shareableId;
    const it = await Itinerary.findOne({ shareableId }).lean();
    if (!it) return res.status(404).json({ message: 'Not found' });
    const { userId, __v, ...publicIt } = it;
    res.json(publicIt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
