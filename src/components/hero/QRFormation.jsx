import React, { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Simplified QR-like pattern (21x21 grid) — stylized, not a real QR
function buildQRPattern() {
  const size = 21;
  const grid = Array(size).fill(null).map(() => Array(size).fill(0));

  // Finder patterns (top-left, top-right, bottom-left)
  function drawFinder(r, c) {
    for (let i = 0; i < 7; i++)
      for (let j = 0; j < 7; j++) {
        const onEdge = i === 0 || i === 6 || j === 0 || j === 6;
        const onInner = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        if (r + i < size && c + j < size)
          grid[r + i][c + j] = (onEdge || onInner) ? 1 : 0;
      }
  }
  drawFinder(0, 0);
  drawFinder(0, 14);
  drawFinder(14, 0);

  // Timing patterns
  for (let i = 8; i <= 12; i++) {
    grid[6][i] = i % 2 === 0 ? 1 : 0;
    grid[i][6] = i % 2 === 0 ? 1 : 0;
  }

  // Alignment pattern
  for (let i = 16; i <= 20; i++)
    for (let j = 16; j <= 20; j++) {
      const onEdge = i === 16 || i === 20 || j === 16 || j === 20;
      grid[i][j] = (onEdge || (i === 18 && j === 18)) ? 1 : 0;
    }

  // Data modules (random-ish pattern)
  const seed = [
    [2,2],[2,3],[3,2],[2,8],[2,9],[3,8],[3,10],[4,9],
    [8,2],[9,2],[8,3],[10,2],[9,4],[10,3],
    [8,8],[8,9],[9,10],[10,8],[10,9],[10,10],
    [12,12],[13,11],[14,13],[15,12],[13,13],
    [2,12],[3,11],[4,12],[3,13],[4,14],
    [12,2],[11,3],[12,4],[13,3],[11,4],
    [7,8],[7,9],[7,10],[8,7],[9,7],
    [15,7],[16,8],[17,7],[15,8],
    [7,15],[8,16],[7,16],[8,15],[9,15],
    [11,11],[12,10],[11,12],[10,11],[10,12],
    [5,5],[5,6],[6,5],[4,5],[4,6],
    [18,8],[19,9],[18,9],[19,8],[20,8],
    [8,18],[9,19],[9,18],[8,19],[8,20],
    [2,16],[3,17],[4,16],[2,17],[3,18],
    [16,2],[17,3],[16,3],[17,2],[18,2],
    [12,16],[13,17],[14,16],[12,17],[13,18],
    [16,12],[17,13],[18,12],[16,13],[17,14],
  ];
  seed.forEach(([r, c]) => { if (r < size && c < size) grid[r][c] = 1; });

  return grid;
}

// Floating particles around the QR
function Particles() {
  const particleData = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      angle: (i / 18) * Math.PI * 2,
      radius: 160 + Math.random() * 60,
      size: 2 + Math.random() * 3,
      duration: 2.5 + Math.random() * 3,
      delay: Math.random() * 4,
    }));
  }, []);

  return (
    <div className="qr-particles">
      {particleData.map(p => (
        <div
          key={p.id}
          className="qr-particle"
          style={{
            left: `${50 + Math.cos(p.angle) * p.radius / 3.2}%`,
            top:  `${50 + Math.sin(p.angle) * p.radius / 3.2}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `particleFloat ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

export default function QRFormation({ triggerRef }) {
  const sceneRef    = useRef(null);
  const moduleRefs  = useRef([]);
  const textRef     = useRef(null);
  const glowRef     = useRef(null);
  const streakRefs  = useRef([]);

  const pattern = useMemo(() => buildQRPattern(), []);
  const modules = pattern.flat();

  useEffect(() => {
    // Particle float keyframe (injected once)
    if (!document.getElementById('particle-float-style')) {
      const style = document.createElement('style');
      style.id = 'particle-float-style';
      style.textContent = `
        @keyframes particleFloat {
          0%   { opacity: 0; transform: translate(0,0) scale(1); }
          50%  { opacity: 0.6; }
          100% { opacity: 0.1; transform: translate(${Math.random()*10-5}px, ${Math.random()*-20}px) scale(1.5); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      // Streak animation
      streakRefs.current.forEach((streak, i) => {
        if (!streak) return;
        tl.to(streak, { opacity: 1, scaleX: streak.classList.contains('qr-streak--h') ? 1 : undefined, scaleY: streak.classList.contains('qr-streak--v') ? 1 : undefined, duration: 0.3, ease: 'power2.out' }, i * 0.05);
        tl.to(streak, { opacity: 0, duration: 0.2, delay: 0.15 }, i * 0.05 + 0.3);
      });

      // Modules appear
      const activeModules = moduleRefs.current.filter((m, i) => modules[i] === 1 && m);
      gsap.utils.shuffle([...activeModules]).forEach((mod, i) => {
        tl.to(mod, { opacity: 1, scale: 1, duration: 0.15, ease: 'back.out(2)' }, 0.5 + i * 0.003);
      });

      // Glow pulse
      tl.to(glowRef.current, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 1.0);
      tl.to(glowRef.current, { scale: 1.2, opacity: 0.5, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 1.2);

      // Text fade-in
      tl.to(textRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 1.2);

      const st = ScrollTrigger.create({
        trigger: sceneRef.current,
        start: 'top top',
        end: '+=100%',
        pin: true,
        scrub: false,
        onEnter: () => tl.play(),
        onLeaveBack: () => { tl.pause(0); },
      });

      return () => { tl.kill(); st.kill(); };
    }, sceneRef);

    return () => ctx.revert();
  }, [modules]);

  return (
    <section ref={sceneRef} className="hero-scene qr-formation-scene">
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="qr-formation-canvas">
          <Particles />
          <div className="qr-glow" ref={glowRef} />
          <div className="qr-grid" style={{ position: 'relative', zIndex: 2 }}>
            {modules.map((val, i) => (
              <div
                key={i}
                ref={el => { moduleRefs.current[i] = el; }}
                className={`qr-module${val === 0 ? ' qr-module--empty' : ''}`}
              />
            ))}
          </div>

          {/* Streaks */}
          {['left','right','top','bottom'].map((dir, i) => (
            <div
              key={dir}
              ref={el => { streakRefs.current[i] = el; }}
              className={`qr-streak qr-streak--${dir === 'left' || dir === 'right' ? 'h' : 'v'} qr-streak--${dir}`}
              style={{ position: 'absolute' }}
            />
          ))}
        </div>

        <div ref={textRef} className="scene1-text">
          <h2>We create a <span className="accent-word">one-scan</span> QR code</h2>
        </div>
      </div>
    </section>
  );
}
