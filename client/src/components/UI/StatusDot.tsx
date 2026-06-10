import React from 'react';

interface StatusDotProps {
  online: boolean;
  label?: string;
}

const StatusDot: React.FC<StatusDotProps> = ({ online, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-gray-400'}`} />
    {label && <span className="text-xs text-gray-500">{label}</span>}
  </div>
);

export default StatusDot;
