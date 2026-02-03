const puppeteer = require('puppeteer');
const Event = require('./models/Event');

const scrapeEvents = async () => {
  console.log('Starting scraper...');
  // 1. Launch browser in "Headless: false" mode so you can SEE what happens
  const browser = await puppeteer.launch({ headless: false }); 
  const page = await browser.newPage();
  
  // 2. Go to a reliable URL (Sydney.com Events)
  await page.goto('https://www.sydney.com/events', { waitUntil: 'networkidle2' });

  const events = await page.evaluate(() => {
    // 3. Find all cards (Try generic class names often used for grids)
    // We look for items that look like cards
    const cards = Array.from(document.querySelectorAll('.item-list-item, article, .card')); 
    
    return cards.map(card => {
      // 4. ROBUST SELECTORS: Try multiple things until one works
      
      // TITLE: Look for an H3, or H2, or a link with text
      const titleEl = card.querySelector('h3') || card.querySelector('h2') || card.querySelector('.title');
      
      // DATE: Look for a time tag, or specific date classes, or just the first paragraph
      const dateEl = card.querySelector('time') || card.querySelector('.date') || card.querySelector('p');

      // IMAGE: Look for the first image
      const imgEl = card.querySelector('img');

      // LINK: Look for the first link
      const linkEl = card.querySelector('a');

      return {
        title: titleEl ? titleEl.innerText.trim() : 'Title Not Found',
        date: dateEl ? dateEl.innerText.trim() : 'Date TBA',
        venue: 'Sydney, Australia',
        imageUrl: imgEl ? imgEl.src : '',
        sourceUrl: linkEl ? linkEl.href : '',
        city: 'Sydney',
        status: 'new'
      };
    });
  });

  console.log("Scraped Data Check:", events.slice(0, 3)); // See the first 3 results in your terminal

  await browser.close();

  // Save to DB
  for (const eventData of events) {
    // Only save if we actually found a title
    if (eventData.title !== 'Title Not Found') {
      const existing = await Event.findOne({ sourceUrl: eventData.sourceUrl });
      if (!existing) {
        await Event.create({ ...eventData, status: 'new' });
      }
    }
  }
  console.log(`Scraped ${events.length} events.`);
};

module.exports = scrapeEvents;