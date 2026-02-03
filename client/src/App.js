import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import PublicHome from './pages/PublicHome';
import AdminDashboard from './pages/AdminDashboard';

// 🔴 PASTE YOUR GOOGLE CLIENT ID HERE
const GOOGLE_CLIENT_ID = "358629744442-3mkng3ocfpa8sipdk6vqbvv7iejkvjs4.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
          <Route path="/" element={<PublicHome />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;