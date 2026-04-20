import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Package, QrCode } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import { fd, tid, mksig } from '../../../services/verifService';

const GenerateTab: React.FC = () => {
  const addProduct = useStore((state) => state.addProduct);
  const [formData, setFormData] = useState({
    product: '',
    brand: '',
    category: 'Oral Care',
    mfg: new Date().toISOString().split('T')[0],
    exp: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
    batch: ''
  });

  const [lastGenerated, setLastGenerated] = useState<any>(null);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id.replace('inp-', '')]: value }));
  };

  const handleGenerate = () => {
    if (!formData.product || !formData.brand || !formData.mfg || !formData.exp) {
      alert('Please fill all required fields.');
      return;
    }

    const tokenId = tid();
    const signature = mksig();
    const productData = {
      tokenId,
      ...formData,
      batch: formData.batch || 'N/A',
      signature,
      createdAt: new Date().toISOString(),
      isValid: true,
      scannedAt: null,
      status: 'active' as const
    };

    addProduct(productData);
    setLastGenerated(productData);
  };

  const payload = lastGenerated ? JSON.stringify({
    token: lastGenerated.tokenId,
    product: lastGenerated.product,
    brand: lastGenerated.brand,
    category: lastGenerated.category,
    batch: lastGenerated.batch,
    mfg: lastGenerated.mfg,
    exp: lastGenerated.exp,
    valid: lastGenerated.isValid,
    status: lastGenerated.status,
    sig: lastGenerated.signature.slice(0, 32)
  }) : '';

  return (
    <div className="flex flex-col gap-8">
      <div className="page-hero">
        <div className="hl"></div>
        <h1>Generate Signed QR</h1>
        <p>Register a product unit with a cryptographically signed one-time QR code. Each token is unique — and dies after first scan.</p>
      </div>
      
      <div className="gen-layout">
        <div className="glass form-panel">
          <div className="section-label">
            <div className="section-icon"><Package size={18} /></div> 
            Product Information
          </div>
          
          <div className="field">
            <label>Product Name</label>
            <input 
              type="text" 
              id="inp-product" 
              placeholder="e.g. Sensodyne Fresh Gel 150g"
              value={formData.product}
              onChange={handleInput}
            />
          </div>
          
          <div className="field">
            <label>Brand</label>
            <input 
              type="text" 
              id="inp-brand" 
              placeholder="e.g. GSK Consumer Healthcare"
              value={formData.brand}
              onChange={handleInput}
            />
          </div>
          
          <div className="field">
            <label>Category</label>
            <select id="inp-category" value={formData.category} onChange={handleInput}>
              <option>Oral Care</option>
              <option>Dairy</option>
              <option>Beverages</option>
              <option>Personal Care</option>
              <option>Packaged Food</option>
              <option>Other</option>
            </select>
          </div>
          
          <div className="field-row">
            <div className="field">
              <label>Manufacturing Date</label>
              <input type="date" id="inp-mfg" value={formData.mfg} onChange={handleInput} />
            </div>
            <div className="field">
              <label>Expiration Date</label>
              <input type="date" id="inp-exp" value={formData.exp} onChange={handleInput} />
            </div>
          </div>
          
          <div className="field">
            <label>Batch ID <span style={{color:'var(--text-3)', fontWeight:400, textTransform: 'none', letterSpacing: 0}}>(optional)</span></label>
            <input 
              type="text" 
              id="inp-batch" 
              placeholder="e.g. BATCH-2026-04A"
              value={formData.batch}
              onChange={handleInput}
            />
          </div>
          
          <button className="btn-primary" onClick={handleGenerate}>
            Generate Signed QR Code →
          </button>
        </div>

        <div className="glass qr-panel">
          {!lastGenerated ? (
            <div className="qr-empty">
              <div className="qr-empty-icon"><QrCode size={48} /></div>
              <span>Fill details & generate</span>
            </div>
          ) : (
            <div className="qr-live">
              <div className={`qr-frame ${!lastGenerated.isValid ? 'dead' : ''}`}>
                <QRCodeCanvas 
                  value={payload} 
                  size={192}
                  bgColor={"#ffffff"}
                  fgColor={"#0a0e1a"}
                  level={"L"}
                />
              </div>
              
              <div className="qr-badges">
                <span className={`badge ${lastGenerated.status}`}>
                  ● {lastGenerated.status.toUpperCase()}
                </span>
                <span className={`badge ${lastGenerated.isValid ? 'valid' : 'invalid'}`}>
                  {lastGenerated.isValid ? '✓ VALID' : '✗ INVALID'}
                </span>
              </div>
              
              <div className="qr-info">
                <div className="info-row"><span className="il">Token ID</span><span className="iv">{lastGenerated.tokenId}</span></div>
                <div className="info-row"><span className="il">Product</span><span className="iv">{lastGenerated.product}</span></div>
                <div className="info-row"><span className="il">Brand</span><span className="iv">{lastGenerated.brand}</span></div>
                <div className="info-row"><span className="il">Mfg Date</span><span className="iv">{fd(lastGenerated.mfg)}</span></div>
                <div className="info-row"><span className="il">Exp Date</span><span className="iv">{fd(lastGenerated.exp)}</span></div>
                <div className="qr-payload-code mt-4">{payload}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateTab;
