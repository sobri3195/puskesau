import { NotificationData, NotificationPriority, StockStatus } from '../types';

type TargetView = 'Pelayanan Medis' | 'Logistik & Stok' | 'Distribusi' | 'Jadwal & Tugas';

export const isCriticalAlert = (notification: NotificationData): boolean =>
  notification.priority === NotificationPriority.Tinggi && notification.lifecycle !== 'resolved';

export const filterNotifications = (
  notifications: NotificationData[],
  criticalOnlyMode: boolean,
): NotificationData[] => (criticalOnlyMode ? notifications.filter(isCriticalAlert) : notifications);

const allowedLifecycleTransitions: Record<NotificationData['lifecycle'], NotificationData['lifecycle'][]> = {
  new: ['acknowledged', 'escalated', 'resolved'],
  acknowledged: ['escalated', 'resolved'],
  escalated: ['resolved', 'acknowledged'],
  resolved: [],
};

export const canTransitionLifecycle = (
  from: NotificationData['lifecycle'],
  to: NotificationData['lifecycle'],
): boolean => from === to || allowedLifecycleTransitions[from].includes(to);

export const transitionNotificationLifecycle = (
  notifications: NotificationData[],
  notificationId: string,
  lifecycle: NotificationData['lifecycle'],
): NotificationData[] =>
  notifications.map((notification) => {
    if (notification.id !== notificationId) return notification;
    if (!canTransitionLifecycle(notification.lifecycle, lifecycle)) return notification;
    return { ...notification, lifecycle };
  });

export const getTargetViewFromNotification = (title: string): TargetView | null => {
  const normalized = title.toLowerCase();

  if (normalized.includes('darah') || normalized.includes('icu') || normalized.includes('kritis')) return 'Pelayanan Medis';
  if (normalized.includes('stok')) return 'Logistik & Stok';
  if (normalized.includes('pengiriman')) return 'Distribusi';
  if (normalized.includes('jadwal')) return 'Jadwal & Tugas';

  return null;
};

export const shouldCreateHospitalCriticalAlert = (
  previousStatus: string,
  nextStatus: string,
): boolean => previousStatus !== 'Kritis' && nextStatus === 'Kritis';

export const shouldCreateStockCriticalAlert = (
  previousStatus: StockStatus,
  nextStatus: StockStatus,
): boolean => previousStatus !== StockStatus.Kritis && nextStatus === StockStatus.Kritis;
