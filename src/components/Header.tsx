import React from 'react';
import { QrCode, ShieldCheck } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  isGetmarMode: boolean;
  appName: string;
}

const Header: React.FC<HeaderProps> = ({ isGetmarMode, appName }) => {
  const Icon = isGetmarMode ? ShieldCheck : QrCode;
  const colorClass = isGetmarMode ? 'text-getmar-dark dark:text-getmar' : 'text-primary dark:text-primary-light';

  return (
    <header className="bg-surface_light dark:bg-surface_dark shadow-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className={`h-8 w-8 ${colorClass}`} />
            <h1 className={`text-2xl font-bold ${isGetmarMode ? 'text-getmar-dark dark:text-getmar' : 'text-text_light_primary dark:text-text_dark_primary'}`}>
              {appName}
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
