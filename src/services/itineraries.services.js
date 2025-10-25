const Itinerary = require('../models/Itinerary');
const { client } = require('../config/redisClient');
const { sendEmail } = require('../config/email');
const AppError = require('../common/AppError');
const mongoose = require('mongoose');

exports.createItinerary = async (user, data) => {
  const itinerary = await Itinerary.create({ ...data, userId: user._id });

  // Send notification email (non-blocking)
  if (user?.email) {
    sendEmail({
      to: user.email,
      subject: `New Itinerary Created: ${itinerary.title}`,
      html: `<h2>Hello ${user.name || ''}</h2>
             <p>Your itinerary for <strong>${itinerary.destination}</strong> has been created.</p>
             <p><a href="${process.env.SHARE_BASE_URL}/${itinerary.shareableId}">Shareable Link</a></p>`,
    }).catch((err) => console.error('Email Error:', err));
  }

  return itinerary;
};

exports.getItineraries = async (user, { page = 1, limit = 10, destination, sort }) => {
  const query = {};
  if (destination) query.destination = new RegExp(destination, 'i');
  if (user?._id) query.userId = user._id;

  const skip = (page - 1) * limit;

  const sortBy = {};
  if (sort) {
    const [field, order = 'desc'] = sort.split(':');
    sortBy[field] = order === 'desc' ? -1 : 1;
  } else {
    sortBy.createdAt = -1;
  }

  const [items, total] = await Promise.all([
    Itinerary.find(query).sort(sortBy).skip(Number(skip)).limit(Number(limit)),
    Itinerary.countDocuments(query),
  ]);

  return { page: Number(page), limit: Number(limit), total, items };
};

exports.getItinerary = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid itinerary ID', 'ValidationError');
  }

  const itinerary = await Itinerary.findById(id).lean();

  if (!itinerary) {
    throw new AppError('Itinerary not found', 'NotFound');
  }
  try {
    await client.setEx(`itinerary:${id}`, 300, JSON.stringify(itinerary));
  } catch (err) {
    console.error('Redis Cache Error:', err);
  }
  return itinerary;
};

exports.updateItinerary = async (id, data) => {
  const updated = await Itinerary.findByIdAndUpdate(id, data, { new: true });
  if (updated) {
    try {
      await client.del(`itinerary:${id}`);
    } catch (err) {
      console.error('Redis Delete Error:', err);
    }
  }
  return updated;
};

exports.deleteItinerary = async (id) => {
  const removed = await Itinerary.findByIdAndDelete(id);
  if (removed) {
    try {
      await client.del(`itinerary:${id}`);
    } catch (err) {
      console.error('Redis Delete Error:', err);
    }
  }
  return removed;
};

exports.getSharedItinerary = async (shareableId) => {
  const itinerary = await Itinerary.findOne({ shareableId }).lean();
  if (!itinerary) throw new AppError('Itinerary not found', 'NotFound');
  const { userId, __v, ...publicIt } = itinerary;
  return publicIt;
};
