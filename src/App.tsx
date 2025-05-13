import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ScanPage from './components/ScanPage'; // Updated import
import HistoryPage from './components/HistoryPage';
import { useTheme } from './hooks/useTheme';
import { ScanSearch, History } from 'lucide-react';

type ActiveTab = 'scan' | 'history';

function App() {
  useTheme(); // Initialize theme hook
  const [activeTab, setActiveTab] = useState<ActiveTab>('scan');
  const [isGetmarMode, setIsGetmarMode] = useState(false);
  const [appName, setAppName] = useState('QR Code Suite');

  useEffect(() => {
    const getmarParam = new URLSearchParams(window.location.search).get('id') === 'getmar';
    setIsGetmarMode(getmarParam);
    const newTitle = getmarParam ? 'Certificate Verification' : 'QR Code Suite';
    document.title = newTitle;
    setAppName(newTitle);
  }, []);

  const navButtonBase = "flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 dark:focus:ring-offset-bg_dark";
  const navButtonActive = (isActive: boolean, isGetmar: boolean) => 
    isActive 
      ? (isGetmar ? 'bg-getmar text-white shadow-md focus:ring-getmar' : 'bg-primary text-white shadow-md focus:ring-primary')
      : 'text-text_light_secondary dark:text-text_dark_secondary hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-gray-400';

  return (
    <div className="min-h-screen flex flex-col bg-bg_light dark:bg-bg_dark">
      <Header isGetmarMode={isGetmarMode} appName={appName} />

      <nav className="bg-surface_light dark:bg-surface_dark shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center space-x-2 sm:space-x-4 py-2">
          <button
            onClick={() => setActiveTab('scan')}
            className={`${navButtonBase} ${navButtonActive(activeTab === 'scan', isGetmarMode)}`}
            aria-current={activeTab === 'scan' ? 'page' : undefined}
          >
            <ScanSearch size={20} />
            <span>{isGetmarMode ? 'Verify Certificate' : 'Scan QR'}</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`${navButtonBase} ${navButtonActive(activeTab === 'history', isGetmarMode)}`}
            aria-current={activeTab === 'history' ? 'page' : undefined}
          >
            <History size={20} />
            <span>History</span>
          </button>
        </div>
      </nav>

      <main className="flex-grow max-w-5xl w-full mx-auto px-0 sm:px-2 lg:px-4 py-6">
        {activeTab === 'scan' && <ScanPage isGetmarMode={isGetmarMode} />}
        {activeTab === 'history' && <HistoryPage />}
      </main>

      <Footer />
    </div>
  );
}

export default App;
