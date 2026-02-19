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
  | 'Laporan & Analitik';

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
            <AppContent />
        </NavigationProvider>
    </ThemeProvider>
);

export default App;