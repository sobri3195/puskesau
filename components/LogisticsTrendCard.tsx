import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LogisticsTrendData } from '../types';
import { useTheme } from '../App';

const LogisticsTrendCard: React.FC<{ data: LogisticsTrendData }> = ({ data }) => {
    const { theme } = useTheme();

    const chartData = useMemo(() => {
        if (!data || !data.months || !data.data) return [];
        return data.months.map((month, index) => {
            const monthData: { [key: string]: string | number } = { month };
            data.data.forEach(series => {
                monthData[series.name] = series.values[index];
            });
            return monthData;
        });
    }, [data]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm h-full flex flex-col dark:bg-gray-800 dark:border dark:border-gray-700/60 min-h-[350px]">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Trend Stok Logistik</h2>
            <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">6 Bulan Terakhir</p>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 20,
                            left: -10,
                            bottom: 20, // Increased bottom margin for legend
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4A5568' : '#E2E8F0'} />
                        <XAxis 
                            dataKey="month" 
                            tick={{ fill: theme === 'dark' ? '#A0AEC0' : '#4A5568', fontSize: 12 }} 
                            axisLine={{ stroke: theme === 'dark' ? '#4A5568' : '#E2E8F0' }} 
                            tickLine={{ stroke: theme === 'dark' ? '#4A5568' : '#E2E8F0' }}
                        />
                        <YAxis 
                            unit="%" 
                            tick={{ fill: theme === 'dark' ? '#A0AEC0' : '#4A5568', fontSize: 12 }}
                            axisLine={{ stroke: theme === 'dark' ? '#4A5568' : '#E2E8F0' }}
                            tickLine={{ stroke: theme === 'dark' ? '#4A5568' : '#E2E8F0' }}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: theme === 'dark' ? '#2D3748' : '#FFFFFF', 
                                border: `1px solid ${theme === 'dark' ? '#4A5568' : '#E2E8F0'}`,
                                borderRadius: '0.5rem' 
                            }}
                            labelStyle={{ color: theme === 'dark' ? '#E2E8F0' : '#1A202C' }}
                            itemStyle={{ fontWeight: 'bold' }}
                            cursor={{ stroke: theme === 'dark' ? '#A0AEC0' : '#4A5568', strokeWidth: 1, strokeDasharray: '3 3' }}
                        />
                        <Legend 
                            verticalAlign="bottom"
                            wrapperStyle={{ 
                                fontSize: '14px', 
                                paddingTop: '20px',
                                color: theme === 'dark' ? '#A0AEC0' : '#4A5568'
                            }} 
                        />
                        {data.data.map(series => (
                            <Line
                                key={series.name}
                                type="monotone"
                                dataKey={series.name}
                                stroke={series.color}
                                strokeWidth={2}
                                activeDot={{ r: 6, stroke: series.color, fill: theme === 'dark' ? '#111827' : '#FFFFFF', strokeWidth: 2 }}
                                name={series.name.charAt(0).toUpperCase() + series.name.slice(1)}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default LogisticsTrendCard;