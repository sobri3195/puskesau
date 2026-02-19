import React, { useState, useMemo, useRef } from 'react';
import { Report, ReportFormat, AnalyticsDataPoint } from '../types';
import { FileTextIcon, DownloadIcon, ChartIcon } from './Icons';
import { useTheme } from '../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from 'recharts';
import Modal from './Modal';
import OperationalForecast from './OperationalForecast';


// Mock Data
const mockReportsData: Report[] = [
    { id: 'R001', name: 'Laporan Pasien Bulanan - April 2025', generatedDate: '2025-04-30', type: 'Statistik Pasien', format: ReportFormat.PDF },
    { id: 'R002', name: 'Laporan Inventaris Gudang Pusat', generatedDate: '2025-05-20', type: 'Logistik & Inventaris', format: ReportFormat.XLSX },
    { id: 'R003', name: 'Data Utilisasi SDM Q1 2025', generatedDate: '2025-04-05', type: 'Personel & SDM', format: ReportFormat.CSV },
    { id: 'R004', name: 'Laporan Pasien Bulanan - Maret 2025', generatedDate: '2025-03-31', type: 'Statistik Pasien', format: ReportFormat.PDF },
];

const analyticsData: AnalyticsDataPoint[] = [
    { month: 'Jan', bor: 75, los: 5.5 },
    { month: 'Feb', bor: 78, los: 5.2 },
    { month: 'Mar', bor: 82, los: 4.9 },
    { month: 'Apr', bor: 85, los: 4.8 },
    { month: 'Mei', bor: 81, los: 5.1 },
    { month: 'Jun', bor: 79, los: 5.3 },
];

const FormatBadge: React.FC<{ format: ReportFormat }> = ({ format }) => {
    const formatClasses = {
        [ReportFormat.PDF]: 'bg-red-500',
        [ReportFormat.XLSX]: 'bg-green-600',
        [ReportFormat.CSV]: 'bg-blue-500',
    };
    return <span className={`px-2 py-0.5 text-xs font-bold text-white rounded ${formatClasses[format]}`}>{format}</span>;
}

const reportTypesOptions = ['Statistik Pasien', 'Logistik & Inventaris', 'Personel & SDM', 'Keuangan'];

const ReportsAndAnalytics: React.FC = () => {
    const [reports, setReports] = useState(mockReportsData);
    const { theme } = useTheme();
    const formRef = useRef<HTMLFormElement>(null);
    
    // State for generator form
    const [selectedReportType, setSelectedReportType] = useState(reportTypesOptions[0]);
    const [isGenerateConfirmModalOpen, setIsGenerateConfirmModalOpen] = useState(false);
    const [pendingReport, setPendingReport] = useState<Report | null>(null);
    
    // State for filters
    const [filterType, setFilterType] = useState('All');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    const savedReportTypes = useMemo(() => {
        return ['All', ...Array.from(new Set(mockReportsData.map(r => r.type)))];
    }, []);

    const filteredReports = useMemo(() => {
        return reports.filter(report => {
            const reportDate = new Date(report.generatedDate);
            const startDate = filterStartDate ? new Date(filterStartDate) : null;
            const endDate = filterEndDate ? new Date(filterEndDate) : null;

            if (endDate) {
                endDate.setHours(23, 59, 59, 999); // Make end date inclusive
            }

            const typeMatch = filterType === 'All' || report.type === filterType;
            const startDateMatch = !startDate || reportDate >= startDate;
            const endDateMatch = !endDate || reportDate <= endDate;

            return typeMatch && startDateMatch && endDateMatch;
        });
    }, [reports, filterType, filterStartDate, filterEndDate]);


    const handleGenerateReport = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const type = formData.get('report-type') as string;
        const format = formData.get('format') as ReportFormat;
        
        const newReport: Report = {
            id: `R${String(reports.length + 1).padStart(3, '0')}`,
            name: `${type} - ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}`,
            generatedDate: new Date().toISOString().split('T')[0],
            type: type,
            format: format
        };
        
        setPendingReport(newReport);
        setIsGenerateConfirmModalOpen(true);
    };

    const confirmGenerateReport = () => {
        if (!pendingReport) return;
        setReports(prev => [pendingReport, ...prev].sort((a, b) => new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime()));
        setIsGenerateConfirmModalOpen(false);
        setPendingReport(null);
        if (formRef.current) {
            formRef.current.reset();
        }
        setSelectedReportType(reportTypesOptions[0]);
    };

    const handleClearFilters = () => {
        setFilterType('All');
        setFilterStartDate('');
        setFilterEndDate('');
    };

    const renderReportSpecifics = () => {
        switch (selectedReportType) {
            case 'Statistik Pasien':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipe Pasien</label>
                            <select name="patient-type" className="mt-1 block w-full common-input-styles">
                                <option>Semua</option>
                                <option>Rawat Inap</option>
                                <option>Rawat Jalan</option>
                                <option>IGD</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kelompokkan Berdasarkan</label>
                             <select name="group-by" className="mt-1 block w-full common-input-styles">
                                <option>Diagnosis</option>
                                <option>Usia</option>
                                <option>Jenis Kelamin</option>
                                <option>Departemen</option>
                            </select>
                        </div>
                    </>
                );
            case 'Logistik & Inventaris':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kategori Item</label>
                            <select name="item-category" className="mt-1 block w-full common-input-styles">
                                <option>Semua</option>
                                <option>Obat-obatan</option>
                                <option>Alat Kesehatan</option>
                                <option>Bahan Medis Habis Pakai</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status Stok</label>
                            <select name="stock-status" className="mt-1 block w-full common-input-styles">
                                <option>Semua</option>
                                <option>Stok Aman</option>
                                <option>Stok Menipis</option>
                                <option>Kritis</option>
                            </select>
                        </div>
                    </>
                );
            case 'Personel & SDM':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Departemen</label>
                            <select name="department" className="mt-1 block w-full common-input-styles">
                                <option>Semua</option>
                                <option>Bedah</option>
                                <option>IGD</option>
                                <option>Poli Umum</option>
                                <option>Farmasi</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status Personel</label>
                            <select name="personnel-status" className="mt-1 block w-full common-input-styles">
                                <option>Semua</option>
                                <option>Aktif</option>
                                <option>Cuti</option>
                            </select>
                        </div>
                    </>
                );
            case 'Keuangan':
                 return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jenis Transaksi</label>
                            <select name="transaction-type" className="mt-1 block w-full common-input-styles">
                                <option>Semua</option>
                                <option>Pemasukan</option>
                                <option>Pengeluaran</option>
                            </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kode Referensi</label>
                           <input type="text" name="ref-code" placeholder="e.g., INV-123" className="mt-1 block w-full common-input-styles" />
                        </div>
                    </>
                );
            default:
                return null;
        }
    }


    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Laporan & Analitik</h1>
            
            <OperationalForecast />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center"><FileTextIcon className="mr-2"/> Generator Laporan</h2>
                    <form ref={formRef} onSubmit={handleGenerateReport} className="space-y-4">
                        <style>{`.common-input-styles { padding: 0.5rem 0.75rem; border-radius: 0.375rem; border: 1px solid #D1D5DB; background-color: white; } html.dark .common-input-styles { background-color: #374151; border-color: #4B5563; color: #F3F4F6; }`}</style>
                        <div>
                            <label htmlFor="report-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jenis Laporan</label>
                            <select name="report-type" id="report-type" value={selectedReportType} onChange={e => setSelectedReportType(e.target.value)} className="mt-1 block w-full common-input-styles">
                                {reportTypesOptions.map(opt => <option key={opt}>{opt}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="date-range" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rentang Tanggal</label>
                            <div className="flex items-center space-x-2 mt-1">
                                <input type="date" name="start-date" className="block w-full common-input-styles" />
                                <span className="text-gray-500 dark:text-gray-400">s/d</span>
                                <input type="date" name="end-date" className="block w-full common-input-styles" />
                            </div>
                        </div>
                        <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                             <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">Spesifikasi Laporan</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {renderReportSpecifics()}
                            </div>
                        </div>
                         <div>
                            <label htmlFor="format" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Format</label>
                            <select name="format" id="format" className="mt-1 block w-full common-input-styles">
                                <option value="PDF">PDF</option>
                                <option value="CSV">CSV</option>
                                <option value="XLSX">XLSX</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">Buat Laporan</button>
                    </form>
                </div>
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
                     <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center"><ChartIcon className="mr-2"/> Analitik Kinerja Utama (BOR vs. LOS)</h2>
                     <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4A5568' : '#E2E8F0'}/>
                                <XAxis dataKey="month" tick={{ fill: theme === 'dark' ? '#A0AEC0' : '#4A5568' }} />
                                <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" label={{ value: 'BOR (%)', angle: -90, position: 'insideLeft', fill: theme === 'dark' ? '#A0AEC0' : '#4A5568' }} tick={{ fill: '#3B82F6' }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#10B981" label={{ value: 'LOS (Hari)', angle: -90, position: 'insideRight', fill: theme === 'dark' ? '#A0AEC0' : '#4A5568' }} tick={{ fill: '#10B981' }} />
                                <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#2D3748' : '#FFFFFF', border: `1px solid ${theme === 'dark' ? '#4A5568' : '#E2E8F0'}` }}/>
                                <Legend />
                                <Bar yAxisId="left" dataKey="bor" fill="#3B82F6" name="BOR" />
                                <Line yAxisId="right" type="monotone" dataKey="los" stroke="#10B981" strokeWidth={2} name="LOS"/>
                            </BarChart>
                        </ResponsiveContainer>
                     </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Laporan Tersimpan</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <div>
                        <label htmlFor="filter-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jenis Laporan</label>
                        <select id="filter-type" value={filterType} onChange={e => setFilterType(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                            {savedReportTypes.map(type => <option key={type} value={type}>{type === 'All' ? 'Semua Jenis' : type}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="filter-start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dari Tanggal</label>
                        <input type="date" id="filter-start-date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="mt-1 block w-full pl-3 pr-4 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />
                    </div>
                     <div>
                        <label htmlFor="filter-end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sampai Tanggal</label>
                        <input type="date" id="filter-end-date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="mt-1 block w-full pl-3 pr-4 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />
                    </div>
                    <div className="self-end">
                        <button onClick={handleClearFilters} className="w-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Bersihkan Filter</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b dark:border-gray-700">
                                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nama Laporan</th>
                                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tanggal Dibuat</th>
                                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Jenis</th>
                                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Format</th>
                                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Aksi</th>
                            </tr>
                        </thead>
                         <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredReports.length > 0 ? filteredReports.map(r => (
                                <tr key={r.id}>
                                    <td className="py-4 whitespace-nowrap text-sm font-semibold text-gray-700 dark:text-gray-200">{r.name}</td>
                                    <td className="py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{new Date(r.generatedDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric'})}</td>
                                    <td className="py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{r.type}</td>
                                    <td className="py-4 whitespace-nowrap text-sm"><FormatBadge format={r.format} /></td>
                                    <td className="py-4 whitespace-nowrap text-sm">
                                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"><DownloadIcon /></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        Tidak ada laporan yang cocok dengan kriteria filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal isOpen={isGenerateConfirmModalOpen} onClose={() => setIsGenerateConfirmModalOpen(false)} title="Konfirmasi Pembuatan Laporan">
                <div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">Anda akan membuat laporan baru dengan detail berikut. Mohon konfirmasi untuk melanjutkan.</p>
                    <div className="space-y-2 text-sm bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <p><span className="font-semibold text-gray-600 dark:text-gray-400">Nama:</span> <span className="text-gray-800 dark:text-gray-200">{pendingReport?.name}</span></p>
                        <p><span className="font-semibold text-gray-600 dark:text-gray-400">Jenis:</span> <span className="text-gray-800 dark:text-gray-200">{pendingReport?.type}</span></p>
                        <p className="flex items-center"><span className="font-semibold text-gray-600 dark:text-gray-400 mr-2">Format:</span> {pendingReport && <FormatBadge format={pendingReport.format} />}</p>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button onClick={() => setIsGenerateConfirmModalOpen(false)} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Batal</button>
                        <button onClick={confirmGenerateReport} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Konfirmasi & Buat</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ReportsAndAnalytics;
