import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage: React.FC = () => {
  const containerVars = {
    hidden: { opacity: 0, y: 24 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        staggerChildren: 0.1,
        ease: [0.22, 1, 0.36, 1] as any
      }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="landing"
      initial="hidden"
      animate="visible"
      variants={containerVars}
    >
      <section className="hero">
        <motion.div className="hero-eyebrow" variants={itemVars}>
          🔐 AI-Powered Product Authentication
        </motion.div>
        <motion.h1 variants={itemVars}>
          <span className="gr">Scan once to verify.</span><br />
          <span className="cr">QR dies after that.</span>
        </motion.h1>
        <motion.p className="hero-sub" variants={itemVars}>
          Counterfeiting stops being profitable when every product unit carries a unique, cryptographically signed, one-time QR code. VerifAI closes the gap between manufacture and consumer.
        </motion.p>
        <motion.div className="hero-ctas" variants={itemVars}>
          <a href="/app?tab=generate" target="_blank" rel="noopener noreferrer" className="btn-hero primary">Create the QR →</a>
          <Link to="/app?tab=scan" className="btn-hero secondary">🔍 Verify a Product</Link>
        </motion.div>
      </section>

      <motion.div className="stats-strip" variants={itemVars}>
        <div className="stat-item">
          <div className="stat-num">₹7.1L Cr</div>
          <div className="stat-desc">India's FMCG market — growing at<br />14.9% CAGR to 2030</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">1 in 6</div>
          <div className="stat-desc">FSSAI samples non-conforming<br />27,567 failed out of 1,55,306 (FY25–26)</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">83 Cr+</div>
          <div className="stat-desc">Smartphone users in India<br />Platform-ready consumer base today</div>
        </div>
      </motion.div>

      <section className="problem-section">
        <span className="section-tag coral">⚠ The Problem</span>
        <h2>Counterfeiting is no longer a luxury problem.</h2>
        <p>It's inside your toothpaste, your paneer, your soft drinks — and India's manufacturing sector is the entry point. The supply chain has 5–7 middlemen between manufacturer and consumer. Raids happen after harm. There is no prevention layer.</p>
        <div className="incident-grid">
          <div className="incident-card">
            <div className="ic-place">🔴 Delhi, Apr 2026</div>
            <div className="ic-desc">Fake Sensodyne — local paste in genuine packaging. No license. Industrial scale operation uncovered.</div>
          </div>
          <div className="incident-card">
            <div className="ic-place">🔴 Delhi, Mar 2026</div>
            <div className="ic-desc">3,096 Coke/Sprite cans seized — expiry dates chemically erased and reprinted using Domino machine.</div>
          </div>
          <div className="incident-card">
            <div className="ic-place">🔴 Surat + Hyderabad</div>
            <div className="ic-desc">1,401 kg adulterated paneer + 4,032 kg fake ginger-garlic paste seized in coordinated raids.</div>
          </div>
        </div>
      </section>

      <section className="how-section">
        <span className="section-tag teal">✦ How It Works</span>
        <h2>Three layers. Zero loopholes.</h2>
        <div className="how-steps">
          <div className="glass how-step">
            <div className="step-num">01</div>
            <div className="step-icon">🔐</div>
            <h3>PKI Signed Token</h3>
            <p>Every product unit gets a unique cryptographic token signed with asymmetric keys (RSA/ECC). The QR encodes the full product identity and digital signature.</p>
          </div>
          <div className="glass how-step">
            <div className="step-num">02</div>
            <div className="step-icon">📱</div>
            <h3>Consumer ScanCheck</h3>
            <p>Consumer scans via WhatsApp or PWA. PKI signature verified in 3 seconds. Shows valid or fake. QR permanently invalidated after first scan — refill-and-resell is impossible.</p>
          </div>
          <div className="glass how-step">
            <div className="step-num">03</div>
            <div className="step-icon">📊</div>
            <h3>CrowdSignal Intel</h3>
            <p>Scans geohashed to district level. FSSAI gets a live heatmap: where bad batches cluster → proactive raids replace reactive enforcement.</p>
          </div>
        </div>
      </section>

      <section className="platform-section">
        <span className="section-tag blue">◈ Platform</span>
        <h2>Try the VerifAI prototype.</h2>
        <p>Explore the three core modules of the platform — generate signed QR codes, monitor the product registry, and simulate consumer verification.</p>
        <div className="platform-grid">
          <Link to="/app?tab=generate" className="glass platform-card">
            <div className="pc-icon">⬡</div>
            <h3>Generate QR</h3>
            <p>Register a product unit and generate a unique, cryptographically signed one-time QR code with full product metadata.</p>
            <span className="card-link">Open Generator →</span>
          </Link>
          <Link to="/app?tab=registry" className="glass platform-card">
            <div className="pc-icon">◉</div>
            <h3>Product Registry</h3>
            <p>Real-time dashboard showing all registered units — active, scanned, or expired — with live status tracking.</p>
            <span className="card-link">View Database →</span>
          </Link>
          <Link to="/app?tab=scan" className="glass platform-card">
            <div className="pc-icon">🔍</div>
            <h3>Scan & Verify</h3>
            <p>Simulate a consumer scanning a product QR. See the one-time verification, expiry detection, and re-scan blocking in action.</p>
            <span className="card-link">Try Scanner →</span>
          </Link>
        </div>
      </section>

      <section className="tech-section">
        <span className="section-tag teal">⚙ Tech Stack</span>
        <h2>Built on proven infrastructure.</h2>
        <div className="tech-grid">
          <div className="glass tech-item"><h4>Authentication</h4><p>PKI — asymmetric cryptography (RSA/ECC). Signed token per unit, invalidated on first scan.</p></div>
          <div className="glass tech-item"><h4>Consumer Interface</h4><p>PWA + WhatsApp Business API. Zero install friction. Works on any ₹5K smartphone.</p></div>
          <div className="glass tech-item"><h4>Location Privacy</h4><p>H3 geohashing — district-level bucketing, no raw GPS. DPDP Act 2023 compliant.</p></div>
          <div className="glass tech-item"><h4>Intelligence Layer</h4><p>Geospatial clustering on geohash data → FSSAI dashboard for proactive enforcement.</p></div>
          <div className="glass tech-item"><h4>Brand Integration</h4><p>REST API — plugs into existing product DBs. No re-platforming needed for FMCG brands.</p></div>
          <div className="glass tech-item"><h4>Physical Layer</h4><p>Holographic tamper-evident seal (₹2–5/unit at manufacture). Broken seal = visible warning before scan.</p></div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-logo">Verif<span>AI</span></div>
        <div className="footer-sub">AI-powered product authentication for India's FMCG supply chain.</div>
        <div className="footer-links">
          <Link to="/app?tab=generate" className="footer-link">Generate QR</Link>
          <Link to="/app?tab=registry" className="footer-link">Database</Link>
          <Link to="/app?tab=scan" className="footer-link">Scan & Verify</Link>
        </div>
      </footer>
    </motion.div>
  );
};

export default LandingPage;
