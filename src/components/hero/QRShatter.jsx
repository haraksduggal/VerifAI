import React, { useEffect, useRef, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Canvas, useFrame } from '@react-three/fiber';

// ── Particle system ───────────────────────────────────────────
function ShatterParticles({ triggered }) {
  const pointsRef = useRef(null);
  const COUNT = 441;

  const { originPos, velocities } = useMemo(() => {
    const originPos  = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT * 3);
    let i = 0;
    for (let row = 0; row < 21; row++) {
      for (let col = 0; col < 21; col++) {
        const x = (col - 10) * 0.12;
        const y = (10 - row) * 0.12;
        originPos[i * 3]     = x;
        originPos[i * 3 + 1] = y;
        originPos[i * 3 + 2] = 0;
        const angle = Math.atan2(y || 0.001, x || 0.001) + (Math.random() - 0.5) * 0.8;
        const spd   = 0.05 + Math.random() * 0.09;
        velocities[i * 3]     = Math.cos(angle) * spd;
        velocities[i * 3 + 1] = Math.sin(angle) * spd;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.03;
        i++;
      }
    }
    return { originPos, velocities };
  }, []);

  const livePos    = useRef(new Float32Array(originPos));
  const progressRef = useRef(0);

  useFrame((_, delta) => {
    const pts = pointsRef.current;
    if (!pts) return;
    const attr = pts.geometry.attributes.position;
    if (!attr) return;

    if (triggered) {
      progressRef.current = Math.min(progressRef.current + delta * 1.1, 1);
    } else {
      progressRef.current = Math.max(progressRef.current - delta * 2.5, 0);
    }

    const t    = progressRef.current;
    const ease = t * t * (3 - 2 * t); // smoothstep

    for (let i = 0; i < COUNT; i++) {
      attr.array[i * 3]     = originPos[i * 3]     + velocities[i * 3]     * ease * 16;
      attr.array[i * 3 + 1] = originPos[i * 3 + 1] + velocities[i * 3 + 1] * ease * 16;
      attr.array[i * 3 + 2] = originPos[i * 3 + 2] + velocities[i * 3 + 2] * ease * 8;
    }
    attr.needsUpdate    = true;
    pts.material.opacity = 1 - ease * 0.92;
  });

  useEffect(() => {
    return () => {
      const pts = pointsRef.current;
      if (pts) {
        pts.geometry.dispose();
        pts.material.dispose();
      }
    };
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={livePos.current}
          count={COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color="#1A1A1A"
        transparent
        opacity={1}
        sizeAttenuation
      />
    </points>
  );
}

// ── Scene wrapper ─────────────────────────────────────────────
export default function QRShatter() {
  const sceneRef  = useRef(null);
  const textRef   = useRef(null);
  const line1Ref  = useRef(null);
  const line2Ref  = useRef(null);
  const line3Ref  = useRef(null);
  const radialRef = useRef(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      tl.call(() => setTriggered(true), [], 0);

      tl.to(radialRef.current, { opacity: 1, scale: 1.6, duration: 0.9, ease: 'power2.out' }, 0.2);
      tl.to(radialRef.current, { opacity: 0.15, duration: 0.7 }, 1.0);

      tl.set(textRef.current,  { opacity: 1 }, 0.42);
      tl.to(line1Ref.current,  { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 0.45);
      tl.to(line2Ref.current,  { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.6)' }, 0.72);
      tl.to(line3Ref.current,  { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1.28);

      const st = ScrollTrigger.create({
        trigger: sceneRef.current,
        start: 'top top',
        end: '+=100%',
        pin: true,
        onEnter:     () => tl.play(),
        onLeaveBack: () => { tl.pause(0); setTriggered(false); },
      });

      return () => { tl.kill(); st.kill(); };
    }, sceneRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sceneRef} className="hero-scene qr-shatter-scene">
      <div className="shatter-canvas-wrapper">
        <Canvas
          camera={{ position: [0, 0, 4], fov: 45 }}
          gl={{ alpha: true, antialias: true }}
          style={{ width: '100%', height: '100%', background: 'transparent' }}
        >
          <ShatterParticles triggered={triggered} />
        </Canvas>
      </div>

      <div ref={radialRef} className="shatter-radial" />

      <div ref={textRef} className="shatter-text">
        <p  ref={line1Ref} className="line-1">And then…</p>
        <h2 ref={line2Ref} className="line-2">The QR <span className="dies">dies.</span></h2>
        <p  ref={line3Ref} className="line-3">
          After a single scan, the QR becomes permanently invalid —
          making counterfeiting mathematically impossible.
          Refill-and-resell? Game over.
        </p>
      </div>
    </section>
  );
}
