/**
 * Utility functions for VerifAI application
 */

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const HEX = '0123456789abcdef';

/**
 * Generate a unique Token ID
 */
export const tid = () => {
  let id = 'VRF-';
  for (let i = 0; i < 6; i++) {
    id += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return id;
};

/**
 * Generate a pseudo-cryptographic signature
 */
export const mksig = () => {
  let s = '';
  for (let i = 0; i < 64; i++) {
    s += HEX[Math.floor(Math.random() * 16)];
  }
  return s;
};

/**
 * Format date to en-IN locale
 */
export const fd = (d: string | number | Date | null) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Get current time in en-IN locale
 */
export const ts = () => {
  return new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};
