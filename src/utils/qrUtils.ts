import { QrContentType } from '../types';

export const getQrContentType = (data: string): QrContentType => {
  if (data.startsWith('http:') || data.startsWith('https:')) return 'url';
  if (data.startsWith('WIFI:')) return 'wifi';
  if (data.startsWith('BEGIN:VCARD')) return 'contact';
  if (data.startsWith('BEGIN:VEVENT')) return 'event';
  if (data.startsWith('sms:')) return 'sms';
  if (data.startsWith('tel:')) return 'tel';
  if (data.startsWith('mailto:')) return 'email';
  if (data.startsWith('geo:')) return 'geo';
  // Add more specific checks if needed for "Getmar" certificates
  // For example, if they have a specific prefix or structure.
  // if (data.startsWith('GETMAR_CERT:')) return 'getmar_certificate';
  return 'text'; // Default to text
};

export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
