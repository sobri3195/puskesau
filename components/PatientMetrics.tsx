import React, { useState, useEffect, useRef } from 'react';
import { PatientMetricsData } from '../types';
import { UserPlusIcon, UserMinusIcon, BedIcon, ClockIcon } from './Icons';

const initialPatientMetricsData: PatientMetricsData = {
    newAdmissions: 28,
    discharged: 21,
    currentInpatients: 402,
    avgStay: 5.2,
};

interface MetricItemProps {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    description: string;
    isUpdated: boolean;
}

const MetricItem: React.FC<MetricItemProps> = ({ icon, title, value, description, isUpdated }) => {
    return (
        <div className="flex items-start space-x-4">
            <div className="bg-blue-100 text-blue-600 rounded-lg p-3 dark:bg-blue-900/50 dark:text-blue-400">
                {React.cloneElement(icon as React.ReactElement, { className: 'h-6 w-6' })}
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium dark:text-gray-400">{title}</p>
                <p className={`text-2xl font-bold transition-all duration-300 ease-in-out ${isUpdated ? 'text-green-500 dark:text-green-400 scale-110' : 'text-gray-800 dark:text-gray-100 scale-100'}`}>{value}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{description}</p>
            </div>
        </div>
    );
};

const PatientMetrics: React.FC = () => {
    const [metrics, setMetrics] = useState<PatientMetricsData>(initialPatientMetricsData);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [updatedKeys, setUpdatedKeys] = useState<Set<keyof PatientMetricsData>>(new Set());
    const timeoutRef = useRef<number | null>(null);
    const clearUpdateTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        const fetchData = () => {
            setIsRefreshing(true);

            // Simulate network latency
            setTimeout(() => {
                setMetrics(prevData => {
                    const newUpdatedKeys = new Set<keyof PatientMetricsData>();

                    const newAdmissions = Math.max(15, prevData.newAdmissions + (Math.random() > 0.5 ? Math.floor(Math.random() * 3) - 1 : 0));
                    if (newAdmissions !== prevData.newAdmissions) newUpdatedKeys.add('newAdmissions');

                    const discharged = Math.max(15, prevData.discharged + (Math.random() > 0.5 ? Math.floor(Math.random() * 3) - 1 : 0));
                    if (discharged !== prevData.discharged) newUpdatedKeys.add('discharged');
                    
                    const currentInpatients = Math.max(380, prevData.currentInpatients + Math.floor(Math.random() * 10) - 5);
                    if (currentInpatients !== prevData.currentInpatients) newUpdatedKeys.add('currentInpatients');
                    
                    const avgStay = parseFloat(Math.max(3, Math.min(10, prevData.avgStay + (Math.random() * 0.4 - 0.2))).toFixed(1));
                    if (avgStay !== prevData.avgStay) newUpdatedKeys.add('avgStay');
                    
                    setUpdatedKeys(newUpdatedKeys);
                    return { newAdmissions, discharged, currentInpatients, avgStay };
                });

                setIsRefreshing(false);

                if (clearUpdateTimeoutRef.current) clearTimeout(clearUpdateTimeoutRef.current);
                clearUpdateTimeoutRef.current = window.setTimeout(() => setUpdatedKeys(new Set()), 1000); // Reset highlights after animation

            }, 500 + Math.random() * 500); // Random latency between 500ms and 1s

            // Schedule next fetch with random interval
            const randomInterval = 2000 + Math.random() * 3000; // 2s to 5s
            timeoutRef.current = window.setTimeout(fetchData, randomInterval);
        };

        timeoutRef.current = window.setTimeout(fetchData, 2000); // Initial delay

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (clearUpdateTimeoutRef.current) clearTimeout(clearUpdateTimeoutRef.current);
        };
    }, []);

    const metricsConfig = [
        { key: 'newAdmissions', icon: <UserPlusIcon />, title: "Admisi Baru", description: "Pasien masuk" },
        { key: 'discharged', icon: <UserMinusIcon />, title: "Pasien Pulang", description: "Pasien keluar" },
        { key: 'currentInpatients', icon: <BedIcon />, title: "Total Rawat Inap", description: "Pasien saat ini" },
        { key: 'avgStay', icon: <ClockIcon />, title: "Lama Rawat Rata-rata", description: "Rata-rata LOS", suffix: " Hari" }
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800 dark:border dark:border-gray-700/60">
            <div className="flex items-center justify-between mb-4">
                 <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Data Pasien Real-time</h2>
                 <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
                    <span className={`text-xs font-semibold ${isRefreshing ? 'text-yellow-500' : 'text-green-500'}`}>
                        {isRefreshing ? 'Updating...' : 'Live'}
                    </span>
                 </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {metricsConfig.map(m => (
                    <MetricItem
                        key={m.key}
                        icon={m.icon}
                        title={m.title}
                        value={`${metrics[m.key as keyof PatientMetricsData]}${m.suffix || ''}`}
                        description={m.description}
                        isUpdated={updatedKeys.has(m.key as keyof PatientMetricsData)}
                    />
                ))}
            </div>
        </div>
    );
};

export default PatientMetrics;