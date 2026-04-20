import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const Background = () => {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!particlesRef.current) return;
    
    // Cleanup any existing particles
    particlesRef.current.innerHTML = '';
    
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (12 + Math.random() * 20) + 's';
      p.style.animationDelay = (Math.random() * 15) + 's';
      const size = (1 + Math.random() * 2) + 'px';
      p.style.width = size;
      p.style.height = size;
      particlesRef.current.appendChild(p);
    }
  }, []);

  return (
    <>
      <div className="bg-canvas">
        <motion.div 
          className="bg-orb o1"
          animate={{ 
            x: [0, 40, -20, 30, 0],
            y: [0, -30, 50, 20, 0],
            scale: [1, 1.05, 0.95, 1.02, 1]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="bg-orb o2"
          animate={{ 
            x: [0, -40, 20, -30, 0],
            y: [0, 30, -50, -20, 0],
            scale: [1, 1.1, 0.9, 1.05, 1]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="bg-orb o3"
          animate={{ 
            x: [0, 20, -30, 40, 0],
            y: [0, 40, -20, 30, 0],
            scale: [1, 1.02, 0.98, 1.01, 1]
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="bg-grain" />
      <div className="bg-grid" />
      <div className="particles" ref={particlesRef} />
    </>
  );
};

export default Background;
