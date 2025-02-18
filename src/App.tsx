import React, { useEffect } from 'react';
import QRCodeScanner from './QRCodeScanner';
import { QrCode, Heart } from 'lucide-react';

function App() {
  const isGetmarMode = new URLSearchParams(window.location.search).get('id') === 'getmar';

  useEffect(() => {
    document.title = isGetmarMode ? 'Certificate Verification' : 'QR Code Scanner';
  }, [isGetmarMode]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <QrCode className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              {isGetmarMode ? 'Certificate Verification' : 'QR Code Scanner'}
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <QRCodeScanner />
        </div>
      </main>

      <footer className="bg-white shadow-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <span>Crafted with</span>
            <Heart className="h-4 w-4 text-blue-600 fill-current" />
            <span>by</span>
            <span className="font-medium">Supratim</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;