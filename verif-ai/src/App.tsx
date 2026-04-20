import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Background from './components/Background';
import LandingPage from './components/pages/LandingPage';
import AppDashboard from './components/pages/AppDashboard';

const App: React.FC = () => {
  const checkExpiries = useStore((state) => state.checkExpiries);

  // Auto-expiry check interval
  useEffect(() => {
    const interval = setInterval(() => {
      checkExpiries();
    }, 5000);
    return () => clearInterval(interval);
  }, [checkExpiries]);

  return (
    <Router>
      {/* Visual Atmosphere Components */}
      <Background />
      <main className="main-container relative z-10">
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          
          {/* Protected-style Tabbed Dashboard */}
          <Route path="/app" element={<AppDashboard />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;
