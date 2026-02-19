import React, { useMemo } from 'react';
import {
    ResponsiveContainer,
    ComposedChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Bar,
    Line,
    Area,
} from 'recharts';
import { useTheme } from '../App';
import { generateBorForecast, generateStockForecast, HospitalBorSource, StockForecastSource } from '../utils/forecastingLogic';

const stockForecastSource: StockForecastSource[] = [
    { item: 'Amoksisilin 500mg', category: 'Obat', currentStock: 1800, dailyUsage: 72, volatility: 0.2, threshold: 350 },
    { item: 'Infus Set Dewasa', category: 'Alkes', currentStock: 620, dailyUsage: 28, volatility: 0.16, threshold: 150 },
    { item: 'Paracetamol IV', category: 'Obat', currentStock: 920, dailyUsage: 44, volatility: 0.26, threshold: 240 },
    { item: 'Syringe 5ml', category: 'Alkes', currentStock: 1250, dailyUsage: 36, volatility: 0.12, threshold: 320 },
];

const borForecastSource: HospitalBorSource[] = [
    { hospital: 'RSAU Dr. Esnawan', baseline: 82, trend: 1.8, variability: 4.5, borThreshold: 85 },
    { hospital: 'RSAU Halim', baseline: 76, trend: 1.3, variability: 3.9, borThreshold: 85 },
    { hospital: 'RSAU Iswahjudi', baseline: 88, trend: 0.9, variability: 5.2, borThreshold: 85 },
];

const OperationalForecast: React.FC = () => {
    const { theme } = useTheme();

    const stockForecast = useMemo(() => generateStockForecast(stockForecastSource), []);
    const borForecast = useMemo(() => generateBorForecast(borForecastSource), []);

    return (
        <section className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800 space-y-6">
            <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Forecasting Operasional</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Prediksi 30 hari kebutuhan stok obat/alkes dan prediksi BOR mingguan per rumah sakit dengan confidence band,
                    alasan rekomendasi, serta tindakan otomatis berbasis threshold.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Prediksi Kebutuhan Stok 30 Hari</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={stockForecast} margin={{ top: 10, right: 20, left: 0, bottom: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4A5568' : '#E2E8F0'} />
                                <XAxis dataKey="item" angle={-25} textAnchor="end" height={70} tick={{ fill: theme === 'dark' ? '#A0AEC0' : '#4A5568', fontSize: 12 }} />
                                <YAxis tick={{ fill: theme === 'dark' ? '#A0AEC0' : '#4A5568' }} />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="confidenceHigh" stroke="none" fill="#93C5FD" fillOpacity={0.35} name="Batas Atas Confidence" />
                                <Area type="monotone" dataKey="confidenceLow" stroke="none" fill="#FFFFFF" fillOpacity={1} name="Batas Bawah Confidence" />
                                <Bar dataKey="currentStock" fill="#10B981" name="Stok Saat Ini" />
                                <Line type="monotone" dataKey="predictedNeed30d" stroke="#2563EB" strokeWidth={2.5} name="Prediksi Kebutuhan 30 Hari" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Prediksi BOR Mingguan per RS</h3>
                    <div className="space-y-4">
                        {borForecast.map((hospital) => (
                            <div key={hospital.hospital} className="border rounded-lg p-3 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{hospital.hospital}</p>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${hospital.exceedThreshold ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'}`}>
                                        {hospital.exceedThreshold ? 'Melewati Threshold' : 'Dalam Batas Aman'}
                                    </span>
                                </div>
                                <div className="h-36">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={hospital.series}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4A5568' : '#E2E8F0'} />
                                            <XAxis dataKey="week" tick={{ fill: theme === 'dark' ? '#A0AEC0' : '#4A5568', fontSize: 11 }} />
                                            <YAxis domain={[60, 100]} tick={{ fill: theme === 'dark' ? '#A0AEC0' : '#4A5568' }} />
                                            <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                                            <Area type="monotone" dataKey="confidenceHigh" stroke="none" fill="#FCA5A5" fillOpacity={0.3} name="Batas Atas" />
                                            <Area type="monotone" dataKey="confidenceLow" stroke="none" fill="#FFFFFF" fillOpacity={1} name="Batas Bawah" />
                                            <Line type="monotone" dataKey="prediction" stroke="#DC2626" strokeWidth={2.3} name="Prediksi BOR" dot />
                                            <Line type="monotone" dataKey={() => hospital.borThreshold} stroke="#F59E0B" strokeDasharray="4 4" name="Threshold" dot={false} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Confidence band ditampilkan sebagai area transparan merah muda.</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b dark:border-gray-700 text-left">
                            <th className="py-2 pr-4">Objek Prediksi</th>
                            <th className="py-2 pr-4">Confidence Band</th>
                            <th className="py-2 pr-4">Alasan Rekomendasi</th>
                            <th className="py-2">Rekomendasi Otomatis</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {stockForecast.map((item) => (
                            <tr key={item.item}>
                                <td className="py-3 pr-4 align-top text-gray-700 dark:text-gray-200">
                                    <p className="font-medium">{item.item}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.category}</p>
                                </td>
                                <td className="py-3 pr-4 align-top text-gray-600 dark:text-gray-300">
                                    {item.confidenceLow} - {item.confidenceHigh} unit
                                </td>
                                <td className="py-3 pr-4 align-top text-gray-600 dark:text-gray-300">
                                    <ul className="list-disc pl-4 space-y-1">
                                        {item.reasons.map((reason) => <li key={reason}>{reason}</li>)}
                                    </ul>
                                </td>
                                <td className="py-3 align-top">
                                    <p className={`font-medium ${item.alert ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                        {item.alert ? 'Tindakan diperlukan' : 'Monitoring rutin'}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300">{item.recommendation}</p>
                                </td>
                            </tr>
                        ))}
                        {borForecast.map((hospital) => (
                            <tr key={hospital.hospital}>
                                <td className="py-3 pr-4 align-top text-gray-700 dark:text-gray-200">
                                    <p className="font-medium">{hospital.hospital}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">BOR Mingguan (4 minggu)</p>
                                </td>
                                <td className="py-3 pr-4 align-top text-gray-600 dark:text-gray-300">
                                    {hospital.series[0].confidenceLow.toFixed(1)}% - {hospital.series[hospital.series.length - 1].confidenceHigh.toFixed(1)}%
                                </td>
                                <td className="py-3 pr-4 align-top text-gray-600 dark:text-gray-300">
                                    <ul className="list-disc pl-4 space-y-1">
                                        {hospital.reasons.map((reason) => <li key={reason}>{reason}</li>)}
                                    </ul>
                                </td>
                                <td className="py-3 align-top">
                                    <p className={`font-medium ${hospital.exceedThreshold ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                        {hospital.exceedThreshold ? 'Aktifkan mitigasi BOR' : 'Kapasitas terkendali'}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300">{hospital.recommendation}</p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default OperationalForecast;
