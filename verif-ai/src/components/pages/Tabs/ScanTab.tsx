import React, { useState } from 'react';
import { Search, Camera, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useStore, VerificationResult } from '../../../store/useStore';
import { fd, ts } from '../../../services/verifService';
import CameraScanner from '../../Scanner/CameraScanner';

const ScanTab: React.FC = () => {
  const verifyProduct = useStore((state) => state.verifyProduct);
  const logs = useStore((state) => state.logs);
  
  const [scanMode, setScanMode] = useState<'manual' | 'camera'>('camera');
  const [inputId, setInputId] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = () => {
    if (!inputId) {
      alert('Enter a Token ID.');
      return;
    }
    const res = verifyProduct(inputId.trim().toUpperCase());
    setResult(res);
  };

  const handleCameraScan = (decodedText: string) => {
    try {
      const data = JSON.parse(decodedText);
      if (data.token) {
        const res = verifyProduct(data.token);
        setResult(res);
      } else {
        throw new Error('Invalid QR payload');
      }
    } catch (e) {
      // If not JSON, try treating raw text as token ID
      const res = verifyProduct(decodedText.trim().toUpperCase());
      setResult(res);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="page-hero text-center">
        <div className="hl mx-auto mb-4"></div>
        <h1>Scan & Verify</h1>
        <p className="mx-auto">Enter the product's Token ID or use the camera to verify authenticity in real-time.</p>
      </div>

      <div className="scan-wrap">
        <div className="glass scan-panel">
          {/* Sub-tabs for scan mode */}
          <div className="mb-8 flex justify-center gap-2 border-b border-white/5 pb-6">
            <button
              onClick={() => setScanMode('manual')}
              className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold tracking-wider transition-all ${
                scanMode === 'manual' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Search size={14} /> MANUAL ENTRY
            </button>
            <button
              onClick={() => setScanMode('camera')}
              className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold tracking-wider transition-all ${
                scanMode === 'camera' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Camera size={14} /> CAMERA SCAN
            </button>
          </div>

          <div className="space-y-8">
            {scanMode === 'manual' ? (
              <div className="space-y-4">
                <div className="scan-hero-icon mx-auto"><Search size={32} /></div>
                <div className="scan-title">Manual Verification</div>
                <p className="text-sm text-text-3">Enter the unique Token ID found on the product packaging</p>
                <div className="scan-input-row">
                  <input 
                    type="text" 
                    placeholder="Enter Token ID (e.g. VRF-XXXX)" 
                    value={inputId}
                    onChange={(e) => setInputId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-accent outline-none transition-all"
                  />
                  <button className="btn-verify" onClick={handleVerify}>Verify</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <CameraScanner onScanSuccess={handleCameraScan} />
              </div>
            )}

            {result && (
              <div className={`result-card visible animate-in fade-in slide-in-from-top-4 ${
                result.type === 'safe' ? 'r-safe' : result.type === 'fake' ? 'r-fake' : 'r-expired'
              }`}>
                <div className="result-icon mb-4">
                  {result.type === 'safe' ? <CheckCircle2 size={44} className="text-accent" /> : 
                   result.type === 'fake' ? <XCircle size={44} className="text-danger" /> : 
                   <AlertCircle size={44} className="text-warn" />}
                </div>
                
                <h3 className={`text-xl font-bold mb-2 ${
                  result.type === 'safe' ? 'text-accent' : result.type === 'fake' ? 'text-danger' : 'text-warn'
                }`}>
                  {result.title}
                </h3>
                <p className="text-sm text-text-2 leading-relaxed mb-4">{result.message}</p>

                {result.productData && (
                  <div className="result-details space-y-3 pt-4 border-t border-white/10">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-3">Product</span>
                      <span className="text-white font-bold">{result.productData.product}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-3">Brand</span>
                      <span className="text-white font-bold">{result.productData.brand}</span>
                    </div>
                    {result.type === 'safe' && (
                      <div className="flex justify-between text-xs">
                        <span className="text-text-3">Signature</span>
                        <span className="text-accent font-mono">{result.productData.signature.slice(0, 16)}...</span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className={`flex items-center gap-2 mt-4 text-xs font-bold ${
                  result.type === 'safe' ? 'text-accent' : result.type === 'fake' ? 'text-danger' : 'text-warn'
                }`}>
                  {result.footer}
                </div>
              </div>
            )}

            <div className="log-section text-left border-t border-white/5 pt-8">
              <div className="log-label text-[10px] font-bold uppercase tracking-[1.5px] text-text-3 mb-4">Verification Intelligence Log</div>
              <div className="log-box max-h-40 overflow-y-auto rounded-xl bg-black/40 p-4 border border-white/5">
                {logs.length === 0 ? (
                  <div className="text-center py-4 text-xs text-text-3 italic">Waiting for verification activity...</div>
                ) : (
                  logs.map((log, i) => (
                    <div className="flex gap-4 text-[11px] mb-2 font-mono" key={i}>
                      <span className="text-text-3 min-w-[70px]">{log.t}</span>
                      <span className={`flex-1 ${
                        log.type === 'ok' ? 'text-accent' : log.type === 'fail' ? 'text-danger' : 'text-warn'
                      }`}>
                        {log.msg}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanTab;
