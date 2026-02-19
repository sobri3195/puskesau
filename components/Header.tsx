import React from 'react';
import { BellIcon, SettingsIcon, ProfileIcon, MenuIcon, SunIcon, MoonIcon } from './Icons';
import { useTheme } from '../App';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-20 bg-white border-b flex-shrink-0 flex items-center justify-between px-4 sm:px-6 dark:bg-[#111827] dark:border-gray-700">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="lg:hidden text-gray-500 hover:text-gray-800 mr-4 dark:text-gray-400 dark:hover:text-white">
            <MenuIcon />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard Komando Terintegrasi</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Ringkasan status dan kinerja sistem medis TNI AU</p>
        </div>
      </div>
      <div className="flex items-center space-x-3 sm:space-x-5">
        <button onClick={toggleTheme} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
        <button className="text-gray-500 hover:text-gray-800 relative dark:text-gray-400 dark:hover:text-white">
          <BellIcon />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
          <SettingsIcon />
        </button>
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
             <ProfileIcon />
          </div>
          <span className="font-semibold text-gray-700 hidden sm:block dark:text-gray-300">Letkol Dr. Sutrisno</span>
        </div>
      </div>
    </header>
  );
};

export default Header;