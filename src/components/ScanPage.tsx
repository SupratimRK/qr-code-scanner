import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { 
  Camera, CameraOff, AlertCircle, Link as LinkIcon, Copy, ExternalLink, ScanLine, CheckCircle2, Info, UploadCloud, FileText, Wifi, User, CalendarDays, MessageSquare, Phone, Mail, MapPin, QrCode as QrCodeIcon
} from 'lucide-react';
import { useScanHistory } from '../hooks/useScanHistory';
import { getQrContentType } from '../utils/qrUtils';
import { HistoryItem, QrContentType } from '../types';

interface ScanPageProps {
  isGetmarMode: boolean;
}

const QRCodeScannerComponent: React.FC<ScanPageProps> = ({ isGetmarMode }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addScanToHistory } = useScanHistory();

  const qrReaderId = "qr-reader-container";

  const handleScanResult = (decodedText: string) => {
    setScanResult(decodedText);
    const type = getQrContentType(decodedText);
    addScanToHistory({ data: decodedText, type, isGetmarScan: isGetmarMode });
    
    // Auto-redirect for getmar mode web links
    if (isGetmarMode && type === 'url') {
      try {
        // Validate URL before opening
        new URL(decodedText);
        // Use small timeout to ensure scan result is saved before redirecting
        setTimeout(() => openURL(decodedText), 300);
      } catch (err) {
        console.error('Invalid URL format in auto-redirect:', err);
        setError("Invalid URL format detected.");
      }
    }
    
    setIsScanning(false); // Stop scanning after success
  };

  const startScanner = useCallback(async () => {
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode(qrReaderId);
    }
    
    const qrCode = html5QrCodeRef.current;
    if (qrCode && qrCode.getState() === Html5QrcodeScannerState.SCANNING) {
      return; // Already scanning
    }

    setIsLoading(true);
    setError(null);
    setScanResult(null);

    try {
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setError("No cameras found on this device.");
        setIsLoading(false);
        return;
      }
      
      await qrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.max(Math.floor(minEdge * 0.7), 50);
            return { width: qrboxSize, height: qrboxSize };
          },
          aspectRatio: 1.0
          // Note: rememberLastUsedCamera and supportedScanTypes are not supported in this version
        },
        (decodedText) => {
          handleScanResult(decodedText);
          qrCode.stop().catch(console.error);
        },
        (errorMessage) => {
          // This callback can be noisy, only set persistent errors
          if (!errorMessage.includes("QR code parse error") && !errorMessage.includes("NotFoundException")) {
             console.warn("QR Scan Error (non-critical):", errorMessage);
          }
        }
      );
      // No need to set isScanning again as it's already set in toggleScanner
    } catch (err: any) {
      console.error("Camera start error:", err);
      if (err.name === "NotAllowedError") {
        setError("Camera access denied. Please allow camera permissions in your browser settings.");
      } else if (err.name === "NotFoundError") {
        setError("No suitable camera found. Ensure your camera is connected and not in use by another application.");
      } else {
        setError(`Failed to start camera: ${err.message || 'Unknown error'}`);
      }
      setIsScanning(false);
    } finally {
      setIsLoading(false);
    }
  }, [addScanToHistory, isGetmarMode]);

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error("Error stopping scanner:", err);
        // setError("Failed to stop scanner. Please refresh the page.");
      }
    }
    setIsScanning(false);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    return () => { // Cleanup on unmount
      stopScanner();
    };
  }, [stopScanner]);

  const handleFileScan = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setScanResult(null);
    stopScanner(); // Stop camera if it's running

    if (!html5QrCodeRef.current) {
      // For file scanning, we don't need a viewfinder element
      // Create a temporary hidden div for the scanner to use
      const tempElement = document.createElement('div');
      tempElement.id = 'temp-file-scan-element';
      tempElement.style.display = 'none';
      document.body.appendChild(tempElement);
      
      html5QrCodeRef.current = new Html5Qrcode('temp-file-scan-element');
      
      // We'll clean up this element in the finally block
    }
    
    try {
      const decodedText = await html5QrCodeRef.current.scanFile(file, false);
      // Use the same handler for file scanning to maintain consistency
      handleScanResult(decodedText);
    } catch (err: any) {
      console.error("File scan error:", err);
      setError(`Could not scan QR code from image. ${err.message || 'Ensure the image is clear and contains a valid QR code.'}`);
    }    finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
      // Clean up the temporary element
      const elem = document.getElementById('temp-file-scan-element');
      if (elem) document.body.removeChild(elem);
    }
  };

  const toggleScanner = () => {
    if (isScanning) {
      stopScanner();
    } else {
      // Set isScanning first so the element exists when startScanner is called
      setIsScanning(true);
      setTimeout(() => {
        startScanner();
      }, 100); // Small delay to ensure DOM is updated
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setError("Failed to copy text to clipboard.");
    }
  };

  const openURL = (url: string) => {
    try {
      new URL(url); // Validate URL
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      setError("Invalid URL format.");
    }
  };

  const getIconForType = (type: QrContentType) => {
    switch (type) {
      case 'url': return <LinkIcon className="w-5 h-5 mr-2" />;
      case 'wifi': return <Wifi className="w-5 h-5 mr-2" />;
      case 'contact': return <User className="w-5 h-5 mr-2" />;
      case 'event': return <CalendarDays className="w-5 h-5 mr-2" />;
      case 'sms': return <MessageSquare className="w-5 h-5 mr-2" />;
      case 'tel': return <Phone className="w-5 h-5 mr-2" />;
      case 'email': return <Mail className="w-5 h-5 mr-2" />;
      case 'geo': return <MapPin className="w-5 h-5 mr-2" />;
      default: return <FileText className="w-5 h-5 mr-2" />;
    }
  };

  const buttonBaseClass = "px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-bg_dark";
  const primaryButtonClass = `${buttonBaseClass} ${isGetmarMode ? 'bg-getmar dark:bg-getmar-dark hover:bg-getmar-light dark:hover:bg-getmar text-white focus:ring-getmar' : 'bg-primary dark:bg-primary-dark hover:bg-primary-light dark:hover:bg-primary text-white focus:ring-primary'}`;
  const secondaryButtonClass = `${buttonBaseClass} bg-gray-200 dark:bg-gray-700 text-text_light_primary dark:text-text_dark_primary hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-400`;

  return (
    <div className="flex flex-col items-center w-full p-4 md:p-6 space-y-6">
      <div className="w-full max-w-lg text-center">
        <QrCodeIcon className={`w-16 h-16 mx-auto mb-3 ${isGetmarMode ? 'text-getmar-dark dark:text-getmar' : 'text-primary dark:text-primary-light'}`} />
        <h2 className="text-2xl font-semibold text-text_light_primary dark:text-text_dark_primary mb-2">
          {isGetmarMode ? 'Certificate Verification Scanner' : 'Scan QR Codes Instantly'}
        </h2>
        <p className="text-text_light_secondary dark:text-text_dark_secondary">
          {isGetmarMode 
            ? 'Scan the QR code on the certificate to verify its authenticity.'
            : 'Use your camera or upload an image to scan QR codes.'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button onClick={toggleScanner} className={`${primaryButtonClass} w-full`} disabled={isLoading}>
          {isLoading && isScanning ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : (isScanning ? <CameraOff size={20} /> : <Camera size={20} />)}
          {isLoading && isScanning ? 'Stopping...' : (isLoading ? 'Starting...' : (isScanning ? 'Stop Camera' : 'Start Camera'))}
        </button>
        <button onClick={() => fileInputRef.current?.click()} className={`${secondaryButtonClass} w-full`} disabled={isLoading || isScanning}>
          <UploadCloud size={20} /> Scan from Image
        </button>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileScan} className="hidden" />
      </div>

      {error && (
        <div className="w-full max-w-md p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg flex items-center gap-3 shadow-md">
          <AlertCircle size={24} />
          <span>{error}</span>
        </div>
      )}

      {isScanning && !scanResult && (
        <div className="w-full max-w-md p-4 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg flex items-center gap-3 shadow-md">
          <Info size={24} />
          <span>Position the QR code within the camera view. Scanner is active.</span>
        </div>
      )}
      
      {isScanning ? (
        <div id={qrReaderId} className="w-full max-w-md aspect-square rounded-xl overflow-hidden shadow-xl bg-gray-200 dark:bg-gray-800 relative">
          <div className="scanline"></div>
        </div>
      ) : (
        <div className="w-full max-w-md aspect-square rounded-xl overflow-hidden shadow-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="text-center p-6">
            <Camera size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-text_light_secondary dark:text-text_dark_secondary">
              Start the camera to scan a QR code
            </p>
          </div>
        </div>
      )}


      {scanResult && (
        <div className="w-full max-w-md mt-6 p-5 bg-surface_light dark:bg-surface_dark rounded-xl shadow-card border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <ScanLine size={24} className="text-green-500" />
            <h3 className="text-xl font-semibold text-text_light_primary dark:text-text_dark_primary">
              {isGetmarMode ? 'Certificate Data' : 'Scan Result'}
            </h3>
          </div>
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 break-all text-sm text-text_light_secondary dark:text-text_dark_secondary">
            {scanResult}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => copyToClipboard(scanResult)}
              className={`px-4 py-2 text-sm rounded-md flex items-center gap-2 transition-colors ${
                copySuccess 
                ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200' 
                : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-text_light_primary dark:text-text_dark_primary'
              }`}
            >
              {copySuccess ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              {copySuccess ? 'Copied!' : 'Copy'}
            </button>
            {getQrContentType(scanResult) === 'url' && (
              <button
                onClick={() => openURL(scanResult)}
                className={`px-4 py-2 text-sm rounded-md flex items-center gap-2 transition-colors ${isGetmarMode ? 'bg-getmar dark:bg-getmar-dark text-white hover:bg-getmar-light dark:hover:bg-getmar' : 'bg-primary dark:bg-primary-dark text-white hover:bg-primary-light dark:hover:bg-primary'}`}
              >
                <ExternalLink size={18} /> Open Link
              </button>
            )}
          </div>
          <div className="mt-4 flex items-center text-xs text-gray-500 dark:text-gray-400">
            {getIconForType(getQrContentType(scanResult))}
            <span>Type: {getQrContentType(scanResult).toUpperCase()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeScannerComponent; // Renamed to avoid conflict if App.tsx also has QRCodeScanner
