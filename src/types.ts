export type QrContentType = 'url' | 'text' | 'wifi' | 'contact' | 'event' | 'sms' | 'tel' | 'email' | 'geo' | 'unknown';

export interface HistoryItem {
  id: string;
  data: string;
  type: QrContentType;
  timestamp: number;
  isGetmarScan?: boolean; // To differentiate Getmar certificate scans
}

export interface AppSettings {
  playSoundOnScan: boolean;
  copyToClipboardAuto: boolean;
}
