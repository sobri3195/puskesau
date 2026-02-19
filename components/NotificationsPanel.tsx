import React, { useState, useEffect, useMemo } from 'react';
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
};

const lifecycleStyles: Record<NotificationData['lifecycle'], string> = {
  new: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200',
  acknowledged: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
  escalated: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200',
  resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
};

interface NotificationsPanelProps {
  data: NotificationData[];
  onNotificationsChange: React.Dispatch<React.SetStateAction<NotificationData[]>>;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ data, onNotificationsChange }) => {
  const [newNotificationId, setNewNotificationId] = useState<string | null>(null);
  const [criticalOnlyMode, setCriticalOnlyMode] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(data[0]?.id ?? null);
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);
  const { setActiveView } = useNavigation();

  useEffect(() => {
    if (data.length > 0 && data[0].lifecycle === 'new') {
      setNewNotificationId(data[0].id);
      const timer = setTimeout(() => setNewNotificationId(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [data]);

  const filteredNotifications = useMemo(() => {
    if (!criticalOnlyMode) return data;
    return data.filter(
      (notification) => notification.priority === NotificationPriority.Tinggi && notification.lifecycle !== 'resolved',
    );
  }, [criticalOnlyMode, data]);

  useEffect(() => {
    if (!filteredNotifications.some((notification) => notification.id === selectedNotificationId)) {
      setSelectedNotificationId(filteredNotifications[0]?.id ?? null);
    }
  }, [filteredNotifications, selectedNotificationId]);

  const getTargetViewFromNotification = (notification: NotificationData): View | null => {
    const title = notification.title.toLowerCase();

    if (title.includes('darah') || title.includes('icu') || title.includes('kritis')) return 'Pelayanan Medis';
    if (title.includes('stok')) return 'Logistik & Stok';
    if (title.includes('pengiriman')) return 'Distribusi';
    if (title.includes('jadwal')) return 'Jadwal & Tugas';

    return null;
  };

  const updateLifecycle = (notificationId: string, lifecycle: NotificationData['lifecycle']) => {
    onNotificationsChange((previous) =>
      previous.map((notification) =>
        notification.id === notificationId ? { ...notification, lifecycle } : notification,
      ),
    );
  };

  const handleOneClickAction = (notification: NotificationData) => {
    const targetView = getTargetViewFromNotification(notification);
    updateLifecycle(notification.id, 'acknowledged');
    if (targetView) {
      setActiveView(targetView);
      setLastActionMessage(`Aksi dijalankan: ${notification.actionLabel ?? 'Tindak cepat'} → ${targetView}`);
    } else {
      setLastActionMessage(`Aksi dijalankan: ${notification.actionLabel ?? 'Tindak cepat'}`);
    }
    setTimeout(() => setLastActionMessage(null), 2500);
  };

  const selectedNotification = filteredNotifications.find((notification) => notification.id === selectedNotificationId);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey) return;

      if (event.code === 'KeyC') {
        event.preventDefault();
        setCriticalOnlyMode((prev) => !prev);
      }

      if (!selectedNotification) return;

      if (event.code === 'Enter') {
        event.preventDefault();
        handleOneClickAction(selectedNotification);
      }
      if (event.code === 'KeyA') {
        event.preventDefault();
        updateLifecycle(selectedNotification.id, 'acknowledged');
      }
      if (event.code === 'KeyE') {
        event.preventDefault();
        updateLifecycle(selectedNotification.id, 'escalated');
      }
      if (event.code === 'KeyR') {
        event.preventDefault();
        updateLifecycle(selectedNotification.id, 'resolved');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNotification]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-full flex flex-col dark:bg-gray-800 dark:border dark:border-gray-700/60">
      <div className="flex justify-between items-center mb-4 gap-3">
        <div className="flex items-center space-x-2">
          <div className="text-red-500"><ExclamationIcon /></div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Notifikasi & Peringatan</h2>
        </div>
        <button
          onClick={() => setCriticalOnlyMode((prev) => !prev)}
          className={`text-xs font-bold px-3 py-1 rounded-full ${criticalOnlyMode ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}
        >
          {criticalOnlyMode ? 'Critical-only ON' : 'Critical-only OFF'}
        </button>
      </div>
      <div className="mb-3 text-[11px] text-gray-500 dark:text-gray-400 flex flex-wrap gap-2">
        <span><strong>Shortcut:</strong></span>
        <span>Alt+C (critical-only)</span>
        <span>Alt+Enter (one-click action)</span>
        <span>Alt+A / Alt+E / Alt+R (lifecycle)</span>
      </div>
      {lastActionMessage && (
        <div className="mb-3 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-2 rounded dark:bg-blue-900/40 dark:text-blue-200">
          {lastActionMessage}
        </div>
      )}
      <div className="flex-1 overflow-y-auto -mr-3 pr-3 space-y-4">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => setSelectedNotificationId(notification.id)}
            className={`p-4 border-l-4 rounded bg-gray-50/50 dark:bg-gray-900/40 ${priorityBorderColor[notification.priority]} transition-all duration-500 cursor-pointer ${newNotificationId === notification.id ? 'bg-blue-50 dark:bg-blue-900/40 ring-2 ring-blue-400 dark:ring-blue-600' : ''} ${selectedNotificationId === notification.id ? 'ring-2 ring-indigo-400 dark:ring-indigo-600' : ''}`}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center space-x-2 flex-wrap">
                <PriorityBadge priority={notification.priority} />
                <h3 className="font-bold text-gray-800 dark:text-gray-100">{notification.title}</h3>
                <span className={`px-2 py-0.5 text-[11px] rounded-full font-semibold capitalize ${lifecycleStyles[notification.lifecycle]}`}>
                  {notification.lifecycle}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{notification.time}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{notification.description}</p>
            <div className="flex justify-between items-center mt-3 text-sm gap-2">
              <span className="font-semibold text-gray-700 dark:text-gray-200">{notification.location}</span>
              <div className="flex items-center gap-3">
                <button onClick={() => handleOneClickAction(notification)} className="font-semibold text-green-600 hover:underline dark:text-green-400">
                  {notification.actionLabel ?? 'Tindak Cepat'}
                </button>
                <button
                  onClick={() => {
                    const targetView = getTargetViewFromNotification(notification);
                    if (targetView) setActiveView(targetView);
                  }}
                  className="flex items-center space-x-1 font-semibold text-blue-600 hover:underline dark:text-blue-400"
                >
                  <span>Lihat Detail</span>
                  <RightArrowIcon />
                </button>
              </div>
            </div>
            <div className="mt-2 flex gap-2 text-[11px]">
              <button onClick={() => updateLifecycle(notification.id, 'acknowledged')} className="px-2 py-1 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">Acknowledge</button>
              <button onClick={() => updateLifecycle(notification.id, 'escalated')} className="px-2 py-1 rounded bg-orange-50 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200">Escalate</button>
              <button onClick={() => updateLifecycle(notification.id, 'resolved')} className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">Resolve</button>
            </div>
          </div>
        ))}
        {filteredNotifications.length === 0 && (
          <div className="text-center text-sm text-gray-500 py-8">Tidak ada notifikasi untuk mode ini.</div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;
