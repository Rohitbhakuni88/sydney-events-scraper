const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');
const Event = require('./models/Event');
const scrapeEvents = require('./scraper');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// OAuth Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 1. Get All Events (with filters) [cite: 50]
app.get('/api/events', async (req, res) => {
  const { city, status } = req.query;
  let query = {};
  if (city) query.city = new RegExp(city, 'i');
  if (status) query.status = status;
  
  const events = await Event.find(query).sort({ date: 1 });
  res.json(events);
});

// 2. Trigger Scraper Manually [cite: 8]
app.post('/api/scrape', async (req, res) => {
  try {
    await scrapeEvents();
    res.json({ message: 'Scraping completed' });
  } catch (error) {
    res.status(500).json({ error: 'Scraping failed' });
  }
});

// 3. Mark Event as Imported (Admin Action) [cite: 60]
app.put('/api/events/:id/import', async (req, res) => {
  await Event.findByIdAndUpdate(req.params.id, { status: 'imported' });
  res.json({ success: true });
});

// 4. Capture Email (Get Tickets) [cite: 40]
app.post('/api/tickets', async (req, res) => {
  // Ideally, save this to a "Leads" collection
  console.log('New Lead:', req.body); 
  res.json({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));