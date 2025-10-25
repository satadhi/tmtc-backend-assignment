const itineraryService = require('../services/itineraries.services');
const handleServiceError = require('../common/handleServiceError');

exports.createItinerary = async (req, res) => {
  try {
    const itinerary = await itineraryService.createItinerary(req.user, req.body);
    res.status(201).json(itinerary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getItineraries = async (req, res) => {
  try {
    const data = await itineraryService.getItineraries(req.user, req.query);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getItinerary = async (req, res) => {
  try {
    const itinerary = await itineraryService.getItinerary(req.params.id);
    res.json(itinerary);
  } catch (err) {
    handleServiceError(err, res);
  }
};

exports.updateItinerary = async (req, res) => {
  try {
    const updated = await itineraryService.updateItinerary(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteItinerary = async (req, res) => {
  try {
    const removed = await itineraryService.deleteItinerary(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSharedItinerary = async (req, res) => {
  try {
    const itinerary = await itineraryService.getSharedItinerary(req.params.shareableId);
    if (!itinerary) return res.status(404).json({ message: 'Not found' });
    res.json(itinerary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
