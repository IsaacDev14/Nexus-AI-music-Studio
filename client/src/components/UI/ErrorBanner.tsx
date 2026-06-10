import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onDismiss }) => (
  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start justify-between gap-3 text-sm">
    <span>{message}</span>
    {onDismiss && (
      <button onClick={onDismiss} className="text-red-500 hover:text-red-700 shrink-0" aria-label="Dismiss">
        <XMarkIcon className="w-4 h-4" />
      </button>
    )}
  </div>
);

export default ErrorBanner;
