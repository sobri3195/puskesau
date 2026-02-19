import React from 'react';
import { StatCardData } from '../types';

const StatCard: React.FC<StatCardData> = ({ title, value, change, changeType, icon }) => {
  const changeColor = changeType === 'increase' ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md hover:scale-105 dark:bg-gray-800 dark:border dark:border-gray-700/60 cursor-pointer">
      <div>
        <p className="text-sm text-gray-500 font-medium dark:text-gray-400">{title}</p>
        <div className="flex items-baseline space-x-2 mt-1">
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
          <p className={`text-sm font-semibold ${changeColor}`}>{change}</p>
        </div>
      </div>
      <div className="bg-gray-100 text-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-gray-300">
        {React.cloneElement(icon as React.ReactElement, { className: 'h-6 w-6' })}
      </div>
    </div>
  );
};

export default StatCard;