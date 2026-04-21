import React from 'react';
import { Link } from 'react-router-dom';

function LogoMark() {
  return (
    <div className="nav-logo-mark">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
        <rect x="14" y="14" width="3" height="3"/>
        <rect x="18" y="18" width="3" height="3"/>
        <rect x="14" y="18" width="3" height="3"/>
        <rect x="18" y="14" width="3" height="3"/>
      </svg>
    </div>
  );
}

export default function DashboardNav() {
  return (
    <nav className="dashboard-nav">
      <div className="nav-logo">
        <LogoMark />
        <span className="nav-logo-text">VerifAI</span>
      </div>
      <Link to="/" className="nav-back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Back to Home
      </Link>
    </nav>
  );
}
