import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab');

  const isTabActive = (tab: string) => {
    return location.pathname === '/app' && activeTab === tab;
  };

  if (location.pathname === '/') return null;

  return (
    <nav className="navbar">
      <Link to="/" className="logo-group">
        <div className="logo-mark">V</div>
        <div className="logo-text">Verif<span>AI</span></div>
      </Link>
      
      <div className="nav-pills">
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}
          end
        >
          Home
        </NavLink>
        <NavLink 
          to="/app?tab=generate" 
          className={({ isActive }) => `nav-pill ${isActive || isTabActive('generate') ? 'active' : ''}`}
        >
          Generate QR
        </NavLink>
        <NavLink 
          to="/app?tab=registry" 
          className={({ isActive }) => `nav-pill ${isActive || isTabActive('registry') ? 'active' : ''}`}
        >
          Database
        </NavLink>
        <NavLink 
          to="/app?tab=scan" 
          className={({ isActive }) => `nav-pill ${isActive || isTabActive('scan') ? 'active' : ''}`}
        >
          Scan & Verify
        </NavLink>
      </div>
      
      <div className="live-chip">
        <span className="live-dot"></span> PKI Secured
      </div>
    </nav>
  );
};

export default Navbar;
