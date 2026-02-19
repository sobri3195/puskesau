import React from 'react';
import { HRUtilizationData } from '../types';

const HRUtilizationCard: React.FC<{ data: HRUtilizationData }> = ({ data }) => {
    const conicGradient = data.distribution.reduce((acc, item, index, arr) => {
        const start = index === 0 ? 0 : arr.slice(0, index).reduce((sum, i) => sum + i.value, 0);
        const end = start + item.value;
        return `${acc}, ${item.color} ${start}% ${end}%`;
    }, '');

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm h-full flex flex-col dark:bg-gray-800 dark:border dark:border-gray-700/60">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Pemanfaatan SDM</h2>
            <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">Bulan Mei 2025</p>
            <div className="flex flex-col md:flex-row items-center gap-6 flex-grow">
                <div className="relative w-32 h-32 flex-shrink-0">
                    <div 
                        className="w-full h-full rounded-full" 
                        style={{ background: `conic-gradient(${conicGradient})` }}
                    />
                    <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-full flex flex-col items-center justify-center">
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{data.totalPersonnel}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Personel</p>
                    </div>
                </div>
                <div className="space-y-2 w-full">
                    {data.distribution.map(item => (
                        <div key={item.name} className="flex items-center">
                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                            <span className="text-sm text-gray-600 dark:text-gray-300">{item.name}</span>
                            <span className="ml-auto text-sm font-semibold text-gray-800 dark:text-gray-100">{item.value}%</span>
                        </div>
                    ))}
                </div>
            </div>
             <div className="mt-6 pt-4 border-t dark:border-gray-700">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Rata-rata Utilisasi</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{data.averageUtilization}%</p>
                </div>
            </div>
        </div>
    );
};

export default HRUtilizationCard;