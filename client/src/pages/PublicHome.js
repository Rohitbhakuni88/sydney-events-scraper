import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PublicHome.css';

const PublicHome = () => {
  const [events, setEvents] = useState([]);
  const [email, setEmail] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // UPDATED: Now pointing to your live Render Backend
      const res = await axios.get('https://sydney-events-scraper.onrender.com/api/events');
      setEvents(res.data);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  const handleTicketClick = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const submitEmail = async () => {
    if (!email) return alert('Email required');
    
    try {
      // UPDATED: Now pointing to your live Render Backend
      await axios.post('https://sydney-events-scraper.onrender.com/api/tickets', { 
        email, 
        eventId: selectedEvent._id 
      });
      window.open(selectedEvent.sourceUrl || '#', '_blank');
      setModalOpen(false);
    } catch (err) {
      alert('Error saving email');
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Sydney Events Guide</h1>
        <a href="/admin" className="admin-link">Admin Login</a>
      </header>
      
      <div className="grid">
        {events.length === 0 ? <p>No events found. Admin needs to scrape!</p> : null}
        
        {events.map(event => (
          <div key={event._id} className="card">
            <div className="card-image" style={{backgroundImage: `url(${event.imageUrl || 'https://via.placeholder.com/300'})`}}></div>
            <div className="content">
              <h3>{event.title}</h3>
              <p className="date">{event.date}</p>
              <p className="venue">📍 {event.venue}</p>
              <button onClick={() => handleTicketClick(event)}>GET TICKETS</button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Get Tickets for {selectedEvent.title}</h3>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
            />
            <div className="consent">
              <input type="checkbox" required /> 
              <span>I consent to receive event updates.</span>
            </div>
            <button className="primary-btn" onClick={submitEmail}>Proceed to Tickets</button>
            <button className="close-btn" onClick={() => setModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicHome;