import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => (
  <div className="bg-white border-b border-gray-200 p-6 flex-none">
    <div className="max-w-6xl mx-auto flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  </div>
);

export default PageHeader;
