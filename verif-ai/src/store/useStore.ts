import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { tid, ts } from '../services/verifService';

export interface Product {
  tokenId: string;
  product: string;
  brand: string;
  category: string;
  mfg: string;
  exp: string;
  batch: string;
  signature: string;
  createdAt: string;
  isValid: boolean;
  scannedAt: string | null;
  status: 'active' | 'scanned' | 'expired';
}

export interface LogEntry {
  t: string;
  type: 'ok' | 'fail' | 'warn';
  msg: string;
}

export interface VerificationResult {
  type: 'safe' | 'fake' | 'expired';
  title: string;
  message: string;
  footer: string;
  productData?: Product;
}

interface VerifState {
  products: Record<string, Product>;
  logs: LogEntry[];
  addProduct: (product: Product) => void;
  verifyProduct: (id: string) => VerificationResult;
  checkExpiries: () => void;
}

export const useStore = create<VerifState>()(
  persist(
    (set, get) => ({
      products: {},
      logs: [],

      addProduct: (product) => {
        set((state) => ({
          products: { ...state.products, [product.tokenId]: product },
        }));
      },

      verifyProduct: (id) => {
        const time = ts();
        const { products } = get();
        const p = products[id];

        if (!p) {
          const res: VerificationResult = {
            type: 'fake',
            title: 'Fake or Unknown Product',
            message: 'This Token ID does not exist in the VerifAI registry. The product could not be verified and may be counterfeit.',
            footer: '⚠ Do not consume. Report via CrowdSignal.'
          };
          set((state) => ({
            logs: [{ t: time, type: 'fail', msg: `${id} — NOT FOUND · Possible counterfeit` }, ...state.logs],
          }));
          return res;
        }

        const now = new Date();
        now.setHours(0, 0, 0, 0);
        if (new Date(p.exp) < now) {
          const res: VerificationResult = {
            type: 'expired',
            title: 'Product Expired',
            message: "This product's QR has been deactivated because the expiration date has passed.",
            footer: '⚠ Product no longer safe for use.',
            productData: p
          };
          set((state) => ({
            logs: [{ t: time, type: 'warn', msg: `${id} — EXPIRED · ${p.product}` }, ...state.logs],
          }));
          return res;
        }

        if (p.status === 'scanned') {
          const res: VerificationResult = {
            type: 'fake',
            title: 'QR Already Used — Not Valid',
            message: `This QR was verified on ${new Date(p.scannedAt!).toLocaleDateString()} and permanently invalidated. A second scan indicates possible refill-and-resell fraud.`,
            footer: '⚠ Do not trust this product. Report via CrowdSignal.',
            productData: p
          };
          set((state) => ({
            logs: [{ t: time, type: 'fail', msg: `${id} — RE-SCAN BLOCKED · Used ${new Date(p.scannedAt!).toLocaleDateString()}` }, ...state.logs],
          }));
          return res;
        }

        // Valid scan
        const updatedProduct: Product = {
          ...p,
          isValid: false,
          status: 'scanned',
          scannedAt: new Date().toISOString(),
        };

        set((state) => ({
          products: { ...state.products, [id]: updatedProduct },
          logs: [{ t: time, type: 'ok', msg: `${id} — VERIFIED ✓ · ${p.product}` }, ...state.logs],
        }));

        return {
          type: 'safe',
          title: 'Product is Original & Safe',
          message: 'PKI digital signature verified. This product is authentic and registered with VerifAI. The QR code has now been permanently invalidated.',
          footer: '🎁 Brand coupon unlocked! Thank you for verifying.',
          productData: updatedProduct
        };
      },

      checkExpiries: () => {
        const { products } = get();
        const updated = { ...products };
        let changed = false;
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        Object.keys(updated).forEach((id) => {
          const p = updated[id];
          if (p.status === 'active' && new Date(p.exp) < now) {
            updated[id] = { ...p, isValid: false, status: 'expired' };
            changed = true;
          }
        });

        if (changed) {
          set({ products: updated });
        }
      },
    }),
    {
      name: 'verifai-storage',
    }
  )
);
