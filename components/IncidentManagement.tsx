import React, { useMemo, useState } from 'react';
import { useOpsData } from '../App';
import { Incident, IncidentStatus } from '../types';

const statuses: IncidentStatus[] = ['open', 'triage', 'in-progress', 'resolved', 'closed'];

const statusStyles: Record<IncidentStatus, string> = {
  open: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200',
  triage: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200',
  'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
  resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
  closed: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-100',
};

const formatCountdown = (incident: Incident) => {
  const deadline = new Date(incident.createdAt).getTime() + incident.slaMinutes * 60000;
  const diffMs = deadline - Date.now();
  const overdue = diffMs < 0;
  const absMinutes = Math.floor(Math.abs(diffMs) / 60000);
  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;
  const value = `${hours}j ${minutes}m`;
  return {
    overdue,
    text: overdue ? `Terlambat ${value}` : `Sisa ${value}`,
  };
};

const IncidentManagement: React.FC = () => {
  const { incidents, updateIncidentStatus } = useOpsData();
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'tinggi' | 'kritis'>('all');

  const filteredIncidents = useMemo(() => {
    if (selectedSeverity === 'all') return incidents;
    return incidents.filter((item) => item.severity === selectedSeverity);
  }, [incidents, selectedSeverity]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-3 items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Incident Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Incident otomatis dari alert severity tinggi/kritis, terhubung ke notifikasi dan Jadwal & Tugas.</p>
        </div>
        <select
          value={selectedSeverity}
          onChange={(event) => setSelectedSeverity(event.target.value as 'all' | 'tinggi' | 'kritis')}
          className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="all">Semua Severity</option>
          <option value="tinggi">Tinggi</option>
          <option value="kritis">Kritis</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {statuses.map((status) => (
          <div key={status} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
            <p className="text-xs uppercase text-gray-500 dark:text-gray-300">{status}</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{incidents.filter((incident) => incident.status === status).length}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {filteredIncidents.map((incident) => {
          const countdown = formatCountdown(incident);
          return (
            <div key={incident.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex flex-wrap gap-3 justify-between">
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-gray-100">{incident.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-300">{incident.id} • Team: {incident.team} • Source notif: {incident.sourceNotificationId}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[incident.status]}`}>{incident.status}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className={`text-sm font-semibold ${countdown.overdue ? 'text-red-600 dark:text-red-300' : 'text-emerald-600 dark:text-emerald-300'}`}>
                  SLA: {countdown.text}
                </span>
                {countdown.overdue && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full dark:bg-red-900/40 dark:text-red-200">Overdue</span>}
                <select
                  value={incident.status}
                  onChange={(event) => updateIncidentStatus(incident.id, event.target.value as IncidentStatus)}
                  className="px-3 py-1.5 border rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700 text-sm"
                >
                  {statuses.map((statusOption) => <option key={statusOption} value={statusOption}>{statusOption}</option>)}
                </select>
              </div>
            </div>
          );
        })}
        {filteredIncidents.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center text-sm text-gray-500 dark:text-gray-300">
            Belum ada incident untuk filter ini.
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentManagement;
