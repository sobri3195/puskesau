import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HospitalStatusData, IGDStatus } from '../types';
import { DownloadIcon, ChevronUpIcon, ChevronDownIcon } from './Icons';

interface BedStatusBarProps {
  available: number;
  total: number;
}

const BedStatusBar: React.FC<BedStatusBarProps> = ({ available, total }) => {
  const usedPercentage = total > 0 ? ((total - available) / total) * 100 : 0;
  let barColor = 'bg-green-400';
  if (usedPercentage >= 80) {
    barColor = 'bg-red-500';
  } else if (usedPercentage >= 50) {
    barColor = 'bg-yellow-400';
  }

  return (
    <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
      <div
        className={`${barColor} h-2 rounded-full`}
        style={{ width: `${usedPercentage}%` }}
      ></div>
    </div>
  );
};

interface StatusBadgeProps {
    status: IGDStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const colorClasses = {
        [IGDStatus.Normal]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        [IGDStatus.Sibuk]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        [IGDStatus.Kritis]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    };
    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colorClasses[status]}`}>
            {status}
        </span>
    );
}

interface HospitalStatusTableProps {
  data: HospitalStatusData[];
  lastUpdated: Date;
}

type SortKeys = keyof HospitalStatusData | 'beds.available' | 'operatingRooms.inUse' | 'ambulances.ready';
type SortDirection = 'ascending' | 'descending';

const HospitalStatusTable: React.FC<HospitalStatusTableProps> = ({ data, lastUpdated }) => {
  const [updatedRows, setUpdatedRows] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: SortKeys; direction: SortDirection } | null>(null);
  const prevDataRef = useRef<HospitalStatusData[]>();

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === 'beds.available') {
            aValue = a.beds.available;
            bValue = b.beds.available;
        } else if (sortConfig.key === 'operatingRooms.inUse') {
            aValue = a.operatingRooms.inUse;
            bValue = b.operatingRooms.inUse;
        } else if (sortConfig.key === 'ambulances.ready') {
            aValue = a.ambulances.ready;
            bValue = b.ambulances.ready;
        } else {
            aValue = a[sortConfig.key as keyof HospitalStatusData];
            bValue = b[sortConfig.key as keyof HospitalStatusData];
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
      data.forEach((hospital) => {
        const prevHospital = prevDataRef.current?.find(h => h.name === hospital.name);
        if (prevHospital && (
          hospital.beds.available !== prevHospital.beds.available ||
          hospital.igdStatus !== prevHospital.igdStatus ||
          hospital.operatingRooms.inUse !== prevHospital.operatingRooms.inUse
        )) {
          newUpdated.add(hospital.name);
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
    if (sortConfig.direction === 'ascending') {
        return <ChevronUpIcon className="w-3 h-3 text-gray-600 dark:text-gray-200" />;
    }
    return <ChevronDownIcon className="w-3 h-3 text-gray-600 dark:text-gray-200" />;
  };

  const handleExport = () => {
    const headers = [ "Nama RS", "Tempat Tidur Tersedia", "Total Tempat Tidur", "Status IGD", "Ruang Operasi Digunakan", "Total Ruang Operasi", "Ambulans Siap", "Total Ambulans" ];
    const csvRows = sortedData.map(row => [ `"${row.name.replace(/"/g, '""')}"`, row.beds.available, row.beds.total, `"${row.igdStatus}"`, row.operatingRooms.inUse, row.operatingRooms.total, row.ambulances.ready, row.ambulances.total ].join(','));
    const csvString = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "status_rumah_sakit.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800 dark:border dark:border-gray-700/60">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Status Rumah Sakit TNI AU</h2>
        <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full dark:bg-gray-700 dark:text-gray-400">Pembaruan Terakhir: {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
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
        <div className="min-w-[700px]">
          <div className="grid grid-cols-5 gap-4 text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold pb-3 border-b dark:border-gray-700">
            <button onClick={() => requestSort('name')} className="col-span-1 group flex items-center">RS {getSortIcon('name')}</button>
            <button onClick={() => requestSort('beds.available')} className="col-span-1 text-center group flex items-center justify-center">Tempat Tidur <span className="font-normal normal-case ml-1">(Tersedia / Total)</span> {getSortIcon('beds.available')}</button>
            <button onClick={() => requestSort('igdStatus')} className="col-span-1 text-center group flex items-center justify-center">Status IGD {getSortIcon('igdStatus')}</button>
            <button onClick={() => requestSort('operatingRooms.inUse')} className="col-span-1 text-center group flex items-center justify-center">Ruang Operasi <span className="font-normal normal-case ml-1">(Dipakai / Total)</span> {getSortIcon('operatingRooms.inUse')}</button>
            <button onClick={() => requestSort('ambulances.ready')} className="col-span-1 text-center group flex items-center justify-center">Ambulans <span className="font-normal normal-case ml-1">(Siap / Total)</span> {getSortIcon('ambulances.ready')}</button>
          </div>
          <div className="space-y-1 pt-2">
            {sortedData.map((hospital) => (
              <div key={hospital.name} className={`grid grid-cols-5 gap-4 items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-all duration-500 ${updatedRows.has(hospital.name) ? 'bg-blue-50 dark:bg-blue-900/40 ring-1 ring-blue-400 dark:ring-blue-600' : ''}`}>
                <div className="col-span-1 font-semibold text-gray-700 dark:text-gray-200">{hospital.name}</div>
                <div className="col-span-1 flex items-center justify-center space-x-3">
                  <span className="font-mono font-semibold text-sm w-20 text-center dark:text-gray-300">{hospital.beds.available} / {hospital.beds.total}</span>
                  <BedStatusBar available={hospital.beds.available} total={hospital.beds.total} />
                </div>
                <div className="col-span-1 text-center">
                    <StatusBadge status={hospital.igdStatus} />
                </div>
                <div className="col-span-1 text-center font-mono font-semibold text-sm dark:text-gray-300">{hospital.operatingRooms.inUse} / {hospital.operatingRooms.total}</div>
                <div className="col-span-1 text-center font-mono font-semibold text-sm dark:text-gray-300">{hospital.ambulances.ready} / {hospital.ambulances.total}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalStatusTable;
