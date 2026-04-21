import React, { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function buildQRPattern() {
  const size = 21;
  const grid = Array(size).fill(null).map(() => Array(size).fill(0));
  function drawFinder(r, c) {
    for (let i = 0; i < 7; i++)
      for (let j = 0; j < 7; j++) {
        const on = i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4);
        if (r+i < size && c+j < size) grid[r+i][c+j] = on ? 1 : 0;
      }
  }
  drawFinder(0,0); drawFinder(0,14); drawFinder(14,0);
  for (let i = 8; i <= 12; i++) { grid[6][i] = i%2===0?1:0; grid[i][6] = i%2===0?1:0; }
  [[2,2],[2,3],[3,2],[8,2],[9,2],[8,3],[8,8],[9,10],[10,9],[12,12],[13,11],[2,12],[3,11],[12,2],[11,3],[7,8],[7,9],[15,7],[7,15],[11,11],[5,5],[18,8],[8,18],[2,16],[3,17],[16,2],[17,3],[12,16],[13,17],[16,12],[17,13]].forEach(([r,c]) => { if(r<size&&c<size) grid[r][c]=1; });
  return grid;
}

// Inline SVG phone
function PhoneSVG() {
  return (
    <svg className="phone-svg" viewBox="0 0 80 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="4" y="4" width="72" height="132" rx="12" fill="#1A1A1A"/>
      <rect x="8" y="8" width="64" height="124" rx="9" fill="#2A2A2A"/>
      <rect x="12" y="18" width="56" height="88" rx="4" fill="#F5F5F0"/>
      <rect x="28" y="8" width="24" height="4" rx="2" fill="#444"/>
      <circle cx="40" cy="122" r="6" fill="#444"/>
      {/* Camera lens */}
      <circle cx="40" cy="14" r="2" fill="#555"/>
      {/* Screen content - mini QR hint */}
      <rect x="20" y="26" width="40" height="40" rx="2" fill="#E8E8E4"/>
      <rect x="22" y="28" width="12" height="12" rx="1" fill="#1A1A1A"/>
      <rect x="46" y="28" width="12" height="12" rx="1" fill="#1A1A1A"/>
      <rect x="22" y="52" width="12" height="12" rx="1" fill="#1A1A1A"/>
      <rect x="35" y="35" width="8" height="8" rx="1" fill="#1A1A1A"/>
      <rect x="25" y="74" width="30" height="3" rx="1.5" fill="#D0D0CA"/>
      <rect x="20" y="82" width="40" height="2" rx="1" fill="#E0E0DC"/>
      <rect x="20" y="88" width="32" height="2" rx="1" fill="#E0E0DC"/>
      {/* SCAN label */}
      <rect x="14" y="97" width="52" height="18" rx="4" fill="#0057FF"/>
      <text x="40" y="110" textAnchor="middle" fill="white" fontSize="8" fontFamily="Space Grotesk, sans-serif" fontWeight="600">SCAN</text>
    </svg>
  );
}

export default function QRScan() {
  const sceneRef   = useRef(null);
  const phoneRef   = useRef(null);
  const beamRef    = useRef(null);
  const textRef    = useRef(null);
  const qrHolderRef = useRef(null);

  const pattern = useMemo(() => buildQRPattern(), []);
  const modules = pattern.flat();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      // Phone slides in
      tl.to(phoneRef.current, { x: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.4)' }, 0);

      // Beam sweeps down
      tl.to(beamRef.current, { opacity: 1, duration: 0.2 }, 0.6);
      tl.fromTo(beamRef.current, { top: '0%' }, { top: '100%', duration: 0.9, ease: 'linear' }, 0.7);
      tl.to(beamRef.current, { opacity: 0, duration: 0.2 }, 1.5);

      // QR wobble
      tl.to(qrHolderRef.current, { scale: 1.04, duration: 0.15, ease: 'power2.out', yoyo: true, repeat: 3 }, 0.8);
      tl.to(qrHolderRef.current, { filter: 'brightness(1.3)', duration: 0.4, ease: 'power2.out' }, 0.8);
      tl.to(qrHolderRef.current, { filter: 'brightness(1)',  duration: 0.4, ease: 'power2.in' },  1.2);

      // Text appears
      tl.to(textRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1.3);

      const st = ScrollTrigger.create({
        trigger: sceneRef.current,
        start: 'top top',
        end: '+=80%',
        pin: true,
        onEnter: () => tl.play(),
        onLeaveBack: () => tl.pause(0),
      });

      return () => { tl.kill(); st.kill(); };
    }, sceneRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sceneRef} className="hero-scene qr-scan-scene">
      {/* QR display */}
      <div ref={qrHolderRef} className="scan-qr-holder">
        <div className="scan-qr-display">
          {modules.map((val, i) => (
            <div key={i} className={`scan-module${val === 0 ? ' scan-module--empty' : ''}`} />
          ))}
        </div>
        <div ref={beamRef} className="scan-beam" />
      </div>

      {/* Phone */}
      <div ref={phoneRef} className="scan-phone">
        <PhoneSVG />
      </div>

      {/* Text */}
      <div ref={textRef} className="scan-text-area">
        <p className="scene-eyebrow">One scan. That's all it takes.</p>
        <h2>One scan reveals<br />everything</h2>
        <p>
          Your customer scans the QR code on the product.
          In under 3 seconds, PKI cryptography confirms the item is genuine —
          and the QR's clock starts ticking.
        </p>
      </div>
    </section>
  );
}
