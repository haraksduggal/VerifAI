import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { findQRById, updateQRStatus } from '../../utils/storage.js';
import { useToast } from './Toast.jsx';

function ResultCard({ result }) {
  if (!result) return null;

  if (result.type === 'success') {
    const qr = result.qr;
    const date = new Date(qr.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    return (
      <div className="verify-result success">
        <div className="verify-result-header">
          <div className="verify-result-icon">✓</div>
          <div className="verify-result-title">Product Authentic</div>
        </div>
        <p className="verify-result-detail">This product is genuine and verified by VerifAI. The QR code has now been permanently invalidated.</p>
        <div className="verify-detail-grid">
          <div className="verify-detail-item">
            <div className="verify-detail-label">Product</div>
            <div className="verify-detail-value">{qr.productName}</div>
          </div>
          <div className="verify-detail-item">
            <div className="verify-detail-label">Manufacturer</div>
            <div className="verify-detail-value">{qr.manufacturer}</div>
          </div>
          <div className="verify-detail-item">
            <div className="verify-detail-label">Serial No.</div>
            <div className="verify-detail-value">{qr.productId}</div>
          </div>
          <div className="verify-detail-item">
            <div className="verify-detail-label">Registered</div>
            <div className="verify-detail-value">{date}</div>
          </div>
        </div>
      </div>
    );
  }

  if (result.type === 'dead') {
    return (
      <div className="verify-result danger">
        <div className="verify-result-header">
          <div className="verify-result-icon">⚠</div>
          <div className="verify-result-title">QR Already Used — Possible Counterfeit</div>
        </div>
        <p className="verify-result-detail">
          This QR code has already been scanned once and is permanently invalid.
          If you are scanning a physical product, it may be counterfeit. Do not consume and report to FSSAI.
        </p>
      </div>
    );
  }

  if (result.type === 'notfound') {
    return (
      <div className="verify-result warning">
        <div className="verify-result-header">
          <div className="verify-result-icon">?</div>
          <div className="verify-result-title">QR Not Found</div>
        </div>
        <p className="verify-result-detail">
          No product matching this QR code exists in the VerifAI database.
          This product was not registered through VerifAI and cannot be verified.
        </p>
      </div>
    );
  }

  return null;
}

// ── Manual verify ─────────────────────────────────────────────
function ManualVerify({ onResult }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleVerify = () => {
    const val = input.trim();
    if (!val) { setError('Enter a Product ID or scan URL'); return; }
    setError('');

    // Support both raw ID and full URL
    let id = val;
    const urlMatch = val.match(/verifai\.app\/verify\/([^\s?#]+)/);
    if (urlMatch) id = urlMatch[1];

    const qr = findQRById(id);
    if (!qr) { onResult({ type: 'notfound' }); return; }
    if (qr.status === 'dead') { onResult({ type: 'dead' }); return; }

    // Valid — kill it
    updateQRStatus(id, 'dead');
    onResult({ type: 'success', qr: { ...qr } });
    setInput('');
  };

  return (
    <div>
      <div className="verify-input-row">
        <input
          className={`form-input${error ? ' error' : ''}`}
          type="text"
          placeholder="Product ID or scan URL (e.g. vai_abc123…)"
          value={input}
          onChange={e => { setInput(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleVerify()}
        />
        <button className="btn-primary" style={{ width: 'auto', whiteSpace: 'nowrap' }} onClick={handleVerify}>
          Verify
        </button>
      </div>
      {error && <p className="form-error" style={{ marginTop: 6 }}>⚠ {error}</p>}
    </div>
  );
}

// ── Camera verify ─────────────────────────────────────────────
function CameraVerify({ onResult }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef    = useRef(null);
  const [active, setActive]     = useState(false);
  const [camError, setCamError] = useState('');
  const [scanning, setScanning] = useState(false);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setActive(false);
    setScanning(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const startCamera = async () => {
    setCamError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 640 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
      setScanning(true);
      scanLoop();
    } catch (err) {
      setCamError('Camera access denied or unavailable. Please allow camera permission.');
    }
  };

  const scanLoop = () => {
    rafRef.current = requestAnimationFrame(() => {
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) { scanLoop(); return; }

      const w = video.videoWidth;
      const h = video.videoHeight;
      canvas.width  = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      const code = jsQR(imageData.data, w, h, { inversionAttempts: 'dontInvert' });

      if (code && code.data) {
        // Parsed a QR
        stopCamera();
        let id = code.data;
        const m = code.data.match(/verifai\.app\/verify\/([^\s?#]+)/);
        if (m) id = m[1];

        const qr = findQRById(id);
        if (!qr) { onResult({ type: 'notfound' }); return; }
        if (qr.status === 'dead') { onResult({ type: 'dead' }); return; }
        updateQRStatus(id, 'dead');
        onResult({ type: 'success', qr: { ...qr } });
        return;
      }

      if (streamRef.current) scanLoop();
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
      {!active ? (
        <>
          <button className="btn-camera" onClick={startCamera}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            Scan with Camera
          </button>
          {camError && <p className="form-error">{camError}</p>}
        </>
      ) : (
        <>
          <div className="camera-wrapper">
            <video ref={videoRef} className="camera-video" playsInline muted />
            <div className="camera-frame">
              <div className="camera-frame-inner">
                <div className="camera-scan-line" />
              </div>
            </div>
            <div className="camera-status">{scanning ? 'Scanning — point at a VerifAI QR code' : 'Initialising…'}</div>
          </div>
          <button className="btn-stop-camera" onClick={stopCamera}>
            ✕ Stop Camera
          </button>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </>
      )}
      {/* Hidden canvas always in DOM for jsQR */}
      {!active && <canvas ref={canvasRef} style={{ display: 'none' }} />}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function VerifyTab() {
  const addToast = useToast();
  const [method, setMethod] = useState('manual');
  const [result, setResult] = useState(null);

  const handleResult = useCallback((res) => {
    setResult(res);
    if (res.type === 'success')   addToast({ type: 'success', title: 'Product Authentic', message: res.qr.productName });
    if (res.type === 'dead')      addToast({ type: 'danger',  title: 'Already Scanned',  message: 'Possible counterfeit product' });
    if (res.type === 'notfound')  addToast({ type: 'warning', title: 'QR Not Found',      message: 'Not registered in VerifAI' });
  }, [addToast]);

  return (
    <div className="tab-panel">
      <div className="section-header">
        <h2>Verify Product</h2>
        <p>Check if a product is genuine. On successful verification, the QR is permanently invalidated — one scan only.</p>
      </div>

      <div className="verify-methods">
        <button className={`method-toggle${method === 'manual' ? ' active' : ''}`} onClick={() => { setMethod('manual'); setResult(null); }}>
          Manual Entry
        </button>
        <button className={`method-toggle${method === 'camera' ? ' active' : ''}`} onClick={() => { setMethod('camera'); setResult(null); }}>
          Camera Scan
        </button>
      </div>

      <div className="verify-card">
        {method === 'manual'
          ? <ManualVerify onResult={handleResult} />
          : <CameraVerify onResult={handleResult} />
        }
        <ResultCard result={result} />
      </div>
    </div>
  );
}
