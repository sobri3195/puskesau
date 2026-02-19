import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LowStockItemData, StockStatus } from '../types';
import { DownloadIcon, ChevronUpIcon, ChevronDownIcon } from './Icons';

const StatusBadge: React.FC<{ status: StockStatus }> = ({ status }) => {
    const colorClasses = {
        [StockStatus.Kritis]: 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-600/50',
        [StockStatus.PerluPerhatian]: 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-600/50',
    };
    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colorClasses[status]}`}>
            {status}
        </span>
    );
}

type SortKeys = keyof LowStockItemData;
type SortDirection = 'ascending' | 'descending';

const LowStockItemsTable: React.FC<{ data: LowStockItemData[] }> = ({ data }) => {
    const [updatedRows, setUpdatedRows] = useState<Set<string>>(new Set());
    const [sortConfig, setSortConfig] = useState<{ key: SortKeys; direction: SortDirection } | null>(null);
    const prevDataRef = useRef<LowStockItemData[]>();

    const sortedData = useMemo(() => {
        let sortableItems = [...data];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue: string | number = a[sortConfig.key];
                let bValue: string | number = b[sortConfig.key];
                
                if (sortConfig.key === 'stock') {
                    aValue = parseInt(a.stock);
                    bValue = parseInt(b.stock);
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    useEffect(() => {
        if (prevDataRef.current && prevDataRef.current !== data) {
            const newUpdated = new Set<string>();
            data.forEach((item) => {
                const prevItem = prevDataRef.current?.find(p => p.name === item.name);
                if (prevItem && item.stock !== prevItem.stock) {
                    newUpdated.add(item.name);
                }
            });
            
            if (newUpdated.size > 0) {
                setUpdatedRows(newUpdated);
                const timer = setTimeout(() => {
                    setUpdatedRows(new Set());
                }, 1500); // Highlight duration
                return () => clearTimeout(timer);
            }
        }
        prevDataRef.current = data;
    }, [data]);

    const requestSort = (key: SortKeys) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: SortKeys) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ChevronDownIcon className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />;
        }
        return sortConfig.direction === 'ascending' 
            ? <ChevronUpIcon className="w-3 h-3 text-gray-600 dark:text-gray-200" /> 
            : <ChevronDownIcon className="w-3 h-3 text-gray-600 dark:text-gray-200" />;
    };

    const handleExport = () => {
        const headers = ["Item", "Kategori", "Stok", "Status"];
        const csvRows = sortedData.map(row => [
            `"${row.name.replace(/"/g, '""')}"`,
            `"${row.category}"`,
            `"${row.stock}"`,
            `"${row.status}"`
        ].join(','));

        const csvString = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "item_stok_menipis.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800 dark:border dark:border-gray-700/60">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Item Stok Menipis</h2>
                <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-700 font-bold bg-gray-200 px-2 py-1 rounded-full dark:bg-gray-700 dark:text-gray-200">{data.length} Items</span>
                    <button 
                        onClick={handleExport}
                        className="p-1.5 text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 transition-colors"
                        aria-label="Export as CSV"
                    >
                        <DownloadIcon width="16" height="16" />
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead >
                        <tr className="border-b dark:border-gray-700">
                            <th scope="col" className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <button onClick={() => requestSort('name')} className="group flex items-center">Item {getSortIcon('name')}</button>
                            </th>
                            <th scope="col" className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <button onClick={() => requestSort('category')} className="group flex items-center">Kategori {getSortIcon('category')}</button>
                            </th>
                            <th scope="col" className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <button onClick={() => requestSort('stock')} className="group flex items-center">Stok {getSortIcon('stock')}</button>
                            </th>
                            <th scope="col" className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <button onClick={() => requestSort('status')} className="group flex items-center">Status {getSortIcon('status')}</button>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                        {sortedData.map((item, index) => (
                            <tr key={index} className={`border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-all duration-500 ${updatedRows.has(item.name) ? 'bg-yellow-50 dark:bg-yellow-900/40' : ''}`}>
                                <td className="py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</td>
                                <td className="py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.category}</td>
                                <td className="py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.stock}</td>
                                <td className="py-4 whitespace-nowrap text-sm"><StatusBadge status={item.status} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LowStockItemsTable;