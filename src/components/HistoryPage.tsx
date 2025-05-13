import React, { useState } from 'react';
import { useScanHistory } from '../hooks/useScanHistory';
import { HistoryItem, QrContentType } from '../types';
import { getQrContentType, formatTimestamp } from '../utils/qrUtils';
import { Trash2, Copy, ExternalLink, AlertTriangle, FileText, Wifi, User, CalendarDays, MessageSquare, Phone, Mail, MapPin, ShieldCheck, Search } from 'lucide-react';

const HistoryPage: React.FC = () => {
  const { history, deleteHistoryItem, clearHistory } = useScanHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Consider adding a small visual feedback like a toast or temporary icon change
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy text.');
    }
  };

  const openURL = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getIconForType = (type: QrContentType, isGetmarScan?: boolean) => {
    if (isGetmarScan) return <ShieldCheck className="w-5 h-5 text-getmar dark:text-getmar-light flex-shrink-0" />;
    switch (type) {
      case 'url': return <ExternalLink className="w-5 h-5 text-blue-500 flex-shrink-0" />;
      case 'wifi': return <Wifi className="w-5 h-5 text-green-500 flex-shrink-0" />;
      case 'contact': return <User className="w-5 h-5 text-purple-500 flex-shrink-0" />;
      case 'event': return <CalendarDays className="w-5 h-5 text-indigo-500 flex-shrink-0" />;
      case 'sms': return <MessageSquare className="w-5 h-5 text-yellow-500 flex-shrink-0" />;
      case 'tel': return <Phone className="w-5 h-5 text-pink-500 flex-shrink-0" />;
      case 'email': return <Mail className="w-5 h-5 text-teal-500 flex-shrink-0" />;
      case 'geo': return <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0" />;
      default: return <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />;
    }
  };

  const filteredHistory = history.filter(item => 
    item.data.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (history.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <FileText size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
        <h2 className="text-xl font-semibold text-text_light_primary dark:text-text_dark_primary mb-2">No Scan History</h2>
        <p className="text-text_light_secondary dark:text-text_dark_secondary">Your scanned QR codes will appear here.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold text-text_light_primary dark:text-text_dark_primary">Scan History</h2>
        {history.length > 0 && (
          <button
            onClick={() => setShowConfirmClear(true)}
            className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 transition-colors shadow-md"
            aria-label="Clear all scan history"
          >
            <Trash2 size={16} /> Clear All
          </button>
        )}
      </div>

      {showConfirmClear && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface_light dark:bg-surface_dark p-6 rounded-xl shadow-xl max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={24} className="text-red-500" />
              <h3 className="text-lg font-semibold text-text_light_primary dark:text-text_dark_primary">Confirm Clear History</h3>
            </div>
            <p className="text-sm text-text_light_secondary dark:text-text_dark_secondary mb-6">
              Are you sure you want to delete all scan history? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-text_light_primary dark:text-text_dark_primary rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { clearHistory(); setShowConfirmClear(false); }}
                className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="relative">
        <input 
          type="text"
          placeholder="Search history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-surface_light dark:bg-surface_dark rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-transparent outline-none transition-colors"
        />
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
      </div>

      {filteredHistory.length === 0 && searchTerm && (
         <div className="text-center py-8">
            <Search size={36} className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-text_light_secondary dark:text-text_dark_secondary">No results found for "{searchTerm}".</p>
        </div>
      )}

      <ul className="space-y-4">
        {filteredHistory.map((item: HistoryItem) => (
          <li key={item.id} className="bg-surface_light dark:bg-surface_dark p-4 rounded-xl shadow-card border border-gray-200 dark:border-gray-600 hover:shadow-card-hover transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-grow min-w-0">
                {getIconForType(item.type, item.isGetmarScan)}
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium text-text_light_primary dark:text-text_dark_primary truncate" title={item.data}>
                    {item.isGetmarScan && <span className="font-bold text-getmar dark:text-getmar-light mr-1">[CERTIFICATE]</span>}
                    {item.data}
                  </p>
                  <p className="text-xs text-text_light_secondary dark:text-text_dark_secondary mt-1">
                    {formatTimestamp(item.timestamp)} - {item.type.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {item.type === 'url' && (
                  <button
                    onClick={() => openURL(item.data)}
                    className="p-1.5 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                    title="Open Link"
                  >
                    <ExternalLink size={18} />
                  </button>
                )}
                <button
                  onClick={() => copyToClipboard(item.data)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Copy Data"
                >
                  <Copy size={18} />
                </button>
                <button
                  onClick={() => deleteHistoryItem(item.id)}
                  className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
                  title="Delete Item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryPage;
