import React from 'react';
import { useNavigate } from 'react-router-dom';

function IconScan() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
      <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
      <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
      <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
      <line x1="7" y1="12" x2="17" y2="12"/>
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="hero-scene cta-scene">
      <div className="cta-inner">
        <span className="cta-label">VerifAI Platform</span>

        <h2 className="cta-headline">
          Secure your products.<br />Start now.
        </h2>

        <p className="cta-sub">
          Generate one-time QR codes, verify authenticity in real time,
          and kill counterfeiting before it starts.
          Built for India's FMCG supply chain.
        </p>

        <button className="cta-btn" onClick={() => navigate('/app')}>
          Go to Dashboard
          <IconArrow />
        </button>

        <div className="cta-badges">
          <div className="cta-badge">
            <IconScan /> One-Scan QR
          </div>
          <div className="cta-badge">
            <IconCheck /> Instant Verification
          </div>
          <div className="cta-badge">
            <IconShield /> Counterfeit-Proof
          </div>
        </div>
      </div>
    </section>
  );
}
