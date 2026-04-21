import React, { Suspense, lazy, useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollProgress from '../components/hero/ScrollProgress.jsx';
import QRFormation from '../components/hero/QRFormation.jsx';
import QRScan from '../components/hero/QRScan.jsx';
import CTASection from '../components/hero/CTASection.jsx';
import '../styles/hero.css';

// Lazy-load heavy Three.js shatter scene
const QRShatter = lazy(() => import('../components/hero/QRShatter.jsx'));

function ShatterFallback() {
  return (
    <section className="hero-scene qr-shatter-scene" style={{ background: '#FAFAF8' }}>
      <div className="shatter-text" style={{ opacity: 1 }}>
        <p className="line-1" style={{ opacity: 1, transform: 'none' }}>And then...</p>
        <h2 className="line-2" style={{ opacity: 1, transform: 'none' }}>
          The QR <span className="dies">dies.</span>
        </h2>
        <p className="line-3" style={{ opacity: 1, transform: 'none' }}>
          After a single scan, the QR becomes permanently invalid —
          making counterfeiting mathematically impossible.
        </p>
      </div>
    </section>
  );
}

export default function Hero() {
  // Kill all ScrollTriggers on unmount so /app route is clean
  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="hero-page">
      <ScrollProgress />
      <QRFormation />
      <QRScan />
      <Suspense fallback={<ShatterFallback />}>
        <QRShatter />
      </Suspense>
      <CTASection />
    </div>
  );
}
