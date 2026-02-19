import React, { useState, useEffect } from 'react';
import StatCard from './StatCard';
import HospitalStatusTable from './HospitalStatusTable';
import NotificationsPanel from './NotificationsPanel';
import HRUtilizationCard from './HRUtilizationCard';
import LogisticsTrendCard from './LogisticsTrendCard';
import LowStockItemsTable from './LowStockItemsTable';
import PatientMetrics from './PatientMetrics';
import { 
    StatCardData, 
    HospitalStatusData, 
    IGDStatus, 
    NotificationData, 
    NotificationPriority,
    HRUtilizationData,
    LogisticsTrendData,
    LowStockItemData,
    StockStatus,
} from '../types';
import { UsersIcon, BoxIcon, PulseIcon, TruckIcon } from './Icons';
import { shouldCreateHospitalCriticalAlert, shouldCreateStockCriticalAlert } from '../utils/notificationLogic';

const createNotification = (payload: Omit<NotificationData, 'id' | 'lifecycle'>): NotificationData => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    lifecycle: 'new',
    ...payload,
});

const initialStatCards: StatCardData[] = [
  { title: 'Total Pasien Aktif', value: '402', change: '+12%', changeType: 'increase', icon: <UsersIcon /> },
  { title: 'Stok Obat dan Alkes', value: '75%', change: '5%', changeType: 'decrease', icon: <BoxIcon /> },
  { title: 'Kapasitas RS', value: '82%', change: '3%', changeType: 'decrease', icon: <PulseIcon /> },
  { title: 'Distribusi Logistik', value: '23', change: '+8%', changeType: 'increase', icon: <TruckIcon /> },
];

const initialHospitalData: HospitalStatusData[] = [
    { name: 'RSPAU Hardjolukito', beds: { available: 32, total: 150 }, igdStatus: IGDStatus.Normal, operatingRooms: { inUse: 3, total: 5 }, ambulances: { ready: 5, total: 7 } },
    { name: 'RS Lanud Halim', beds: { available: 18, total: 120 }, igdStatus: IGDStatus.Sibuk, operatingRooms: { inUse: 2, total: 4 }, ambulances: { ready: 3, total: 5 } },
    { name: 'RS Lanud Adisutjipto', beds: { available: 8, total: 80 }, igdStatus: IGDStatus.Kritis, operatingRooms: { inUse: 3, total: 3 }, ambulances: { ready: 1, total: 4 } },
    { name: 'RS Lanud Husein S.', beds: { available: 25, total: 75 }, igdStatus: IGDStatus.Normal, operatingRooms: { inUse: 1, total: 2 }, ambulances: { ready: 2, total: 3 } },
    { name: 'RS Lanud Hasanuddin', beds: { available: 25, total: 85 }, igdStatus: IGDStatus.Normal, operatingRooms: { inUse: 0, total: 2 }, ambulances: { ready: 3, total: 3 } },
];

const initialNotificationData: NotificationData[] = [
    createNotification({ priority: NotificationPriority.Tinggi, title: 'Kebutuhan Darah Segera', time: '15 menit yang lalu', description: 'Kebutuhan darah golongan O- untuk kasus operasi darurat', location: 'RSPAU Hardjolukito', actionLabel: 'Aktifkan kode donor' }),
    createNotification({ priority: NotificationPriority.Sedang, title: 'Ruang ICU Hampir Penuh', time: '45 menit yang lalu', description: 'Kapasitas ruang ICU tersisa 2 dari 10 tempat tidur', location: 'RS Lanud Halim', actionLabel: 'Alihkan pasien prioritas' }),
    createNotification({ priority: NotificationPriority.Rendah, title: 'Pengiriman Alkes Tiba', time: '1 jam yang lalu', description: 'Pengiriman alat kesehatan dari Depot Pusat telah tiba', location: 'RS Lanud Adisutjipto', actionLabel: 'Konfirmasi penerimaan' }),
    createNotification({ priority: NotificationPriority.Sedang, title: 'Jadwal Pemeliharaan Alat', time: '3 jam yang lalu', description: 'Pengingat: Jadwal pemeliharaan X-Ray portable hari ini', location: 'RS Lanud Halim', actionLabel: 'Jadwalkan teknisi' }),
];

const initialHrData: HRUtilizationData = {
    distribution: [
        { name: 'Dokter Spesialis', value: 29, color: '#4F46E5' },
        { name: 'Dokter Umum', value: 24, color: '#10B981' },
        { name: 'Perawat', value: 22, color: '#F59E0B' },
        { name: 'Tenaga Penunjang', value: 25, color: '#3B82F6' },
    ],
    totalPersonnel: 432,
    averageUtilization: 73.75,
};

const initialLogisticsData: LogisticsTrendData = {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
    data: [
        { name: 'obat', values: [75, 80, 78, 82, 70, 75], color: '#3B82F6' },
        { name: 'alkes', values: [60, 65, 62, 70, 65, 68], color: '#F59E0B' },
        { name: 'bahan', values: [85, 88, 90, 85, 80, 82], color: '#A855F7' },
    ],
};

const initialLowStockData: LowStockItemData[] = [
    { name: 'Cairan Infus RL', category: 'Obat', stock: '15 Box', status: StockStatus.Kritis },
    { name: 'O2 Portable', category: 'Alkes', stock: '7 Unit', status: StockStatus.Kritis },
    { name: 'Sarung Tangan Steril', category: 'Bahan', stock: '23 Box', status: StockStatus.PerluPerhatian },
    { name: 'Antibiotik Amoxicillin', category: 'Obat', stock: '12 Strip', status: StockStatus.Kritis },
];


const Dashboard: React.FC = () => {
  const [statCards, setStatCards] = useState<StatCardData[]>(initialStatCards);
  const [hospitalData, setHospitalData] = useState<HospitalStatusData[]>(initialHospitalData);
  const [notificationData, setNotificationData] = useState<NotificationData[]>(initialNotificationData);
  const [hrData, setHrData] = useState<HRUtilizationData>(initialHrData);
  const [logisticsData, setLogisticsData] = useState<LogisticsTrendData>(initialLogisticsData);
  const [lowStockData, setLowStockData] = useState<LowStockItemData[]>(initialLowStockData);
  const [pendingNotification, setPendingNotification] = useState<NotificationData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  useEffect(() => {
    if (pendingNotification) {
        setNotificationData(prev => [pendingNotification, ...prev].slice(0, 5));
        setPendingNotification(null); // Reset after processing
    }
  }, [pendingNotification]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsUpdating(true);

      // Simulate network latency before updating state
      setTimeout(() => {
        // Update Stat Cards
        setStatCards(prevCards => prevCards.map(card => {
          const isPercentage = card.value.includes('%');
          let currentValue = parseInt(card.value);
          let change = Math.floor(Math.random() * 5) - 2; // -2 to +2
          if (card.title === 'Total Pasien Aktif') {
              change = Math.floor(Math.random() * 10) - 5;
          }
          let newValue = currentValue + change;

          newValue = isPercentage ? Math.max(0, Math.min(100, newValue)) : Math.max(0, newValue);

          return {
              ...card,
              value: isPercentage ? `${newValue}%` : `${newValue}`,
              change: `${Math.random() > 0.5 ? '+' : ''}${Math.floor(Math.random() * 8) + 1}${isPercentage ? '' : '%'}`,
              changeType: Math.random() > 0.5 ? 'increase' : 'decrease'
          };
        }));

        // Update Hospital Data with more realistic logic
        setHospitalData(prevData => {
            const newData = prevData.map(hospital => {
                let bedChange = 0;
                switch (hospital.igdStatus) {
                    case IGDStatus.Kritis: bedChange = Math.floor(Math.random() * 5) - 4; break;
                    case IGDStatus.Sibuk: bedChange = Math.floor(Math.random() * 6) - 4; break;
                    case IGDStatus.Normal: bedChange = Math.floor(Math.random() * 7) - 3; break;
                }

                const newAvailableBeds = Math.max(0, Math.min(hospital.beds.total, hospital.beds.available + bedChange));
                const newInUseRooms = Math.max(0, Math.min(hospital.operatingRooms.total, hospital.operatingRooms.inUse + (Math.random() > 0.7 ? 1 : (Math.random() < 0.3 ? -1 : 0))));
                const newReadyAmbulances = Math.max(0, Math.min(hospital.ambulances.total, hospital.ambulances.ready + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0)));
                
                const bedUsagePercentage = ((hospital.beds.total - newAvailableBeds) / hospital.beds.total) * 100;
                let newIgdStatus = IGDStatus.Normal;
                if (bedUsagePercentage >= 85) newIgdStatus = IGDStatus.Kritis;
                else if (bedUsagePercentage >= 60) newIgdStatus = IGDStatus.Sibuk;

                return {
                    ...hospital,
                    beds: { ...hospital.beds, available: newAvailableBeds },
                    operatingRooms: { ...hospital.operatingRooms, inUse: newInUseRooms },
                    ambulances: { ...hospital.ambulances, ready: newReadyAmbulances },
                    igdStatus: newIgdStatus
                };
            });

            newData.forEach((hospital, index) => {
                const oldHospital = prevData[index];
                if (shouldCreateHospitalCriticalAlert(oldHospital.igdStatus, hospital.igdStatus)) {
                    setPendingNotification(createNotification({
                        priority: NotificationPriority.Tinggi,
                        title: `Status Kritis: ${hospital.name}`,
                        time: 'Baru saja',
                        description: 'Kapasitas IGD & tempat tidur sangat terbatas.',
                        location: hospital.name,
                        actionLabel: 'Aktifkan protokol IGD',
                    }));
                }
            });
            return newData;
        });

        // Update HR Data
        setHrData(prevData => {
            const newDistribution = [...prevData.distribution];
            const fromIndex = Math.floor(Math.random() * newDistribution.length);
            let toIndex = Math.floor(Math.random() * newDistribution.length);
            while(fromIndex === toIndex) toIndex = Math.floor(Math.random() * newDistribution.length);
            if (newDistribution[fromIndex].value > 5) {
                newDistribution[fromIndex] = {...newDistribution[fromIndex], value: newDistribution[fromIndex].value - 1};
                newDistribution[toIndex] = {...newDistribution[toIndex], value: newDistribution[toIndex].value + 1};
            }
            return {
                ...prevData,
                distribution: newDistribution,
                totalPersonnel: prevData.totalPersonnel + Math.floor(Math.random() * 3) - 1,
                averageUtilization: parseFloat(Math.min(95, Math.max(60, prevData.averageUtilization + Math.random() * 2 - 1)).toFixed(2))
            };
        });

        // Update Logistics Data
        setLogisticsData(prevData => ({
            ...prevData,
            data: prevData.data.map(series => ({
                ...series,
                values: series.values.map((val, index) => 
                    index === series.values.length - 1 ? Math.max(0, Math.min(100, val + Math.floor(Math.random() * 10) - 5)) : val
                )
            }))
        }));

        // Update Low Stock Items
        setLowStockData(prevData => {
            const newData = prevData.map(item => {
                const [valueStr, unit] = item.stock.split(' ');
                let value = parseInt(valueStr);
                let stockChange = Math.random() < 0.05 ? Math.floor(Math.random() * 20) + 10 : -(Math.floor(Math.random() * (item.status === StockStatus.Kritis ? 4 : 3)) + (item.status === StockStatus.Kritis ? 1 : 0));
                const newValue = Math.max(0, value + stockChange);
                const newStatus = newValue < 15 ? StockStatus.Kritis : StockStatus.PerluPerhatian;
                return { ...item, stock: `${newValue} ${unit}`, status: newStatus };
            });

            newData.forEach((item, index) => {
                const oldItem = prevData[index];
                if (shouldCreateStockCriticalAlert(oldItem.status, item.status)) {
                    setPendingNotification(createNotification({
                        priority: NotificationPriority.Sedang,
                        title: `Stok Kritis: ${item.name}`,
                        time: 'Baru saja',
                        description: `Stok tersisa ${item.stock}. Segera pesan ulang.`,
                        location: 'Gudang Pusat',
                        actionLabel: 'Buat permintaan pengadaan',
                    }));
                }
            });
            return newData;
        });

        // Update Notification Timestamps
        setNotificationData(prev => prev.map(n => {
            if (n.time.includes('Baru saja')) return { ...n, time: '1 menit yang lalu'};
            if (n.time.includes('menit yang lalu')) {
                const minutes = parseInt(n.time) || 1;
                return minutes < 59 ? { ...n, time: `${minutes + 1} menit yang lalu`} : { ...n, time: '1 jam yang lalu'};
            }
            return n;
        }));

        setLastUpdated(new Date());
        setIsUpdating(false);

      }, 500);

    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center mb-0 -mt-2">
            <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isUpdating ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
                <span className={`text-xs font-semibold ${isUpdating ? 'text-yellow-500' : 'text-green-500'}`}>
                    {isUpdating ? 'Updating...' : 'Live'}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">| Last update: {lastUpdated.toLocaleTimeString('id-ID')}</span>
            </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
      <PatientMetrics />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-grow space-y-6 lg:w-2/3">
          <HospitalStatusTable data={hospitalData} lastUpdated={lastUpdated} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HRUtilizationCard data={hrData} />
            <LogisticsTrendCard data={logisticsData} />
          </div>
          <LowStockItemsTable data={lowStockData} />
        </div>
        <div className="lg:w-1/3 w-full flex-shrink-0">
          <NotificationsPanel data={notificationData} onNotificationsChange={setNotificationData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
