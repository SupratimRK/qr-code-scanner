import { useState, useEffect, useCallback } from 'react';
import { HistoryItem } from '../types';

const HISTORY_STORAGE_KEY = 'qrScanHistory';

export const useScanHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory));
      } catch (error) {
        console.error("Failed to parse scan history:", error);
        localStorage.removeItem(HISTORY_STORAGE_KEY); // Clear corrupted data
      }
    }
  }, []);

  const updateLocalStorage = (newHistory: HistoryItem[]) => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
  };

  const addScanToHistory = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    setHistory((prevHistory) => {
      const newScan: HistoryItem = {
        ...item,
        id: Date.now().toString() + Math.random().toString(36).substring(2,9), // more unique id
        timestamp: Date.now(),
      };
      const updatedHistory = [newScan, ...prevHistory].slice(0, 50); // Keep last 50 scans
      updateLocalStorage(updatedHistory);
      return updatedHistory;
    });
  }, []);

  const deleteHistoryItem = useCallback((id: string) => {
    setHistory((prevHistory) => {
      const updatedHistory = prevHistory.filter((item) => item.id !== id);
      updateLocalStorage(updatedHistory);
      return updatedHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    updateLocalStorage([]);
  }, []);

  return { history, addScanToHistory, deleteHistoryItem, clearHistory };
};
