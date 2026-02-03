import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLoginSuccess = (credentialResponse) => {
    console.log("Logged in:", credentialResponse);
    setIsAuthenticated(true); 
  };

  const fetchEvents = async () => {
    const res = await axios.get('http://localhost:5000/api/events');
    setEvents(res.data);
  };

  useEffect(() => {
    if (isAuthenticated) fetchEvents();
  }, [isAuthenticated]);

  const triggerScrape = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/scrape');
      alert('Scraping finished!');
      fetchEvents();
    } catch (error) {
      alert('Scraping failed (check server console)');
    }
    setLoading(false);
  };

  const markImported = async (id) => {
    await axios.put(`http://localhost:5000/api/events/${id}/import`);
    setEvents(events.map(e => e._id === id ? { ...e, status: 'imported' } : e));
  };

  if (!isAuthenticated) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h2>Sydney Events Admin</h2>
        <GoogleLogin onSuccess={handleLoginSuccess} onError={() => console.log('Login Failed')} />
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1>Admin Dashboard</h1>
        <button 
          onClick={triggerScrape} 
          disabled={loading}
          style={{ padding: '10px 20px', background: loading ? '#ccc' : '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          {loading ? 'Scraping...' : 'Refresh Scraper'}
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
            <th style={{ padding: '15px' }}>Title</th>
            <th style={{ padding: '15px' }}>Date</th>
            <th style={{ padding: '15px' }}>Venue</th>
            <th style={{ padding: '15px' }}>Status</th>
            <th style={{ padding: '15px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map(event => (
            <tr key={event._id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '15px' }}>{event.title}</td>
              <td style={{ padding: '15px' }}>{event.date}</td>
              <td style={{ padding: '15px' }}>{event.venue}</td>
              <td style={{ padding: '15px' }}>
                <span style={{ 
                  padding: '5px 10px', 
                  borderRadius: '15px', 
                  fontSize: '0.85rem',
                  background: event.status === 'imported' ? '#d4edda' : '#fff3cd',
                  color: event.status === 'imported' ? '#155724' : '#856404'
                }}>
                  {event.status}
                </span>
              </td>
              <td style={{ padding: '15px' }}>
                {event.status !== 'imported' && (
                  <button 
                    onClick={() => markImported(event._id)}
                    style={{ background: '#007bff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Import
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;