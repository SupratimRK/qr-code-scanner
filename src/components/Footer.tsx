import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-surface_light dark:bg-surface_dark shadow-sm mt-auto border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-1.5 text-sm text-text_light_secondary dark:text-text_dark_secondary">
          <span>Crafted with</span>
          <Heart className="h-4 w-4 text-red-500 fill-current" />
          <span>by</span>
          <a 
            href="https://github.com/SupratimRK" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="font-medium text-primary dark:text-primary-light hover:underline"
          >
            Supratim
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
