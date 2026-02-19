import React, { useState, useMemo } from 'react';
import { Delivery, DeliveryStatus } from '../types';
import { TruckIcon, MapIcon, BoxIcon, PlusIcon } from './Icons';
import Modal from './Modal';

// Mock Data
const mockDeliveriesData: Delivery[] = [
    { id: 'LOG-001', origin: 'Gudang Pusat', destination: 'RSPAU Hardjolukito', status: DeliveryStatus.InTransit, eta: '14:30', driver: 'Sgt. Agus' },
    { id: 'LOG-002', origin: 'Gudang Pusat', destination: 'RS Lanud Halim', status: DeliveryStatus.Delivered, eta: '11:00', driver: 'Cpl. Budi' },
    { id: 'LOG-003', origin: 'Depot Farmasi', destination: 'RS Lanud Adisutjipto', status: DeliveryStatus.Delayed, eta: '13:00', driver: 'Pvt. Chandra' },
    { id: 'LOG-004', origin: 'Gudang Pusat', destination: 'RS Lanud Husein S.', status: DeliveryStatus.Pending, eta: '16:00', driver: 'Sgt. Dedi' },
];

const StatusBadge: React.FC<{ status: DeliveryStatus }> = ({ status }) => {
    const statusClasses = {
        [DeliveryStatus.InTransit]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        [DeliveryStatus.Delivered]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        [DeliveryStatus.Delayed]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        [DeliveryStatus.Pending]: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses[status]}`}>{status}</span>;
}

const ProgressBar: React.FC<{ value: number, color: string }> = ({ value, color }) => (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
        <div className={`${color} h-4 rounded-full text-center text-white text-xs font-bold leading-4`} style={{ width: `${value}%` }}>{value}%</div>
    </div>
);


const Distribution: React.FC = () => {
    const [deliveries, setDeliveries] = useState(mockDeliveriesData);
    const [filter, setFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredDeliveries = useMemo(() => {
        if (filter === 'All') return deliveries;
        return deliveries.filter(d => d.status === filter);
    }, [deliveries, filter]);

    const handleAddDelivery = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newDelivery: Delivery = {
            id: `LOG-${String(deliveries.length + 1).padStart(3, '0')}`,
            origin: formData.get('origin') as string,
            destination: formData.get('destination') as string,
            driver: formData.get('driver') as string,
            eta: formData.get('eta') as string,
            status: DeliveryStatus.Pending,
        };
        setDeliveries(prev => [newDelivery, ...prev]);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Distribusi Logistik</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center"><MapIcon className="mr-2"/> Pelacakan Pengiriman</h2>
                    <div className="relative h-96 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500 dark:text-gray-400">Map Area Placeholder</p>
                        <div className="absolute top-1/4 left-1/4 text-blue-500"><TruckIcon /></div>
                        <div className="absolute top-1/2 left-3/4 text-red-500"><TruckIcon /></div>
                        <div className="absolute bottom-1/4 left-2/3 text-green-500"><TruckIcon /></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center"><BoxIcon className="mr-2"/> Inventaris Gudang Pusat</h2>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Obat-obatan</p>
                            <ProgressBar value={75} color="bg-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Alat Kesehatan</p>
                            <ProgressBar value={60} color="bg-green-500" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Bahan Medis</p>
                            <ProgressBar value={85} color="bg-yellow-500" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">APD</p>
                            <ProgressBar value={90} color="bg-purple-500" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Status Pengiriman</h2>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                        <PlusIcon/> Kirim Logistik Baru
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-2">Filter Status:</span>
                    {['All', ...Object.values(DeliveryStatus)].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-200 ${
                                filter === status
                                    ? 'bg-blue-600 text-white shadow'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            {status === 'All' ? 'Semua Status' : status}
                        </button>
                    ))}
                </div>

                 <div className="overflow-x-auto">
                    <table className="min-w-full">
                         <thead>
                            <tr className="border-b dark:border-gray-700">
                                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</th>
                                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Asal</th>
                                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tujuan</th>
                                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Pengemudi</th>
                                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ETA</th>
                                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                            </tr>
                        </thead>
                         <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredDeliveries.map(d => (
                                <tr key={d.id}>
                                    <td className="py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">{d.id}</td>
                                    <td className="py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{d.origin}</td>
                                    <td className="py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{d.destination}</td>
                                    <td className="py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{d.driver}</td>
                                    <td className="py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{d.eta}</td>
                                    <td className="py-4 whitespace-nowrap text-sm"><StatusBadge status={d.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Kirim Logistik Baru">
                <form onSubmit={handleAddDelivery} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Asal</label>
                        <input type="text" name="origin" required defaultValue="Gudang Pusat" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tujuan</label>
                        <input type="text" name="destination" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pengemudi</label>
                        <input type="text" name="driver" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ETA</label>
                        <input type="time" name="eta" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Buat Pengiriman</button>
                </form>
            </Modal>
        </div>
    );
};

export default Distribution;
