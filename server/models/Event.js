const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: String,
  date: String,
  venue: String,
  city: { type: String, default: 'Sydney' },
  description: String,
  imageUrl: String,
  sourceUrl: String,
  category: String,
  status: { type: String, enum: ['new', 'updated', 'inactive', 'imported'], default: 'new' },
  lastScraped: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema);