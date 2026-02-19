import React, { useState, useMemo } from 'react';
import { SurgerySchedule, SurgeryStatus, Specialist, SpecialistStatus } from '../types';
import { StethoscopeIcon, PlusIcon } from './Icons';
import Modal from './Modal';

const mockSurgeriesData: SurgerySchedule[] = [
    { time: '08:00', patientName: 'Sgt. Budi Santoso', procedure: 'Appendectomy', surgeon: 'Dr. Ahmad', room: 'OR 1', status: SurgeryStatus.Completed },
    { time: '10:30', patientName: 'Pvt. Siti Aminah', procedure: 'Knee Arthroscopy', surgeon: 'Dr. Lestari', room: 'OR 2', status: SurgeryStatus.InProgress },
    { time: '13:00', patientName: 'Cpl. Eko Prasetyo', procedure: 'Hernia Repair', surgeon: 'Dr. Ahmad', room: 'OR 1', status: SurgeryStatus.Scheduled },
    { time: '15:00', patientName: 'Airman Rina Wati', procedure: 'Gallbladder Removal', surgeon: 'Dr. Wijaya', room: 'OR 3', status: SurgeryStatus.Scheduled },
];

const mockSpecialistsData: Specialist[] = [
    { name: 'Dr. Ahmad (Bedah)', field: 'General Surgery', status: SpecialistStatus.Available },
    { name: 'Dr. Lestari (Ortopedi)', field: 'Orthopedics', status: SpecialistStatus.Available },
    { name: 'Dr. Wijaya (Anestesi)', field: 'Anesthesiology', status: SpecialistStatus.OnCall },
    { name: 'Dr. Kartini (Kardiologi)', field: 'Cardiology', status: SpecialistStatus.OffDuty },
    { name: 'Dr. Bachtiar (Radiologi)', field: 'Radiology', status: SpecialistStatus.Available },
];

const StatusBadge: React.FC<{ status: SurgeryStatus | SpecialistStatus }> = ({ status }) => {
    const statusClasses = {
        [SurgeryStatus.Scheduled]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        [SurgeryStatus.InProgress]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 animate-pulse',
        [SurgeryStatus.Completed]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        [SurgeryStatus.Canceled]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        [SpecialistStatus.Available]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        [SpecialistStatus.OnCall]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        [SpecialistStatus.OffDuty]: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses[status]}`}>{status}</span>;
}

const MedicalServices: React.FC = () => {
  const [surgeries, setSurgeries] = useState(mockSurgeriesData);
  const [specialists, setSpecialists] = useState(mockSpecialistsData);
  const [surgeryFilter, setSurgeryFilter] = useState('All');
  const [specialistFilter, setSpecialistFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredSurgeries = useMemo(() => {
    if (surgeryFilter === 'All') return surgeries;
    return surgeries.filter(s => s.status === surgeryFilter);
  }, [surgeries, surgeryFilter]);

  const filteredSpecialists = useMemo(() => {
    if (specialistFilter === 'All') return specialists;
    return specialists.filter(s => s.status === specialistFilter);
  }, [specialists, specialistFilter]);

  const handleAddSurgery = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newSurgery: SurgerySchedule = {
      time: formData.get('time') as string,
      patientName: formData.get('patientName') as string,
      procedure: formData.get('procedure') as string,
      surgeon: formData.get('surgeon') as string,
      room: formData.get('room') as string,
      status: SurgeryStatus.Scheduled,
    };
    setSurgeries(prev => [...prev, newSurgery].sort((a,b) => a.time.localeCompare(b.time)));
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Pelayanan Medis</h1>
      
      {/* Surgery Schedule */}
      <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Jadwal Operasi Hari Ini</h2>
            <div className="flex items-center gap-2">
                <select 
                    onChange={e => setSurgeryFilter(e.target.value)} 
                    value={surgeryFilter}
                    className="px-3 py-1 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 text-sm">
                    <option value="All">Semua Status</option>
                    {Object.values(SurgeryStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    <PlusIcon/> Jadwalkan Operasi
                </button>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Waktu</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Pasien</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Prosedur</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Dokter Bedah</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ruang</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSurgeries.map((surgery, index) => (
                <tr key={index}>
                  <td className="py-4 whitespace-nowrap text-sm font-semibold text-gray-700 dark:text-gray-200">{surgery.time}</td>
                  <td className="py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{surgery.patientName}</td>
                  <td className="py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{surgery.procedure}</td>
                  <td className="py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{surgery.surgeon}</td>
                  <td className="py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{surgery.room}</td>
                  <td className="py-4 whitespace-nowrap text-sm"><StatusBadge status={surgery.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Specialist Availability */}
      <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Ketersediaan Spesialis</h2>
            <select
                onChange={e => setSpecialistFilter(e.target.value)}
                value={specialistFilter}
                className="px-3 py-1 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 text-sm">
                <option value="All">Semua Status</option>
                {Object.values(SpecialistStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredSpecialists.map((specialist, index) => (
            <div key={index} className="p-4 border rounded-lg dark:border-gray-700 flex flex-col items-center text-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-2">
                <StethoscopeIcon />
              </div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{specialist.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{specialist.field}</p>
              <StatusBadge status={specialist.status} />
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Jadwalkan Operasi Baru">
        <form onSubmit={handleAddSurgery} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Waktu</label>
                <input type="time" name="time" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Pasien</label>
                <input type="text" name="patientName" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prosedur</label>
                <input type="text" name="procedure" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dokter Bedah</label>
                <input type="text" name="surgeon" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ruang Operasi</label>
                <input type="text" name="room" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Simpan Jadwal</button>
        </form>
      </Modal>
    </div>
  );
};

export default MedicalServices;