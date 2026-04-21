// utils/storage.js — VerifAI localStorage helpers

const KEY = 'verifai_qr_data';

export function getAllQRs() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveQR(entry) {
  const all = getAllQRs();
  all.unshift(entry); // newest first
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function updateQRStatus(id, status) {
  const all = getAllQRs();
  const idx = all.findIndex(q => q.id === id);
  if (idx === -1) return false;
  all[idx].status = status;
  all[idx].scannedAt = new Date().toISOString();
  localStorage.setItem(KEY, JSON.stringify(all));
  return true;
}

export function deleteAllQRs() {
  localStorage.removeItem(KEY);
}

export function findQRById(id) {
  return getAllQRs().find(q => q.id === id) || null;
}

export function generateId() {
  return 'vai_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}
