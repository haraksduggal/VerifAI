import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, CameraOff, Repeat } from 'lucide-react';

interface CameraScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onScanSuccess, onScanError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const regionId = 'qr-reader-target';

  useEffect(() => {
    scannerRef.current = new Html5Qrcode(regionId);
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    if (!scannerRef.current) return;

    try {
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          onScanSuccess(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          if (onScanError) onScanError(errorMessage);
        }
      );
      setIsScanning(true);
      setHasPermission(true);
    } catch (err) {
      console.error("Camera detection error:", err);
      setHasPermission(false);
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
      setIsScanning(false);
    }
  };

  const switchCamera = async () => {
    if (scannerRef.current?.isScanning) {
      await stopScanning();
      // Simple toggle logic for demo - in reality, would enumerate devices
      startScanning();
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-white/10 bg-black/40 shadow-2xl">
        <div id={regionId} className="aspect-square w-full" />
        
        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 p-8 text-center backdrop-blur-md">
            <div className="rounded-2xl bg-accent/20 p-4 text-accent ring-1 ring-accent/30">
              <Camera size={48} />
            </div>
            {hasPermission === false ? (
              <p className="text-danger">Camera access denied. Please check permissions.</p>
            ) : (
              <>
                <h3 className="font-display text-xl font-bold text-white">Camera Ready</h3>
                <p className="text-sm text-white/60">Align the VerifAI QR code within the frame for instant verification.</p>
                <button onClick={startScanning} className="btn-primary mt-2">
                  Enable Camera
                </button>
              </>
            )}
          </div>
        )}

        {isScanning && (
          <div className="pointer-events-none absolute inset-0 border-[40px] border-black/40">
            <div className="h-full w-full border-2 border-accent/40 bg-transparent ring-[1000px] ring-black/40">
              <div className="absolute left-[-2px] top-[-2px] h-8 w-8 border-l-4 border-t-4 border-accent" />
              <div className="absolute right-[-2px] top-[-2px] h-8 w-8 border-r-4 border-t-4 border-accent" />
              <div className="absolute bottom-[-2px] left-[-2px] h-8 w-8 border-b-4 border-l-4 border-accent" />
              <div className="absolute bottom-[-2px] right-[-2px] h-8 w-8 border-b-4 border-r-4 border-accent" />
            </div>
            <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-accent/30 shadow-[0_0_15px_rgba(0,240,160,0.5)] animate-pulse" />
          </div>
        )}
      </div>

      {isScanning && (
        <div className="flex gap-4">
          <button onClick={stopScanning} className="flex items-center gap-2 rounded-xl bg-white/5 px-6 py-3 text-sm font-bold text-white/60 transition-all hover:bg-white/10 hover:text-white ring-1 ring-white/10">
            <CameraOff size={18} /> Stop
          </button>
          <button onClick={switchCamera} className="flex items-center gap-2 rounded-xl bg-white/5 px-6 py-3 text-sm font-bold text-white/60 transition-all hover:bg-white/10 hover:text-white ring-1 ring-white/10">
            <Repeat size={18} /> Switch
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraScanner;
