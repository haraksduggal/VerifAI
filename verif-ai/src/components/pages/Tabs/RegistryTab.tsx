import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useStore, Product } from '../../../store/useStore';
import { fd } from '../../../services/verifService';
import Modal from '../../common/Modal';

const RegistryTab: React.FC = () => {
  const products = useStore((state) => state.products);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const stats = Object.values(products).reduce((acc, p) => {
    acc.total++;
    acc[p.status]++;
    return acc;
  }, { total: 0, active: 0, scanned: 0, expired: 0 });

  const productList = Object.values(products).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).reverse();

  const handleRowClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const payload = selectedProduct ? JSON.stringify({
    token: selectedProduct.tokenId,
    product: selectedProduct.product,
    brand: selectedProduct.brand,
    category: selectedProduct.category,
    batch: selectedProduct.batch,
    mfg: selectedProduct.mfg,
    exp: selectedProduct.exp,
    valid: selectedProduct.isValid,
    status: selectedProduct.status,
    sig: selectedProduct.signature.slice(0, 32)
  }) : '';

  return (
    <div className="flex flex-col gap-8">
      <div className="page-hero">
        <div className="hl"></div>
        <h1>Product Registry</h1>
        <p>Real-time overview of all registered units and their authentication lifecycle.</p>
      </div>

      <div className="metrics-grid">
        <div className="glass metric-card mc-total">
          <div className="metric-val">{stats.total}</div>
          <div className="metric-lbl">Total Units</div>
        </div>
        <div className="glass metric-card mc-active" style={{"--accent": "var(--accent)"} as any}>
          <div className="metric-val" style={{color: 'var(--accent)'}}>{stats.active}</div>
          <div className="metric-lbl">Active</div>
        </div>
        <div className="glass metric-card mc-scanned" style={{"--accent": "var(--warn)"} as any}>
          <div className="metric-val" style={{color: 'var(--warn)'}}>{stats.scanned}</div>
          <div className="metric-lbl">Scanned</div>
        </div>
        <div className="glass metric-card mc-expired" style={{"--accent": "var(--danger)"} as any}>
          <div className="metric-val" style={{color: 'var(--danger)'}}>{stats.expired}</div>
          <div className="metric-lbl">Expired</div>
        </div>
      </div>

      <div className="glass table-wrap">
        <div className="table-header">Registered Units</div>
        <div style={{overflowX: 'auto'}}>
          <table className="w-full">
            <thead>
              <tr>
                <th>Token ID</th>
                <th>Product</th>
                <th>Brand</th>
                <th>Mfg Date</th>
                <th>Exp Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {productList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-row text-center py-20 text-white/40">
                    No units registered yet. Generate a QR to begin.
                  </td>
                </tr>
              ) : (
                productList.map(p => (
                  <tr 
                    key={p.tokenId} 
                    onClick={() => handleRowClick(p)}
                    className="cursor-pointer transition-all hover:bg-white/5 hover:scale-[1.002] active:scale-[0.998]"
                  >
                    <td className="mono font-mono text-accent">{p.tokenId}</td>
                    <td className="font-bold text-white">{p.product}</td>
                    <td>{p.brand}</td>
                    <td>{fd(p.mfg)}</td>
                    <td>{fd(p.exp)}</td>
                    <td>
                      <span className={`badge ${p.status}`}>
                        ● {p.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)}
        title="Product Authentication Profile"
      >
        {selectedProduct && (
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="flex flex-col items-center gap-6">
              <div className={`qr-frame relative bg-white p-4 rounded-xl shadow-2xl transition-all ${!selectedProduct.isValid ? 'dead' : ''}`}>
                <QRCodeCanvas 
                  value={payload} 
                  size={200}
                  bgColor={"#ffffff"}
                  fgColor={"#0a0e1a"}
                  level={"L"}
                />
                {!selectedProduct.isValid && (
                  <div className="absolute inset-0 flex items-center justify-center bg-danger/90 text-white font-display font-bold tracking-[4px] rotate-[-4deg] rounded-xl text-lg animate-in zoom-in-125">
                    INVALIDATED
                  </div>
                )}
              </div>
              <span className={`badge ${selectedProduct.status} text-sm py-2 px-6`}>
                ● {selectedProduct.status.toUpperCase()}
              </span>
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Token ID" value={selectedProduct.tokenId} mono />
                <DetailRow label="Batch ID" value={selectedProduct.batch} mono />
                <DetailRow label="Manufactured" value={fd(selectedProduct.mfg)} />
                <DetailRow label="Expires" value={fd(selectedProduct.exp)} />
              </div>
              
              <div className="space-y-4 pt-4 border-t border-white/5">
                <DetailRow label="Product" value={selectedProduct.product} large />
                <DetailRow label="Brand" value={selectedProduct.brand} />
                <DetailRow label="Category" value={selectedProduct.category} />
              </div>

              <div className="pt-4 border-t border-white/5">
                <label className="text-[10px] uppercase tracking-[1.5px] text-white/40 block mb-2 font-bold">PKI Digital Signature</label>
                <div className="font-mono text-[11px] text-accent/80 bg-accent/5 p-3 rounded-lg border border-accent/10 break-all leading-relaxed">
                  {selectedProduct.signature}
                </div>
              </div>

              {selectedProduct.scannedAt && (
                <div className="rounded-xl bg-accent/10 p-4 border border-accent/20">
                  <DetailRow label="Verified On" value={new Date(selectedProduct.scannedAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })} color="text-accent" />
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const DetailRow: React.FC<{ label: string, value: string, mono?: boolean, large?: boolean, color?: string }> = ({ label, value, mono, large, color }) => (
  <div className="space-y-1">
    <label className="text-[10px] uppercase tracking-[1.5px] text-white/40 block font-bold">{label}</label>
    <div className={`${mono ? 'font-mono text-accent' : 'text-white'} ${large ? 'text-lg font-bold' : 'text-sm'} ${color || ''}`}>
      {value}
    </div>
  </div>
);

export default RegistryTab;
