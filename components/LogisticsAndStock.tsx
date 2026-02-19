import React, { useState, useMemo } from 'react';
import { InventoryItem, StockStatus, StockHistoryEntry } from '../types';
import { BoxIcon, ExclamationIcon, EditIcon, ChevronUpIcon, ChevronDownIcon, HistoryIcon } from './Icons';
import Modal from './Modal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../App';


const initialInventoryData: InventoryItem[] = [
    { 
        id: 'OB-001', name: 'Paracetamol 500mg', category: 'Obat', stock: 850, unit: 'box', capacity: 1000, threshold: 200, lastUpdated: '2023-10-27T10:00:00Z',
        history: [
            { date: '2023-10-27T10:00:00Z', stock: 850, change: -50, reason: 'Penggunaan harian' },
            { date: '2023-10-25T09:00:00Z', stock: 900, change: 200, reason: 'Penerimaan barang' },
            { date: '2023-10-22T17:00:00Z', stock: 700, change: -100, reason: 'Penggunaan harian' },
        ]
    },
    { id: 'OB-002', name: 'Amoxicillin 500mg', category: 'Obat', stock: 95, unit: 'strip', capacity: 500, threshold: 100, lastUpdated: '2023-10-27T11:30:00Z', history: [] },
    { id: 'AK-001', name: 'Set Infus', category: 'Alkes', stock: 450, unit: 'pcs', capacity: 500, threshold: 100, lastUpdated: '2023-10-26T15:00:00Z', history: [] },
    { id: 'AK-002', name: 'Oksigen Portabel', category: 'Alkes', stock: 25, unit: 'unit', capacity: 50, threshold: 30, lastUpdated: '2023-10-27T09:00:00Z', history: [] },
    { id: 'BM-001', name: 'Sarung Tangan Steril (M)', category: 'Bahan Medis', stock: 125, unit: 'box', capacity: 400, threshold: 100, lastUpdated: '2023-10-25T12:00:00Z', history: [] },
    { id: 'APD-001', name: 'Masker N95', category: 'APD', stock: 1200, unit: 'pcs', capacity: 2000, threshold: 500, lastUpdated: '2023-10-27T14:00:00Z', history: [] },
    { id: 'OB-003', name: 'Cairan Infus RL', category: 'Obat', stock: 45, unit: 'kantong', capacity: 200, threshold: 50, lastUpdated: '2023-10-27T13:20:00Z', history: [] },
];

const getStockStatus = (item: InventoryItem): StockStatus => {
    if (item.stock <= item.threshold) {
        return StockStatus.Kritis;
    }
    if (item.stock <= item.threshold * 1.5) {
        return StockStatus.PerluPerhatian;
    }
    return StockStatus.Aman;
};

const StatusBadge: React.FC<{ status: StockStatus }> = ({ status }) => {
    const statusClasses = {
        [StockStatus.Aman]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        [StockStatus.PerluPerhatian]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        [StockStatus.Kritis]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    };
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses[status]}`}>{status}</span>;
}

const StockProgressBar: React.FC<{ stock: number, capacity: number, status: StockStatus }> = ({ stock, capacity, status }) => {
    const percentage = capacity > 0 ? (stock / capacity) * 100 : 0;
    const colorClasses = {
        [StockStatus.Aman]: 'bg-green-500',
        [StockStatus.PerluPerhatian]: 'bg-yellow-500',
        [StockStatus.Kritis]: 'bg-red-500',
    };
    return (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className={`${colorClasses[status]} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

type SortKeys = keyof InventoryItem;
type SortDirection = 'ascending' | 'descending';


const LogisticsAndStock: React.FC = () => {
    const { theme } = useTheme();
    const [inventory, setInventory] = useState(initialInventoryData);
    const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [viewingHistoryItem, setViewingHistoryItem] = useState<InventoryItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<StockStatus | 'All'>('All');
    const [sortConfig, setSortConfig] = useState<{ key: SortKeys; direction: SortDirection } | null>(null);

    const stats = useMemo(() => {
        const criticalItems = inventory.filter(item => getStockStatus(item) === StockStatus.Kritis).length;
        const totalStockValue = inventory.reduce((acc, item) => acc + item.stock, 0);
        return {
            totalItems: inventory.length,
            criticalItems,
            totalStockValue
        };
    }, [inventory]);

    const filteredAndSortedData = useMemo(() => {
        let filtered = inventory.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.id.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'All' || getStockStatus(item) === statusFilter;

            return matchesSearch && matchesStatus;
        });

        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'stock') {
                     aValue = (a.stock / a.capacity) * 100;
                     bValue = (b.stock / b.capacity) * 100;
                }

                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [inventory, searchTerm, sortConfig, statusFilter]);

    const handleEditThreshold = (item: InventoryItem) => {
        setEditingItem(item);
        setIsThresholdModalOpen(true);
    };

    const handleUpdateThreshold = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingItem) return;
        const formData = new FormData(e.currentTarget);
        const newThreshold = parseInt(formData.get('threshold') as string, 10);

        if (!isNaN(newThreshold) && newThreshold >= 0) {
            const reason = `Threshold diubah dari ${editingItem.threshold} menjadi ${newThreshold}`;
            const newHistoryEntry: StockHistoryEntry = {
                date: new Date().toISOString(),
                stock: editingItem.stock,
                change: 0,
                reason: reason,
            };
            const newHistory = [newHistoryEntry, ...(editingItem.history || [])];

            setInventory(prev => prev.map(item =>
                item.id === editingItem.id ? { ...item, threshold: newThreshold, lastUpdated: new Date().toISOString(), history: newHistory } : item
            ));
        }
        setIsThresholdModalOpen(false);
        setEditingItem(null);
    };

    const requestSort = (key: SortKeys) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: SortKeys) => {
        if (!sortConfig || sortConfig.key !== key) return <ChevronDownIcon className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />;
        return sortConfig.direction === 'ascending'
            ? <ChevronUpIcon className="w-3 h-3" />
            : <ChevronDownIcon className="w-3 h-3" />;
    };

    const handleUpdateStock = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!viewingHistoryItem) return;

        const formData = new FormData(e.currentTarget);
        const newStock = parseInt(formData.get('stock') as string, 10);
        const reason = formData.get('reason') as string;

        if (!isNaN(newStock) && newStock >= 0 && reason) {
            const change = newStock - viewingHistoryItem.stock;

            const newHistoryEntry: StockHistoryEntry = {
                date: new Date().toISOString(),
                stock: newStock,
                change: change,
                reason: reason,
            };

            const updatedItem = {
                ...viewingHistoryItem,
                stock: newStock,
                history: [newHistoryEntry, ...(viewingHistoryItem.history || [])],
                lastUpdated: new Date().toISOString(),
            };

            setInventory(prev => prev.map(item =>
                item.id === updatedItem.id ? updatedItem : item
            ));
            
            setViewingHistoryItem(updatedItem);
            (e.target as HTMLFormElement).reset();
        }
    };

    const chartData = useMemo(() => {
        if (!viewingHistoryItem || !viewingHistoryItem.history || viewingHistoryItem.history.length === 0) return [];
        
        const sortedHistory = [...viewingHistoryItem.history].reverse();

        return sortedHistory.map(entry => ({
            date: new Date(entry.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
            stok: entry.stock,
        }));

    }, [viewingHistoryItem]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Manajemen Logistik & Stok</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm flex items-center space-x-4"><div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg"><BoxIcon/></div><div><p className="text-sm text-gray-500 dark:text-gray-400">Total Jenis Item</p><p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.totalItems}</p></div></div>
                 <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm flex items-center space-x-4"><div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-lg"><ExclamationIcon/></div><div><p className="text-sm text-gray-500 dark:text-gray-400">Item Kritis</p><p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.criticalItems}</p></div></div>
                 <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm flex items-center space-x-4"><div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg"><BoxIcon/></div><div><p className="text-sm text-gray-500 dark:text-gray-400">Total Unit Stok</p><p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.totalStockValue.toLocaleString('id-ID')}</p></div></div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Daftar Inventaris</h2>
                    <input type="text" placeholder="Cari ID atau Nama Item..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full sm:w-72 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-2">Filter Status:</span>
                    {(['All', ...Object.values(StockStatus)] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-200 ${
                                statusFilter === status
                                    ? 'bg-blue-600 text-white shadow'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            {status === 'All' ? 'Semua Status' : status}
                        </button>
                    ))}
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b dark:border-gray-700">
                                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"><button onClick={() => requestSort('name')} className="group flex items-center gap-1">Item {getSortIcon('name')}</button></th>
                                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"><button onClick={() => requestSort('category')} className="group flex items-center gap-1">Kategori {getSortIcon('category')}</button></th>
                                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-48"><button onClick={() => requestSort('stock')} className="group flex items-center gap-1">Stok Saat Ini {getSortIcon('stock')}</button></th>
                                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"><button onClick={() => requestSort('threshold')} className="group flex items-center gap-1">Threshold {getSortIcon('threshold')}</button></th>
                                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredAndSortedData.map(item => {
                                const status = getStockStatus(item);
                                return (
                                    <tr key={item.id} className={`${status === StockStatus.Kritis ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                                        <td className="py-4 whitespace-nowrap"><div className="font-semibold text-gray-800 dark:text-gray-100">{item.name}</div><div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{item.id}</div></td>
                                        <td className="py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{item.category}</td>
                                        <td className="py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono w-28 text-right">{item.stock.toLocaleString('id-ID')} / {item.capacity.toLocaleString('id-ID')} {item.unit}</span>
                                                <StockProgressBar stock={item.stock} capacity={item.capacity} status={status} />
                                            </div>
                                        </td>
                                        <td className="py-4 whitespace-nowrap text-sm font-mono text-gray-600 dark:text-gray-300">{item.threshold} {item.unit}</td>
                                        <td className="py-4 whitespace-nowrap text-sm"><StatusBadge status={status} /></td>
                                        <td className="py-4 whitespace-nowrap text-sm">
                                            <button onClick={() => handleEditThreshold(item)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" aria-label={`Edit threshold for ${item.name}`}><EditIcon className="w-4 h-4" /></button>
                                            <button onClick={() => setViewingHistoryItem(item)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" aria-label={`View history for ${item.name}`}><HistoryIcon className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {editingItem && (
                <Modal isOpen={isThresholdModalOpen} onClose={() => {setIsThresholdModalOpen(false); setEditingItem(null);}} title={`Atur Threshold untuk ${editingItem.name}`}>
                    <form onSubmit={handleUpdateThreshold} className="space-y-4">
                        <div>
                            <label htmlFor="threshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Threshold Level Kritis</label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Item akan ditandai 'Kritis' jika stok berada pada atau di bawah nilai ini.</p>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="threshold"
                                    id="threshold"
                                    defaultValue={editingItem.threshold}
                                    min="0"
                                    required
                                    className="w-full pl-4 pr-16 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600"
                                />
                                <span className="absolute inset-y-0 right-4 flex items-center text-sm text-gray-500 dark:text-gray-400">{editingItem.unit}</span>
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Simpan Perubahan</button>
                    </form>
                </Modal>
            )}

            {viewingHistoryItem && (
                <Modal size="3xl" isOpen={!!viewingHistoryItem} onClose={() => setViewingHistoryItem(null)} title={`Riwayat Stok: ${viewingHistoryItem.name}`}>
                    <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-4 -mr-4">
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-2">Update Stok Manual</h3>
                            <form onSubmit={handleUpdateStock} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                                <div className="sm:col-span-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stok Baru</label>
                                    <input type="number" name="stock" min="0" required placeholder={`${viewingHistoryItem.stock}`} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500"/>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Alasan Perubahan</label>
                                    <input type="text" name="reason" required placeholder="Contoh: Stok opname, Penggunaan darurat" className="mt-1 w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500"/>
                                </div>
                                <div className="sm:col-span-1">
                                    <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">Simpan</button>
                                </div>
                            </form>
                        </div>

                        {chartData.length > 0 && (
                            <div>
                                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-2">Grafik Stok</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4A5568' : '#E2E8F0'} />
                                            <XAxis dataKey="date" tick={{ fill: theme === 'dark' ? '#A0AEC0' : '#4A5568', fontSize: 12 }} />
                                            <YAxis tick={{ fill: theme === 'dark' ? '#A0AEC0' : '#4A5568', fontSize: 12 }} domain={['dataMin - 10', 'dataMax + 10']}/>
                                            <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#2D3748' : '#FFFFFF', border: `1px solid ${theme === 'dark' ? '#4A5568' : '#E2E8F0'}` }} />
                                            <Legend />
                                            <Line type="monotone" dataKey="stok" stroke="#8884d8" strokeWidth={2} name="Jumlah Stok" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-2">Detail Riwayat</h3>
                             <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tanggal</th>
                                            <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Alasan</th>
                                            <th className="py-2 px-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Perubahan</th>
                                            <th className="py-2 px-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Stok Akhir</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                        {viewingHistoryItem.history && viewingHistoryItem.history.map((entry, index) => (
                                            <tr key={index}>
                                                <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{new Date(entry.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                                                <td className="py-2 px-4 text-sm text-gray-600 dark:text-gray-300">{entry.reason}</td>
                                                <td className={`py-2 px-4 whitespace-nowrap text-sm text-right font-semibold ${entry.change > 0 ? 'text-green-600 dark:text-green-400' : entry.change < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                    {entry.change > 0 ? `+${entry.change}` : entry.change}
                                                </td>
                                                <td className="py-2 px-4 whitespace-nowrap text-sm text-right font-mono font-semibold text-gray-800 dark:text-gray-100">{entry.stock}</td>
                                            </tr>
                                        ))}
                                         {(!viewingHistoryItem.history || viewingHistoryItem.history.length === 0) && (
                                            <tr><td colSpan={4} className="text-center py-4 text-gray-500 dark:text-gray-400">Tidak ada riwayat untuk item ini.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default LogisticsAndStock;