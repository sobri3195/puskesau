import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import MedicalServices from './components/MedicalServices';
import HRAndPersonnel from './components/HRAndPersonnel';
import Distribution from './components/Distribution';
import ScheduleAndTasks from './components/ScheduleAndTasks';
import ReportsAndAnalytics from './components/ReportsAndAnalytics';
import PatientHistory from './components/PatientHistory';
import LogisticsAndStock from './components/LogisticsAndStock';
import IncidentManagement from './components/IncidentManagement';
import { AlertSeverity, Incident, IncidentStatus, NotificationData, NotificationPriority, Task, TaskColumn } from './types';


// --- THEME CONTEXT ---
type Theme = 'light' | 'dark';
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'light';
        const storedTheme = localStorage.getItem('theme') as Theme;
        if (storedTheme) return storedTheme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
// --- END THEME CONTEXT ---

export type View = 
  | 'Dashboard' 
  | 'Logistik & Stok' 
  | 'Pelayanan Medis' 
  | 'SDM & Personel' 
  | 'Riwayat Pasien'
  | 'Distribusi' 
  | 'Jadwal & Tugas' 
  | 'Incident Management'
  | 'Laporan & Analitik';

const createNotification = (payload: Omit<NotificationData, 'id' | 'lifecycle'>): NotificationData => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  lifecycle: 'new',
  ...payload,
});

const inferDefaultTeam = (severity: AlertSeverity) => {
  if (severity === AlertSeverity.Kritis) return 'Tim Respon Insiden Prioritas';
  if (severity === AlertSeverity.Tinggi) return 'Tim Operasional Medis';
  return 'Tim Koordinasi';
};

const initialNotifications: NotificationData[] = [
  createNotification({ severity: AlertSeverity.Kritis, priority: NotificationPriority.Tinggi, title: 'Kebutuhan Darah Segera', time: '15 menit yang lalu', description: 'Kebutuhan darah golongan O- untuk kasus operasi darurat', location: 'RSPAU Hardjolukito', actionLabel: 'Aktifkan kode donor' }),
  createNotification({ severity: AlertSeverity.Tinggi, priority: NotificationPriority.Sedang, title: 'Ruang ICU Hampir Penuh', time: '45 menit yang lalu', description: 'Kapasitas ruang ICU tersisa 2 dari 10 tempat tidur', location: 'RS Lanud Halim', actionLabel: 'Alihkan pasien prioritas' }),
  createNotification({ severity: AlertSeverity.Rendah, priority: NotificationPriority.Rendah, title: 'Pengiriman Alkes Tiba', time: '1 jam yang lalu', description: 'Pengiriman alat kesehatan dari Depot Pusat telah tiba', location: 'RS Lanud Adisutjipto', actionLabel: 'Konfirmasi penerimaan' }),
  createNotification({ severity: AlertSeverity.Sedang, priority: NotificationPriority.Sedang, title: 'Jadwal Pemeliharaan Alat', time: '3 jam yang lalu', description: 'Pengingat: Jadwal pemeliharaan X-Ray portable hari ini', location: 'RS Lanud Halim', actionLabel: 'Jadwalkan teknisi' }),
];

const initialTaskColumns: TaskColumn[] = [
  { status: 'Tugas Baru', tasks: [
      { id: 'T1', title: 'Siapkan laporan stok bulanan', description: 'Kompilasi data dari semua RS', assignee: 'Staf Logistik', dueDate: '2025-05-30' },
      { id: 'T2', title: 'Jadwalkan pemeliharaan X-Ray', description: 'Hubungi vendor teknis', assignee: 'Tim Alkes', dueDate: '2025-06-02' },
  ]},
  { status: 'Sedang Dikerjakan', tasks: [
      { id: 'T3', title: 'Verifikasi data pasien', description: 'Cross-check data baru dari RSPAU', assignee: 'Admin Medis', dueDate: '2025-05-28' },
  ]},
  { status: 'Selesai', tasks: [
      { id: 'T4', title: 'Pesan ulang reagen lab', description: 'Pesanan untuk kebutuhan bulan Juni', assignee: 'Lab Pusat', dueDate: '2025-05-25' },
  ]},
];

interface OpsContextType {
  notifications: NotificationData[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationData[]>>;
  taskColumns: TaskColumn[];
  setTaskColumns: React.Dispatch<React.SetStateAction<TaskColumn[]>>;
  incidents: Incident[];
  updateIncidentStatus: (incidentId: string, status: IncidentStatus) => void;
}

const OpsContext = createContext<OpsContextType | undefined>(undefined);

export const useOpsData = () => {
  const context = useContext(OpsContext);
  if (context === undefined) {
    throw new Error('useOpsData must be used within OpsProvider');
  }
  return context;
};

const OpsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>(initialNotifications);
  const [taskColumns, setTaskColumns] = useState<TaskColumn[]>(initialTaskColumns);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [processedNotificationIds, setProcessedNotificationIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const eligibleNotifications = notifications.filter((item) => (
      (item.severity === AlertSeverity.Tinggi || item.severity === AlertSeverity.Kritis)
      && !processedNotificationIds.has(item.id)
    ));

    if (eligibleNotifications.length === 0) return;

    const generatedItems = eligibleNotifications.map((item, index) => {
      const seed = Date.now() + index;
      const incidentId = `INC-${seed}`;
      const slaMinutes = item.severity === AlertSeverity.Kritis ? 60 : 180;
      return {
        incident: {
          id: incidentId,
          title: `Incident: ${item.title}`,
          sourceNotificationId: item.id,
          severity: item.severity,
          status: 'open' as IncidentStatus,
          team: inferDefaultTeam(item.severity),
          createdAt: new Date().toISOString(),
          slaMinutes,
        },
        task: {
          id: `TI-${seed}`,
          title: `Tindak lanjut incident: ${item.title}`,
          description: `Investigasi awal dan koordinasi respon untuk alert ${item.severity.toUpperCase()}.`,
          assignee: inferDefaultTeam(item.severity),
          dueDate: new Date(Date.now() + slaMinutes * 60000).toISOString().split('T')[0],
          linkedIncidentId: incidentId,
        } as Task,
      };
    });

    setIncidents((prevIncidents) => [
      ...generatedItems.map((item) => item.incident),
      ...prevIncidents,
    ]);

    setTaskColumns((prevColumns) => prevColumns.map((column) => {
      if (column.status !== 'Tugas Baru') return column;
      return { ...column, tasks: [...generatedItems.map((item) => item.task), ...column.tasks] };
    }));

    setProcessedNotificationIds((prev) => {
      const next = new Set(prev);
      eligibleNotifications.forEach((item) => next.add(item.id));
      return next;
    });
  }, [notifications, processedNotificationIds]);

  const updateIncidentStatus = (incidentId: string, status: IncidentStatus) => {
    setIncidents((prev) => prev.map((incident) => (incident.id === incidentId ? { ...incident, status } : incident)));
  };

  return (
    <OpsContext.Provider value={{ notifications, setNotifications, taskColumns, setTaskColumns, incidents, updateIncidentStatus }}>
      {children}
    </OpsContext.Provider>
  );
};

// --- NAVIGATION CONTEXT ---
interface NavigationContextType {
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeView, setActiveView] = useState<View>('Dashboard');

    return (
        <NavigationContext.Provider value={{ activeView, setActiveView }}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigation = () => {
    const context = useContext(NavigationContext);
    if (context === undefined) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
};
// --- END NAVIGATION CONTEXT ---


const AppContent: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { activeView, setActiveView } = useNavigation();

  const renderView = () => {
    switch (activeView) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Logistik & Stok':
        return <LogisticsAndStock />;
      case 'Pelayanan Medis':
        return <MedicalServices />;
      case 'SDM & Personel':
        return <HRAndPersonnel />;
      case 'Riwayat Pasien':
        return <PatientHistory />;
      case 'Distribusi':
        return <Distribution />;
      case 'Jadwal & Tugas':
        return <ScheduleAndTasks />;
      case 'Incident Management':
        return <IncidentManagement />;
      case 'Laporan & Analitik':
        return <ReportsAndAnalytics />;
      default:
        return <div className="p-6 text-gray-800 dark:text-gray-100">
          <h1 className="text-2xl font-bold">Welcome to {activeView}</h1>
          <p className="mt-2">This section is under construction.</p>
        </div>;
    }
  };


  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans antialiased">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        activeView={activeView}
        setActiveView={setActiveView}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => (
    <ThemeProvider>
        <NavigationProvider>
          <OpsProvider>
            <AppContent />
          </OpsProvider>
        </NavigationProvider>
    </ThemeProvider>
);

export default App;
