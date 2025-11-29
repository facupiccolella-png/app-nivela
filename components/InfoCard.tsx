import React from 'react';

interface InfoCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  colorClass?: string;
  icon?: React.ReactNode;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, value, subValue, colorClass = "text-gray-800", icon }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div>
        <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
        {subValue && <div className="text-xs text-gray-400 mt-1">{subValue}</div>}
      </div>
    </div>
  );
};