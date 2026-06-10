import React from 'react';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-12 gap-3">
    <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    <p className="text-sm text-gray-500">{message}</p>
  </div>
);

export default LoadingState;
