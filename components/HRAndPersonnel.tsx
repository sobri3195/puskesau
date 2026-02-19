import React, { useState, useMemo } from 'react';
import { Personnel, PersonnelStatus } from '../types';
import { BriefcaseIcon, UsersIcon, PlusIcon, ChevronUpIcon, ChevronDownIcon } from './Icons';
import Modal from './Modal';

// Mock Data
const mockPersonnelData: Personnel[] = [
    { id: 'TNI001', name: 'Dr. Sutrisno', role: 'Dokter Spesialis', department: 'Bedah Umum', status: PersonnelStatus.Active, phone: '0812-3456-7890' },
    { id: 'TNI002', name: 'Ns. Ani Yudhoyono', role: 'Perawat Senior', department: 'IGD', status: PersonnelStatus.Active, phone: '0812-3456-7891' },
    { id: 'TNI003', name: 'Dr. Lestari', role: 'Dokter Umum', department: 'Poli Umum', status: PersonnelStatus.OnLeave, phone: '0812-3456-7892' },
    { id: 'TNI004', name: 'Bambang P.', role: 'Analis Lab', department: 'Laboratorium', status: PersonnelStatus.Active, phone: '0812-3456-7893' },
    { id: 'TNI005', name: 'Rina Wati', role: 'Apoteker', department: 'Farmasi', status: PersonnelStatus.Active, phone: '0812-3456-7894' },
    { id: 'TNI006', name: 'Eko Prasetyo', role: 'Radiografer', department: 'Radiologi', status: PersonnelStatus.Active, phone: '0812-3456-7895' },
    { id: 'TNI007', name: 'Siti Aminah', role: 'Perawat', department: 'IGD', status: PersonnelStatus.Active, phone: '0812-3456-7896' },
    { id: 'TNI008', name: 'Dr. Wijaya', role: 'Dokter Spesialis', department: 'Anestesiologi', status: PersonnelStatus.Active, phone: '0812-3456-7897' },
];

const StatusBadge: React.FC<{ status: PersonnelStatus }> = ({ status }) => {
    const statusClasses = {
        [PersonnelStatus.Active]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        [PersonnelStatus.OnLeave]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    };
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses[status]}`}>{status}</span>;
}

type SortKeys = keyof Personnel;
type SortDirection = 'ascending' | 'descending';

const getHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
        return <span>{text}</span>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
        <span>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <span key={i} className="bg-yellow-200 dark:bg-yellow-700/50 rounded px-1">
                        {part}
                    </span>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </span>
    );
};


const HRAndPersonnel: React.FC = () => {
    const [personnel, setPersonnel] = useState(mockPersonnelData);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('All');
    const [selectedDepartment, setSelectedDepartment] = useState('All');
    const [sortConfig, setSortConfig] = useState<{ key: SortKeys; direction: SortDirection } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const roles = ['All', ...Array.from(new Set(personnel.map(p => p.role)))];
    const departments = ['All', ...Array.from(new Set(personnel.map(p => p.department)))];

    const filteredAndSortedPersonnel = useMemo(() => {
        let filtered = personnel.filter(p => {
            const matchesSearch = searchTerm === '' ||
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.id.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesRole = selectedRole === 'All' || p.role === selectedRole;
            const matchesDepartment = selectedDepartment === 'All' || p.department === selectedDepartment;

            return matchesSearch && matchesRole && matchesDepartment;
        });

        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filtered;
    }, [personnel, searchTerm, selectedRole, selectedDepartment, sortConfig]);

    const requestSort = (key: SortKeys) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: SortKeys) => {
        if (!sortConfig || sortConfig.key !== key) return <ChevronDownIcon className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />;
        return sortConfig.direction === 'ascending' 
            ? <ChevronUpIcon className="w-3 h-3" /> 
            : <ChevronDownIcon className="w-3 h-3" />;
    };

    const handleAddPersonnel = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newPersonnel: Personnel = {
            id: `TNI${String(personnel.length + 1).padStart(3, '0')}`,
            name: formData.get('name') as string,
            role: formData.get('role') as string,
            department: formData.get('department') as string,
            phone: formData.get('phone') as string,
            status: PersonnelStatus.Active,
        };
        setPersonnel(prev => [...prev, newPersonnel]);
        setIsModalOpen(false);
    };


    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">SDM & Personel</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg"><UsersIcon/></div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Personel Aktif</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{personnel.filter(p => p.status === PersonnelStatus.Active).length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg"><BriefcaseIcon/></div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Departemen</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{departments.length -1}</p>
                    </div>
                </div>
                 <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg"><UsersIcon/></div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Personel Cuti</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{personnel.filter(p => p.status === PersonnelStatus.OnLeave).length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Direktori Personel</h2>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Cari ID atau Nama..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-auto px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                         <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full sm:w-auto px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        >
                            {roles.map(role => <option key={role} value={role}>{role === 'All' ? 'Semua Peran' : role}</option>)}
                        </select>
                         <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="w-full sm:w-auto px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        >
                            {departments.map(dept => <option key={dept} value={dept}>{dept === 'All' ? 'Semua Departemen' : dept}</option>)}
                        </select>
                         <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <PlusIcon/> Tambah Personel
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                         <thead>
                            <tr className="border-b dark:border-gray-700">
                                 <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    <button onClick={() => requestSort('id')} className="group flex items-center gap-1">ID {getSortIcon('id')}</button>
                                </th>
                                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    <button onClick={() => requestSort('name')} className="group flex items-center gap-1">Nama {getSortIcon('name')}</button>
                                </th>
                                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    <button onClick={() => requestSort('role')} className="group flex items-center gap-1">Peran {getSortIcon('role')}</button>
                                </th>
                                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    <button onClick={() => requestSort('department')} className="group flex items-center gap-1">Departemen {getSortIcon('department')}</button>
                                </th>
                                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    <button onClick={() => requestSort('status')} className="group flex items-center gap-1">Status {getSortIcon('status')}</button>
                                </th>
                                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kontak</th>
                            </tr>
                        </thead>
                         <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredAndSortedPersonnel.length > 0 ? filteredAndSortedPersonnel.map(p => (
                                <tr key={p.id}>
                                    <td className="py-4 whitespace-nowrap text-sm font-mono text-gray-600 dark:text-gray-300">{getHighlightedText(p.id, searchTerm)}</td>
                                    <td className="py-4 whitespace-nowrap text-sm font-semibold text-gray-700 dark:text-gray-200">{getHighlightedText(p.name, searchTerm)}</td>
                                    <td className="py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{p.role}</td>
                                    <td className="py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{p.department}</td>
                                    <td className="py-4 whitespace-nowrap text-sm"><StatusBadge status={p.status} /></td>
                                    <td className="py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{p.phone}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        Tidak ada personel yang cocok dengan kriteria filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Personel Baru">
                <form onSubmit={handleAddPersonnel} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Lengkap</label>
                        <input type="text" name="name" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Peran</label>
                        <input type="text" name="role" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Departemen</label>
                        <input type="text" name="department" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">No. Telepon</label>
                        <input type="tel" name="phone" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Simpan Personel</button>
                </form>
            </Modal>
        </div>
    );
};

export default HRAndPersonnel;