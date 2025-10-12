const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const ActivitySchema = new mongoose.Schema(
  { time: String, description: String, location: String },
  { _id: false }
);
const ItinerarySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    title: { type: String, required: true, index: true },
    destination: { type: String, index: true, required: true },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true },
    activities: [ActivitySchema],
    shareableId: { type: String, unique: true, default: () => randomUUID() },
  },
  { timestamps: true }
);
ItinerarySchema.index({ userId: 1, createdAt: -1 });
module.exports = mongoose.model('Itinerary', ItinerarySchema);
