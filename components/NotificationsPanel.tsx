import React, { useState, useEffect, useRef } from 'react';
import { NotificationData, NotificationPriority } from '../types';
import { ExclamationIcon, RightArrowIcon } from './Icons';
import { useNavigation, View } from '../App';

interface PriorityBadgeProps {
  priority: NotificationPriority;
}
const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const colorClasses = {
    [NotificationPriority.Tinggi]: 'bg-red-500 text-white',
    [NotificationPriority.Sedang]: 'bg-yellow-400 text-white',
    [NotificationPriority.Rendah]: 'bg-blue-500 text-white',
  };
  return (
    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${colorClasses[priority]}`}>
      {priority}
    </span>
  );
};

const priorityBorderColor = {
    [NotificationPriority.Tinggi]: 'border-red-500',
    [NotificationPriority.Sedang]: 'border-yellow-400',
    [NotificationPriority.Rendah]: 'border-blue-500',
}

interface NotificationsPanelProps {
  data: NotificationData[];
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ data }) => {
  const [newNotificationTitle, setNewNotificationTitle] = useState<string | null>(null);
  const prevDataRef = useRef<NotificationData[]>();
  const { setActiveView } = useNavigation();

  useEffect(() => {
    // Check if a new item was added at the top
    if (prevDataRef.current && data.length > 0 && prevDataRef.current.length > 0 && data[0].title !== prevDataRef.current[0].title) {
        setNewNotificationTitle(data[0].title);
        const timer = setTimeout(() => {
            setNewNotificationTitle(null);
        }, 2000); // Highlight duration
        return () => clearTimeout(timer);
    }
  }, [data]);

  useEffect(() => {
    prevDataRef.current = data;
  });

  const handleViewDetails = (notification: NotificationData) => {
    const title = notification.title.toLowerCase();
    let targetView: View | null = null;

    if (title.includes('darah') || title.includes('icu')) {
        targetView = 'Pelayanan Medis';
    } else if (title.includes('stok')) {
        targetView = 'Logistik & Stok';
    } else if (title.includes('pengiriman')) {
        targetView = 'Distribusi';
    } else if (title.includes('jadwal')) {
        targetView = 'Jadwal & Tugas';
    }
    
    if (targetView) {
        setActiveView(targetView);
    }
  };


  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-full flex flex-col dark:bg-gray-800 dark:border dark:border-gray-700/60">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
            <div className="text-red-500"><ExclamationIcon /></div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Notifikasi & Peringatan</h2>
        </div>
        <span className="text-xs text-white font-bold bg-red-500 px-3 py-1 rounded-full">{data.length} Baru</span>
      </div>
      <div className="flex-1 overflow-y-auto -mr-3 pr-3 space-y-4">
        {data.map((notification, index) => (
            <div 
              key={`${notification.title}-${index}`} 
              className={`p-4 border-l-4 rounded bg-gray-50/50 dark:bg-gray-900/40 ${priorityBorderColor[notification.priority]} transition-all duration-500 ${newNotificationTitle === notification.title ? 'bg-blue-50 dark:bg-blue-900/40 ring-2 ring-blue-400 dark:ring-blue-600' : ''}`}
            >
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <PriorityBadge priority={notification.priority} />
                <h3 className="font-bold text-gray-800 dark:text-gray-100">{notification.title}</h3>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{notification.time}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{notification.description}</p>
            <div className="flex justify-between items-center mt-3 text-sm">
              <span className="font-semibold text-gray-700 dark:text-gray-200">{notification.location}</span>
              <button onClick={() => handleViewDetails(notification)} className="flex items-center space-x-1 font-semibold text-blue-600 hover:underline dark:text-blue-400">
                <span>Lihat Detail</span>
                <RightArrowIcon />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
        <a href="#" className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
          Lihat Semua Notifikasi
        </a>
      </div>
    </div>
  );
};

export default NotificationsPanel;