const handleServiceError = (err, res) => {
  switch (err.type) {
    case 'NotFound':
      return res.status(404).json({ success: false, message: err.message });
    case 'ValidationError':
      return res.status(400).json({ success: false, message: err.message });
    default:
      console.error('Unhandled Error:', err);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = handleServiceError;
