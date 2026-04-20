import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const Navbar = () => {
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
          to="/generate" 
          className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}
        >
          Generate QR
        </NavLink>
        <NavLink 
          to="/database" 
          className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}
        >
          Database
        </NavLink>
        <NavLink 
          to="/scan" 
          className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}
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
