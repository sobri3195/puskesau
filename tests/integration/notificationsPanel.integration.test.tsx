import type React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NotificationsPanel from '../../components/NotificationsPanel';
import { NotificationPriority, type NotificationData } from '../../types';

const setActiveView = vi.fn();

vi.mock('../../App', () => ({
  useNavigation: () => ({ setActiveView }),
}));

const baseNotifications: NotificationData[] = [
  {
    id: '1',
    priority: NotificationPriority.Tinggi,
    lifecycle: 'new',
    title: 'Stok APD menipis',
    time: 'Baru saja',
    description: 'desc',
    location: 'Gudang',
    actionLabel: 'Tindak Cepat',
  },
  {
    id: '2',
    priority: NotificationPriority.Sedang,
    lifecycle: 'new',
    title: 'Jadwal rapat',
    time: '1 menit yang lalu',
    description: 'desc',
    location: 'Aula',
  },
];

describe('NotificationsPanel integration', () => {
  beforeEach(() => {
    setActiveView.mockReset();
  });

  it('toggles critical filter and executes one-click action across modules', async () => {
    const user = userEvent.setup();
    let notifications = [...baseNotifications];

    const onNotificationsChange: React.Dispatch<React.SetStateAction<NotificationData[]>> = (updater) => {
      notifications = typeof updater === 'function' ? updater(notifications) : updater;
      rerenderPanel();
    };

    const { rerender } = render(
      <NotificationsPanel data={notifications} onNotificationsChange={onNotificationsChange} />,
    );

    const rerenderPanel = () =>
      rerender(<NotificationsPanel data={notifications} onNotificationsChange={onNotificationsChange} />);

    await user.click(screen.getByRole('button', { name: /critical-only off/i }));
    expect(screen.queryByText('Jadwal rapat')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /tindak cepat/i }));

    expect(setActiveView).toHaveBeenCalledWith('Logistik & Stok');
    expect(notifications.find((n) => n.id === '1')?.lifecycle).toBe('acknowledged');
  });
});
