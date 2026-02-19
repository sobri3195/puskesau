import React from 'react';
import { View } from '../App';
import { DashboardIcon, BoxIcon, PulseIcon, UsersIcon, TruckIcon, CalendarIcon, ChartIcon, HelpIcon, XIcon, FileTextIcon } from './Icons';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeView: View;
  setActiveView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, activeView, setActiveView }) => {
  const menuItems: { name: View; icon: React.ReactNode; notification?: number }[] = [
    { name: 'Dashboard', icon: <DashboardIcon /> },
    { name: 'Logistik & Stok', icon: <BoxIcon />, notification: 3 },
    { name: 'Pelayanan Medis', icon: <PulseIcon /> },
    { name: 'SDM & Personel', icon: <UsersIcon /> },
    { name: 'Riwayat Pasien', icon: <FileTextIcon /> },
    { name: 'Distribusi', icon: <TruckIcon /> },
    { name: 'Jadwal & Tugas', icon: <CalendarIcon /> },
    { name: 'Incident Management', icon: <HelpIcon /> },
    { name: 'Laporan & Analitik', icon: <ChartIcon /> },
  ];

  const handleMenuClick = (view: View) => {
    setActiveView(view);
    if (window.innerWidth < 1024) { // Close sidebar on mobile after selection
        setIsOpen(false);
    }
  };

  return (
    <>
        <div 
            className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsOpen(false)}
        ></div>
        <div className={`fixed lg:relative z-40 w-64 bg-[#0a2540] text-white flex flex-col flex-shrink-0 h-full transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
            <div className="h-20 flex items-center justify-between px-6 border-b border-blue-900/50 flex-shrink-0">
                <div className="flex items-center">
                    <img
                        src="/logo.svg"
                        alt="Logo MedTrack AU"
                        className="w-10 h-10 rounded-md mr-3 bg-white/10 p-1 object-contain"
                    />
                    <div>
                        <h1 className="text-lg font-bold">MedTrack AU</h1>
                        <p className="text-xs text-blue-200">Dashboard Komando</p>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="lg:hidden text-blue-200 hover:text-white">
                    <XIcon />
                </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                <h2 className="px-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">Menu Utama</h2>
                <ul className="space-y-1">
                {menuItems.map((item) => {
                    const isActive = activeView === item.name;
                    return (
                        <li key={item.name}>
                        <button
                            onClick={() => handleMenuClick(item.name)}
                            className={`w-full group flex items-center p-2 rounded-md text-sm font-medium transition-colors duration-200 relative ${
                            isActive
                                ? 'bg-blue-600/80 text-white dark:bg-blue-500'
                                : 'text-blue-100 hover:bg-blue-800 hover:text-white dark:hover:bg-blue-700'
                            }`}
                        >
                            {isActive && <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-300 rounded-r-full"></div>}
                            <div className="w-6 h-6 mr-3">{item.icon}</div>
                            <span className="flex-1 text-left">{item.name}</span>
                            {item.notification && (
                            <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {item.notification}
                            </span>
                            )}
                        </button>
                        </li>
                    );
                })}
                </ul>
            </nav>
            <div className="px-4 py-6 border-t border-blue-900/50 flex-shrink-0">
                <a href="#" className="flex items-center p-2 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-800 hover:text-white dark:hover:bg-blue-700">
                <div className="w-6 h-6 mr-3"><HelpIcon /></div>
                <span>Bantuan</span>
                </a>
                <div className="text-center text-xs text-blue-400 mt-4">
                    <p>MedTrack AU v1.0.0</p>
                    <p>&copy; 2025 TNI AU</p>
                </div>
            </div>
        </div>
    </>
  );
};

export default Sidebar;