import React, { useEffect, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { 
  Camera, 
  CameraOff, 
  AlertCircle, 
  Link, 
  Copy, 
  ExternalLink,
  ScanLine,
  CheckCircle2,
  Info,
  MousePointerClick,
  QrCode
} from 'lucide-react';

interface ScannerState {
  isScanning: boolean;
  error: string | null;
  lastResult: string | null;
  copySuccess: boolean;
}

const QRCodeScanner: React.FC = () => {
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [state, setState] = useState<ScannerState>({
    isScanning: false,
    error: null,
    lastResult: null,
    copySuccess: false
  });

  const isGetmarMode = new URLSearchParams(window.location.search).get('id') === 'getmar';

  // Check for secure context (HTTPS or localhost)
  useEffect(() => {
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      console.warn('Camera access requires a secure context (HTTPS or localhost).');
    }
  }, []);

  const handleScanSuccess = useCallback((decodedText: string) => {
    setState(prev => ({ ...prev, lastResult: decodedText, error: null }));
  }, []);

  const handleScanError = useCallback((error: string) => {
    console.error('QR Code scan error:', error);
    if (error.includes('NotAllowedError')) {
      setState(prev => ({ ...prev, error: 'Camera access denied. Please allow camera access and try again.' }));
    } else if (error.includes('NotFoundError')) {
      setState(prev => ({ ...prev, error: 'No camera found. Please ensure your device has a camera.' }));
    } else if (error.includes('NotReadableError')) {
      setState(prev => ({ ...prev, error: 'Camera not readable. Please try restarting your browser.' }));
    } else {
      setState(prev => ({ ...prev, error: 'Failed to access camera. Please check camera permissions.' }));
    }
  }, []);

  useEffect(() => {
    // Initialize scanner only if scanning is enabled
    if (!scanner && state.isScanning) {
      const qrScanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2,
          formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ],
          rememberLastUsedCamera: true,
          supportedScanTypes: [ Html5QrcodeScanType.SCAN_TYPE_CAMERA ]
        },
        false
      );
      setScanner(qrScanner);
      qrScanner.render(handleScanSuccess, handleScanError);
    }

    // Cleanup function to clear the scanner on unmount or when scanner stops
    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [state.isScanning, scanner, handleScanError, handleScanSuccess]);

  useEffect(() => {
    if (state.copySuccess) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, copySuccess: false }));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.copySuccess]);

  const toggleScanner = async () => {
    if (state.isScanning) {
      if (scanner) {
        await scanner.clear().catch(console.error);
        setScanner(null);
      }
      setState(prev => ({ ...prev, isScanning: false, error: null }));
    } else {
      // Starting the scanner as a result of a user click
      setState(prev => ({ ...prev, isScanning: true, error: null, lastResult: null }));
    }
  };

  const isURL = (text: string) => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setState(prev => ({ ...prev, copySuccess: true }));
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openURL = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-4">
      <div className="w-full mb-6 flex flex-col items-center">
        <QrCode className="w-12 h-12 text-blue-600 mb-2" />
        <h2 className="text-xl font-semibold text-gray-800 text-center">
          {isGetmarMode ? 'Certificate Verification' : 'Scan QR Codes Instantly'}
        </h2>
      </div>

      <button
        onClick={toggleScanner}
        className="mb-4 px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md"
      >
        {state.isScanning ? (
          <>
            <CameraOff size={20} />
            Stop Scanner
          </>
        ) : (
          <>
            <Camera size={20} />
            Start Scanner
          </>
        )}
      </button>

      {state.error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2 w-full">
          <AlertCircle size={20} />
          <span>{state.error}</span>
        </div>
      )}

      <div className="w-full">
        {state.isScanning && (
          <>
            <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg flex items-center gap-2">
              <Info size={20} />
              <span>Position the QR code within the frame to scan</span>
            </div>
            <div
              id="qr-reader"
              className="w-full rounded-lg overflow-hidden shadow-lg mb-4"
            />
          </>
        )}

        {state.lastResult && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <ScanLine size={20} className="text-green-600" />
              <h3 className="font-medium text-gray-900">Scan Successful</h3>
            </div>
            <p className="text-gray-600 break-all mb-3 bg-gray-50 p-3 rounded-lg">
              {state.lastResult}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(state.lastResult!)}
                className={`px-3 py-1.5 ${
                  state.copySuccess ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                } rounded flex items-center gap-1 hover:bg-gray-200 transition-colors`}
              >
                {state.copySuccess ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Copy size={16} />
                )}
                {state.copySuccess ? 'Copied!' : 'Copy'}
              </button>
              {isURL(state.lastResult) && (
                <button
                  onClick={() => openURL(state.lastResult!)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded flex items-center gap-1 hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink size={16} />
                  Open URL
                </button>
              )}
            </div>
          </div>
        )}

        {!state.isScanning && !state.error && !state.lastResult && (
          <div className="text-center text-gray-600 flex flex-col items-center gap-2">
            <MousePointerClick className="w-8 h-8 text-gray-400" />
            <span>
              {isGetmarMode 
                ? 'Scan QR code on the certificate to verify Certificate'
                : 'Click the button above to start scanning QR codes'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeScanner;
