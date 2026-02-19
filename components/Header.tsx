import React from 'react';
import { BellIcon, SettingsIcon, ProfileIcon, MenuIcon, SunIcon, MoonIcon } from './Icons';
import { useTheme } from '../App';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-20 bg-white border-b flex-shrink-0 flex items-center justify-between px-3 sm:px-6 dark:bg-[#111827] dark:border-gray-700 gap-2 sm:gap-4">
      <div className="flex items-center min-w-0 flex-1">
        <button onClick={onMenuClick} className="lg:hidden text-gray-500 hover:text-gray-800 mr-2 sm:mr-4 dark:text-gray-400 dark:hover:text-white flex-shrink-0">
            <MenuIcon />
        </button>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <img
            src="/logo.svg"
            alt="Logo MedTrack AU"
            className="hidden sm:block w-10 h-10 rounded-lg bg-blue-50 p-1 object-contain dark:bg-blue-900/30"
          />
          <div className="min-w-0">
            <h1 className="text-base sm:text-2xl font-bold text-gray-800 dark:text-gray-100 truncate">Dashboard Komando Terintegrasi</h1>
            <p className="hidden sm:block text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">Ringkasan status dan kinerja sistem medis TNI AU</p>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-5 flex-shrink-0">
        <button onClick={toggleTheme} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white p-1">
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
        <button className="text-gray-500 hover:text-gray-800 relative dark:text-gray-400 dark:hover:text-white p-1">
          <BellIcon />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="hidden sm:inline text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white p-1">
          <SettingsIcon />
        </button>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="p-1.5 sm:p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
             <ProfileIcon />
          </div>
          <span className="font-semibold text-gray-700 hidden md:block dark:text-gray-300">Letkol Dr. Sutrisno</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
