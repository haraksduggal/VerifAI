import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Hero from './pages/Hero.jsx';

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));

function LoadingFallback() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#FAFAF8',
      fontFamily: 'Space Grotesk, sans-serif', color: '#9A9A96', fontSize: '0.9rem'
    }}>
      Loading dashboard…
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Hero />} />
      <Route
        path="/app"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        }
      />
    </Routes>
  );
}
