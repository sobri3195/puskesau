import { describe, expect, it } from 'vitest';
import { NotificationPriority, StockStatus, type NotificationData } from '../../types';
import {
  canTransitionLifecycle,
  filterNotifications,
  getTargetViewFromNotification,
  shouldCreateHospitalCriticalAlert,
  shouldCreateStockCriticalAlert,
  transitionNotificationLifecycle,
} from '../../utils/notificationLogic';

const seedNotification = (overrides: Partial<NotificationData>): NotificationData => ({
  id: 'n-1',
  priority: NotificationPriority.Tinggi,
  lifecycle: 'new',
  title: 'Kebutuhan Darah Segera',
  time: 'Baru saja',
  description: 'desc',
  location: 'ICU',
  ...overrides,
});

describe('notification alert rules', () => {
  it('filters only unresolved critical alerts in critical-only mode', () => {
    const notifications: NotificationData[] = [
      seedNotification({ id: 'a', priority: NotificationPriority.Tinggi, lifecycle: 'new' }),
      seedNotification({ id: 'b', priority: NotificationPriority.Tinggi, lifecycle: 'resolved' }),
      seedNotification({ id: 'c', priority: NotificationPriority.Sedang, lifecycle: 'new' }),
    ];

    const filtered = filterNotifications(notifications, true);
    expect(filtered.map((n) => n.id)).toEqual(['a']);
  });

  it('maps notification title to target operational module', () => {
    expect(getTargetViewFromNotification('Kebutuhan darah ICU')).toBe('Pelayanan Medis');
    expect(getTargetViewFromNotification('Stok APD menipis')).toBe('Logistik & Stok');
    expect(getTargetViewFromNotification('Pengiriman terlambat')).toBe('Distribusi');
    expect(getTargetViewFromNotification('Jadwal operasi berubah')).toBe('Jadwal & Tugas');
  });

  it('creates critical alerts only when status transitions to kritis', () => {
    expect(shouldCreateHospitalCriticalAlert('Sibuk', 'Kritis')).toBe(true);
    expect(shouldCreateHospitalCriticalAlert('Kritis', 'Kritis')).toBe(false);
    expect(shouldCreateStockCriticalAlert(StockStatus.PerluPerhatian, StockStatus.Kritis)).toBe(true);
    expect(shouldCreateStockCriticalAlert(StockStatus.Kritis, StockStatus.Kritis)).toBe(false);
  });
});

describe('notification status transitions', () => {
  it('allows valid lifecycle transitions and rejects invalid ones', () => {
    expect(canTransitionLifecycle('new', 'acknowledged')).toBe(true);
    expect(canTransitionLifecycle('resolved', 'acknowledged')).toBe(false);
  });

  it('applies transition only when valid', () => {
    const notifications = [seedNotification({ id: 'x', lifecycle: 'new' }), seedNotification({ id: 'y', lifecycle: 'resolved' })];
    const moved = transitionNotificationLifecycle(notifications, 'x', 'escalated');
    const blocked = transitionNotificationLifecycle(moved, 'y', 'acknowledged');

    expect(moved.find((n) => n.id === 'x')?.lifecycle).toBe('escalated');
    expect(blocked.find((n) => n.id === 'y')?.lifecycle).toBe('resolved');
  });
});
