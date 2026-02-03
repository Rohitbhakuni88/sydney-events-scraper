const puppeteer = require('puppeteer');
const Event = require('./models/Event');

const scrapeEvents = async () => {
  console.log('Starting scraper...');
  const browser = await puppeteer.launch({ 
    headless: false, 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  
  // Pretend to be a real user
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    await page.goto('https://www.sydney.com/events', { waitUntil: 'domcontentloaded' });

    // 1. Scrape the raw data
    const scrapedEvents = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.item-list-item, article, .card')); 
      return cards.map(card => {
        const titleEl = card.querySelector('h3') || card.querySelector('h2') || card.querySelector('.title');
        const dateEl = card.querySelector('time') || card.querySelector('.date') || card.querySelector('p');
        const imgEl = card.querySelector('img');
        const linkEl = card.querySelector('a');

        return {
          title: titleEl ? titleEl.innerText.trim() : null,
          date: dateEl ? dateEl.innerText.trim() : 'Date TBA',
          venue: 'Sydney, Australia',
          imageUrl: imgEl ? imgEl.src : '',
          sourceUrl: linkEl ? linkEl.href : '',
          description: 'Automatically scraped event.',
          city: 'Sydney'
        };
      }).filter(e => e.title && e.sourceUrl); // Filter out empty garbage
    });

    console.log(`Found ${scrapedEvents.length} events on page.`);

    // List of URLs seen in THIS scrape
    const scrapedUrls = scrapedEvents.map(e => e.sourceUrl);

    // 2. Process each event (New vs Updated)
    for (const eventData of scrapedEvents) {
      const existing = await Event.findOne({ sourceUrl: eventData.sourceUrl });

      if (!existing) {
        // CASE A: NEW EVENT
        console.log(`[NEW] ${eventData.title}`);
        await Event.create({ ...eventData, status: 'new' });
      } else {
        // CASE B: CHECK FOR UPDATES
        // Compare key fields to see if anything changed
        const hasChanged = (
          existing.title !== eventData.title ||
          existing.date !== eventData.date ||
          existing.venue !== eventData.venue
        );

        if (hasChanged) {
          console.log(`[UPDATED] ${eventData.title}`);
          await Event.updateOne(
            { _id: existing._id }, 
            { ...eventData, status: 'updated', lastScraped: new Date() }
          );
        } else {
          // No change, just update the timestamp so we know it's still alive
          await Event.updateOne(
            { _id: existing._id }, 
            { lastScraped: new Date() }
          );
        }
      }
    }

    // 3. Detect Inactive Events
    // Find events in DB that were NOT in the list we just scraped
    const result = await Event.updateMany(
      { 
        sourceUrl: { $nin: scrapedUrls }, // URL is NOT in the new list
        status: { $ne: 'inactive' }       // And it wasn't already inactive
      },
      { 
        $set: { status: 'inactive' } 
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`[INACTIVE] Marked ${result.modifiedCount} old events as inactive.`);
    }

  } catch (error) {
    console.error("Scraping Error:", error);
  } finally {
    await browser.close();
  }
};

module.exports = scrapeEvents;