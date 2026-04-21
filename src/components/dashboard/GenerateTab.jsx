import React, { useState, useRef, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { saveQR, getAllQRs, generateId } from '../../utils/storage.js';
import { useToast } from './Toast.jsx';

function StatusBadge({ status }) {
  const label = status === 'active' ? 'Active' : status === 'dead' ? 'Dead' : 'Scanned';
  return <span className={`status-badge ${status}`}>{label}</span>;
}

export default function GenerateTab() {
  const addToast  = useToast();
  const canvasRef = useRef(null);

  const [fields, setFields] = useState({ productName: '', productId: '', manufacturer: '' });
  const [errors, setErrors] = useState({});
  const [generated, setGenerated] = useState(null);   // last generated entry
  const [recentList, setRecentList] = useState([]);

  useEffect(() => {
    setRecentList(getAllQRs().slice(0, 8));
  }, []);

  const validate = () => {
    const errs = {};
    if (!fields.productName.trim())  errs.productName  = 'Product name is required';
    if (!fields.productId.trim())    errs.productId    = 'Product ID / serial number is required';
    if (!fields.manufacturer.trim()) errs.manufacturer = 'Manufacturer name is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: '' }));
  };

  const handleGenerate = useCallback(async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const id         = generateId();
    const verifyUrl  = `https://verifai.app/verify/${id}`;
    const entry = {
      id,
      productName:  fields.productName.trim(),
      productId:    fields.productId.trim(),
      manufacturer: fields.manufacturer.trim(),
      status:       'active',
      createdAt:    new Date().toISOString(),
      scannedAt:    null,
    };

    saveQR(entry);

    // Draw QR onto the always-mounted canvas
    if (canvasRef.current) {
      await QRCode.toCanvas(canvasRef.current, verifyUrl, {
        width:  220,
        margin: 2,
        color:  { dark: '#1A1A1A', light: '#FFFFFF' },
      });
    }

    setGenerated(entry);
    setRecentList(getAllQRs().slice(0, 8));
    setFields({ productName: '', productId: '', manufacturer: '' });
    addToast({ type: 'success', title: 'QR Generated', message: `${entry.productName} — ready to download` });
  }, [fields, addToast]);

  const handleDownload = () => {
    if (!canvasRef.current || !generated) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a   = document.createElement('a');
    a.href     = url;
    a.download = `verifai-${generated.productId}.png`;
    a.click();
    addToast({ type: 'info', title: 'Downloading QR', message: generated.productName });
  };

  return (
    <div className="tab-panel">
      <div className="section-header">
        <h2>Generate QR Code</h2>
        <p>Create a unique one-time QR code per product unit. Each code is cryptographically unique and permanently expires after a single scan.</p>
      </div>

      <div className="generate-layout">
        {/* ── Form ─────────────────────────────────────────── */}
        <div className="generate-form-card">
          <div className="form-group">
            <label className="form-label" htmlFor="productName">Product Name</label>
            <input
              id="productName" name="productName" type="text"
              className={`form-input${errors.productName ? ' error' : ''}`}
              placeholder="e.g. Sensodyne Toothpaste 100g"
              value={fields.productName}
              onChange={handleChange}
              autoComplete="off"
            />
            {errors.productName && <p className="form-error">⚠ {errors.productName}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="productId">Product ID / Serial Number</label>
            <input
              id="productId" name="productId" type="text"
              className={`form-input${errors.productId ? ' error' : ''}`}
              placeholder="e.g. SNS-2026-001"
              value={fields.productId}
              onChange={handleChange}
              autoComplete="off"
            />
            {errors.productId && <p className="form-error">⚠ {errors.productId}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="manufacturer">Manufacturer Name</label>
            <input
              id="manufacturer" name="manufacturer" type="text"
              className={`form-input${errors.manufacturer ? ' error' : ''}`}
              placeholder="e.g. GSK Consumer Healthcare"
              value={fields.manufacturer}
              onChange={handleChange}
              autoComplete="off"
            />
            {errors.manufacturer && <p className="form-error">⚠ {errors.manufacturer}</p>}
          </div>

          <button className="btn-primary" onClick={handleGenerate}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
              <line x1="14" y1="17" x2="20" y2="17"/><line x1="17" y1="14" x2="17" y2="20"/>
            </svg>
            Generate QR Code
          </button>
        </div>

        {/* ── QR Result — canvas always mounted ────────────── */}
        <div className="qr-result-card">
          {/* Canvas always in DOM — visibility toggled by CSS */}
          <canvas
            ref={canvasRef}
            className="qr-result-canvas"
            style={{ display: generated ? 'block' : 'none' }}
          />

          {generated ? (
            <>
              <div className="qr-result-info">
                <h3>{generated.productName}</h3>
                <p>{generated.productId} · {generated.manufacturer}</p>
              </div>
              <StatusBadge status="active" />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                QR Active — not yet scanned
              </p>
              <button className="btn-secondary" onClick={handleDownload}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download QR
              </button>
            </>
          ) : (
            <div className="qr-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
              <span>Fill in product details and click Generate</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent QRs ─────────────────────────────────────── */}
      {recentList.length > 0 && (
        <div className="recent-qrs">
          <h3>Recently Generated</h3>
          <div className="qr-list">
            {recentList.map(qr => (
              <div key={qr.id} className="qr-list-item">
                <div className="qr-list-item-info">
                  <div className="qr-list-item-name">{qr.productName}</div>
                  <div className="qr-list-item-id">{qr.productId} · {qr.manufacturer}</div>
                </div>
                <StatusBadge status={qr.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
