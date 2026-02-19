import React, { useState, useMemo, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, NavLink, useParams, Outlet, Navigate, useOutletContext, useNavigate } from 'react-router-dom';
import { PatientRecord, MedicalVisit, LabResult } from '../types';
import { UsersIcon, ProfileIcon, PlusIcon, EditIcon, FilterIcon, ExclamationIcon, TrashIcon, ChevronDownIcon } from './Icons';
import Modal from './Modal';

// Mock Data
const mockPatientsData: PatientRecord[] = [
    {
        id: 'P-08177',
        name: 'Sgt. Budi Santoso',
        dob: '1985-03-15',
        gender: 'Pria',
        bloodType: 'O+',
        contact: '0812-1111-2222',
        address: 'Jl. Merpati No. 12, Jakarta Timur',
        emergencyContact: { name: 'Rini Santoso (Istri)', phone: '0812-1111-2223' },
        alerts: ['Alergi Penisilin'],
        visits: [
            {
                id: 'V01', date: '2025-05-10', hospital: 'RS Lanud Halim', doctor: 'Dr. Lestari', diagnosis: 'Influenza Tipe A',
                notes: {
                    symptoms: 'Pasien mengeluh demam tinggi (38.5°C), sakit kepala, nyeri otot, dan batuk kering selama 2 hari.',
                    findings: 'Hasil tes cepat antigen menunjukkan positif Influenza Tipe A. Auskultasi paru-paru bersih.',
                    treatmentPlan: 'Diberikan resep antiviral Oseltamivir. Anjuran untuk istirahat cukup, hidrasi yang baik, dan isolasi mandiri selama 5 hari.'
                },
                prescriptions: [
                    { name: 'Oseltamivir', dosage: '75mg', frequency: '2x sehari', duration: '5 hari' },
                    { name: 'Paracetamol', dosage: '500mg', frequency: '3x sehari, jika demam', duration: '5 hari' }
                ]
            },
            {
                id: 'V02', date: '2025-01-22', hospital: 'RS Lanud Halim', doctor: 'Dr. Wijaya', diagnosis: 'Sprain pergelangan kaki ringan',
                notes: {
                    symptoms: 'Nyeri dan bengkak pada pergelangan kaki kanan setelah terkilir saat latihan fisik.',
                    findings: 'Terdapat pembengkakan ringan dan nyeri tekan pada ligamen talofibular anterior. Rentang gerak sedikit terbatas karena nyeri. Tidak ada fraktur yang terlihat pada X-ray.',
                    treatmentPlan: 'Metode RICE (Rest, Ice, Compression, Elevation). Diberikan resep anti-inflamasi bila perlu. Fisioterapi direkomendasikan jika tidak membaik dalam 1 minggu.'
                },
                prescriptions: [
                    { name: 'Ibuprofen', dosage: '400mg', frequency: 'Bila perlu (maks 3x sehari)', duration: '7 hari' }
                ]
            },
        ],
        labResults: [
            { id: 'L01', testName: 'Darah Lengkap', result: 'Normal', normalRange: 'Lihat rincian', date: '2025-01-22' },
        ],
    },
    {
        id: 'P-09213',
        name: 'Pvt. Siti Aminah',
        dob: '1998-11-20',
        gender: 'Wanita',
        bloodType: 'A-',
        contact: '0813-3333-4444',
        address: 'Jl. Garuda No. 5, Yogyakarta',
        emergencyContact: { name: 'Ahmad (Ayah)', phone: '0813-3333-4445' },
        visits: [
            {
                id: 'V03', date: '2025-04-01', hospital: 'RSPAU Hardjolukito', doctor: 'Dr. Ahmad', diagnosis: 'Kontrol Pasca-Appendectomy',
                notes: {
                    symptoms: 'Pasien datang untuk kontrol 1 minggu setelah operasi usus buntu. Mengeluh sedikit nyeri pada area bekas operasi.',
                    findings: 'Luka operasi kering dan bersih, tidak ada tanda-tanda infeksi. Jahitan akan dilepas.',
                    treatmentPlan: 'Jahitan dilepas. Pasien diizinkan untuk kembali beraktivitas ringan. Hindari mengangkat beban berat selama 2 minggu ke depan.'
                },
                prescriptions: [
                    { name: 'Amoxicillin', dosage: '500mg', frequency: '3x sehari', duration: 'Habiskan' },
                    { name: 'Paracetamol', dosage: '500mg', frequency: 'Bila perlu', duration: '-' }
                ]
            },
        ],
        labResults: [],
    },
    {
        id: 'P-07654',
        name: 'Cpl. Eko Prasetyo',
        dob: '1992-07-08',
        gender: 'Pria',
        bloodType: 'B+',
        contact: '0815-5555-6666',
        address: 'Jl. Elang No. 8, Bandung',
        emergencyContact: { name: 'Dewi (Istri)', phone: '0815-5555-6667' },
        alerts: ['Hipertensi', 'Kolesterol Tinggi'],
        visits: [
            {
                id: 'V04', date: '2025-03-18', hospital: 'RS Lanud Husein S.', doctor: 'Dr. Kartini', diagnosis: 'Kontrol Hipertensi',
                notes: {
                    symptoms: 'Pemeriksaan rutin, tidak ada keluhan spesifik.',
                    findings: 'Tekanan darah 145/90 mmHg. Sedikit di atas normal. Hasil lab menunjukkan kolesterol total 210 mg/dL.',
                    treatmentPlan: 'Lanjutkan pengobatan Amlodipine. Anjuran untuk meningkatkan aktivitas fisik dan diet rendah garam serta rendah lemak.'
                },
                prescriptions: [
                    { name: 'Amlodipine', dosage: '5mg', frequency: '1x sehari', duration: '30 hari' }
                ]
            },
        ],
        labResults: [
            { id: 'L02', testName: 'Kolesterol Total', result: '210 mg/dL', normalRange: '< 200 mg/dL', date: '2025-03-18' },
            { id: 'L03', testName: 'Gula Darah Puasa', result: '95 mg/dL', normalRange: '70-99 mg/dL', date: '2025-03-18' },
        ],
    },
];

const getInitialState = <T,>(key: string, defaultValue: T): T => {
    try {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage for key "${key}":`, error);
        return defaultValue;
    }
};

type PatientContextType = {
    patient: PatientRecord;
    updatePatientData: (patientId: string, updatedData: Partial<PatientRecord>) => void;
};

const PatientInfo: React.FC = () => {
    const { patient } = useOutletContext<PatientContextType>();
    const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
        <div className="grid grid-cols-3 gap-4 py-2">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
            <dd className="text-sm text-gray-900 dark:text-gray-100 col-span-2">{value}</dd>
        </div>
    );
    return (<dl className="divide-y divide-gray-200 dark:divide-gray-700"><InfoRow label="Tanggal Lahir" value={patient.dob} /><InfoRow label="Jenis Kelamin" value={patient.gender} /><InfoRow label="Golongan Darah" value={patient.bloodType} /><InfoRow label="Kontak" value={patient.contact} /><InfoRow label="Alamat" value={patient.address} /><InfoRow label="Kontak Darurat" value={`${patient.emergencyContact.name} (${patient.emergencyContact.phone})`} /></dl>);
};

const PatientVisits: React.FC = () => {
    const { patient, updatePatientData } = useOutletContext<PatientContextType>();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingVisit, setEditingVisit] = useState<MedicalVisit | null>(null);
    const [visitToDelete, setVisitToDelete] = useState<MedicalVisit | null>(null);
    const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null);

    const toggleVisitDetails = (visitId: string) => {
        setExpandedVisitId(prevId => (prevId === visitId ? null : visitId));
    };

    const sortedVisits = useMemo(() => {
        return [...patient.visits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [patient.visits]);

    const handleAddVisit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newVisit: MedicalVisit = {
            id: `V${Date.now()}`,
            date: formData.get('date') as string,
            hospital: formData.get('hospital') as string,
            doctor: formData.get('doctor') as string,
            diagnosis: formData.get('diagnosis') as string,
            notes: {
                symptoms: formData.get('symptoms') as string,
                findings: formData.get('findings') as string,
                treatmentPlan: formData.get('treatmentPlan') as string,
            },
            prescriptions: [],
        };
        updatePatientData(patient.id, { visits: [newVisit, ...patient.visits] });
        setIsAddModalOpen(false);
    };

    const handleUpdateVisit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingVisit) return;
        const formData = new FormData(e.currentTarget);
        const updatedVisit: MedicalVisit = {
            ...editingVisit,
            date: formData.get('date') as string,
            hospital: formData.get('hospital') as string,
            doctor: formData.get('doctor') as string,
            diagnosis: formData.get('diagnosis') as string,
            notes: {
                symptoms: formData.get('symptoms') as string,
                findings: formData.get('findings') as string,
                treatmentPlan: formData.get('treatmentPlan') as string,
            },
        };
        const newVisits = patient.visits.map(v => v.id === updatedVisit.id ? updatedVisit : v);
        updatePatientData(patient.id, { visits: newVisits });
        setEditingVisit(null);
    };
    
    const handleDeleteVisit = () => {
        if (!visitToDelete) return;
        const newVisits = patient.visits.filter(v => v.id !== visitToDelete.id);
        updatePatientData(patient.id, { visits: newVisits });
        setVisitToDelete(null);
    };

    const VisitFormFields: React.FC<{ visit?: MedicalVisit }> = ({ visit }) => (
        <>
            <div><label className="block text-sm">Tanggal Kunjungan</label><input type="date" name="date" defaultValue={visit?.date} required className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md"/></div>
            <div><label className="block text-sm">Rumah Sakit</label><input type="text" name="hospital" defaultValue={visit?.hospital} required className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md"/></div>
            <div><label className="block text-sm">Dokter</label><input type="text" name="doctor" defaultValue={visit?.doctor} required className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md"/></div>
            <div><label className="block text-sm">Diagnosis</label><input type="text" name="diagnosis" defaultValue={visit?.diagnosis} required className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md"/></div>
            <div className="pt-2 mt-2 border-t dark:border-gray-600"><label className="block text-sm font-semibold">Catatan Dokter</label></div>
            <div><label className="block text-sm">Gejala</label><textarea name="symptoms" defaultValue={visit?.notes.symptoms} rows={2} className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md"></textarea></div>
            <div><label className="block text-sm">Temuan</label><textarea name="findings" defaultValue={visit?.notes.findings} rows={2} className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md"></textarea></div>
            <div><label className="block text-sm">Rencana Perawatan</label><textarea name="treatmentPlan" defaultValue={visit?.notes.treatmentPlan} rows={2} className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md"></textarea></div>
        </>
    );

    return (
        <div className="space-y-4">
            <button onClick={() => setIsAddModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm mb-4"><PlusIcon/> Tambah Kunjungan</button>
            {sortedVisits.length > 0 ? sortedVisits.map(visit => {
                const isExpanded = expandedVisitId === visit.id;
                return (
                    <div key={visit.id} className="p-4 border rounded-lg dark:border-gray-700 transition-all duration-300">
                        <div className="flex justify-between items-start cursor-pointer" onClick={() => toggleVisitDetails(visit.id)}>
                            <div>
                                <p className="font-bold text-gray-800 dark:text-gray-100 pr-4">{visit.diagnosis}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{visit.hospital} &bull; {visit.doctor}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{visit.date}</p>
                                <button className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} aria-expanded={isExpanded}>
                                    <ChevronDownIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {isExpanded && (
                            <div className="mt-4 pt-4 border-t dark:border-gray-600 space-y-4 animate-fade-in-down">
                                <div>
                                    <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2">Catatan Dokter</h4>
                                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2 pl-4 border-l-2 dark:border-gray-600">
                                        <div><strong className="text-gray-800 dark:text-gray-100">Gejala:</strong><p className="whitespace-pre-wrap">{visit.notes.symptoms}</p></div>
                                        <div><strong className="text-gray-800 dark:text-gray-100">Temuan:</strong><p className="whitespace-pre-wrap">{visit.notes.findings}</p></div>
                                        <div><strong className="text-gray-800 dark:text-gray-100">Rencana Perawatan:</strong><p className="whitespace-pre-wrap">{visit.notes.treatmentPlan}</p></div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2">Resep Obat</h4>
                                    {visit.prescriptions.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-sm">
                                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                                    <tr>
                                                        <th className="py-2 px-3 text-left font-medium text-gray-600 dark:text-gray-300">Obat</th>
                                                        <th className="py-2 px-3 text-left font-medium text-gray-600 dark:text-gray-300">Dosis</th>
                                                        <th className="py-2 px-3 text-left font-medium text-gray-600 dark:text-gray-300">Frekuensi</th>
                                                        <th className="py-2 px-3 text-left font-medium text-gray-600 dark:text-gray-300">Durasi</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                                    {visit.prescriptions.map((p, i) => (
                                                        <tr key={i}>
                                                            <td className="py-2 px-3 font-semibold text-gray-800 dark:text-gray-200">{p.name}</td>
                                                            <td className="py-2 px-3">{p.dosage}</td>
                                                            <td className="py-2 px-3">{p.frequency}</td>
                                                            <td className="py-2 px-3">{p.duration}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada resep obat.</p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button onClick={() => setEditingVisit(visit)} className="flex items-center gap-1 text-xs px-2 py-1 rounded border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"><EditIcon className="w-3 h-3" /> Edit</button>
                                    <button onClick={() => setVisitToDelete(visit)} className="flex items-center gap-1 text-xs px-2 py-1 rounded border text-red-600 border-red-200 dark:border-red-800 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40"><TrashIcon className="w-3 h-3" /> Hapus</button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            }) : <p className="text-center text-gray-500 dark:text-gray-400">Tidak ada riwayat kunjungan.</p>}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Tambah Kunjungan Medis"><form onSubmit={handleAddVisit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-2"><VisitFormFields /><button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md">Simpan</button></form></Modal>
            {editingVisit && <Modal isOpen={!!editingVisit} onClose={() => setEditingVisit(null)} title="Edit Kunjungan Medis"><form onSubmit={handleUpdateVisit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-2"><VisitFormFields visit={editingVisit} /><button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md">Update</button></form></Modal>}
            <Modal isOpen={!!visitToDelete} onClose={() => setVisitToDelete(null)} title="Konfirmasi Hapus Kunjungan">
                <div>
                    <p className="text-gray-700 dark:text-gray-300">
                        Apakah Anda yakin ingin menghapus kunjungan medis pada tanggal <span className="font-semibold">{visitToDelete?.date}</span> dengan diagnosis "{visitToDelete?.diagnosis}"? Tindakan ini tidak dapat diurungkan.
                    </p>
                    <div className="flex justify-end gap-4 mt-6">
                        <button onClick={() => setVisitToDelete(null)} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Batal</button>
                        <button onClick={handleDeleteVisit} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Hapus</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const PatientLabs: React.FC = () => {
    const { patient, updatePatientData } = useOutletContext<PatientContextType>();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingLab, setEditingLab] = useState<LabResult | null>(null);
    const [labToDelete, setLabToDelete] = useState<LabResult | null>(null);
    const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', testName: '', result: '' });

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const clearFilters = () => {
        setFilters({ dateFrom: '', dateTo: '', testName: '', result: '' });
    };

    const filteredResults = useMemo(() => {
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
        const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
        if (toDate) toDate.setHours(23, 59, 59, 999); // Make end date inclusive

        return patient.labResults.filter(lab => {
            if (!lab.date) return false;
            const labDate = new Date(lab.date);
            
            const nameMatches = !filters.testName || lab.testName.toLowerCase().includes(filters.testName.toLowerCase());
            
            let resultMatches = true;
            if (filters.result && filters.result !== 'All') {
                if(filters.result === 'Normal') {
                    resultMatches = lab.result.toLowerCase() === 'normal';
                } else if(filters.result === 'Abnormal') {
                    resultMatches = lab.result.toLowerCase() !== 'normal';
                }
            }
            
            const afterFromDate = !fromDate || labDate >= fromDate;
            const beforeToDate = !toDate || labDate <= toDate;

            return nameMatches && resultMatches && afterFromDate && beforeToDate;
        });
    }, [patient.labResults, filters]);

    const handleAddLabResult = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newLab: LabResult = {
            id: `L${Date.now()}`,
            testName: formData.get('testName') as string,
            date: formData.get('date') as string,
            result: formData.get('result') as string,
            normalRange: formData.get('normalRange') as string,
        };
        updatePatientData(patient.id, { labResults: [newLab, ...patient.labResults] });
        setIsAddModalOpen(false);
    };

    const handleUpdateLabResult = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingLab) return;
        const formData = new FormData(e.currentTarget);
        const updatedLab: LabResult = {
            ...editingLab,
            testName: formData.get('testName') as string,
            date: formData.get('date') as string,
            result: formData.get('result') as string,
            normalRange: formData.get('normalRange') as string,
        };
        const newLabs = patient.labResults.map(l => l.id === updatedLab.id ? updatedLab : l);
        updatePatientData(patient.id, { labResults: newLabs });
        setEditingLab(null);
    };

    const handleDeleteLabResult = () => {
        if (!labToDelete) return;
        const newLabs = patient.labResults.filter(l => l.id !== labToDelete.id);
        updatePatientData(patient.id, { labResults: newLabs });
        setLabToDelete(null);
    };

    return (
        <div>
            <div className="p-4 border rounded-lg dark:border-gray-700 space-y-3 bg-gray-50 dark:bg-gray-700/50 mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Filter Hasil Lab</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">Nama Tes</label>
                        <input type="text" name="testName" placeholder="e.g., Darah Lengkap" value={filters.testName} onChange={handleFilterChange} className="w-full mt-1 px-2 py-1 border rounded-md text-sm dark:bg-gray-600 dark:border-gray-500" />
                    </div>
                     <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">Hasil</label>
                        <select name="result" value={filters.result} onChange={handleFilterChange} className="w-full mt-1 px-2 py-1 border rounded-md text-sm dark:bg-gray-600 dark:border-gray-500">
                            <option value="All">Semua</option>
                            <option value="Normal">Normal</option>
                            <option value="Abnormal">Abnormal</option>
                        </select>
                    </div>
                     <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">Dari Tanggal</label>
                        <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="w-full mt-1 px-2 py-1 border rounded-md text-sm dark:bg-gray-600 dark:border-gray-500" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">Sampai Tanggal</label>
                        <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="w-full mt-1 px-2 py-1 border rounded-md text-sm dark:bg-gray-600 dark:border-gray-500" />
                    </div>
                </div>
                <button onClick={clearFilters} className="w-full text-sm text-center pt-2 text-blue-600 hover:underline dark:text-blue-400">Bersihkan Filter</button>
            </div>

            <button onClick={() => setIsAddModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm mb-4"><PlusIcon/> Tambah Hasil Lab</button>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                        <tr>
                            <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tes</th>
                            <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tanggal</th>
                            <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Hasil</th>
                            <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Normal</th>
                            <th className="py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredResults.map(lab => (
                            <tr key={lab.id}>
                                <td className="py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{lab.testName}</td>
                                <td className="py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lab.date}</td>
                                <td className="py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lab.result}</td>
                                <td className="py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lab.normalRange}</td>
                                <td className="py-4 whitespace-nowrap text-sm text-center">
                                    <button onClick={() => setEditingLab(lab)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"><EditIcon className="w-4 h-4"/></button>
                                    <button onClick={() => setLabToDelete(lab)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"><TrashIcon className="w-4 h-4"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {patient.labResults.length > 0 && filteredResults.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 mt-4">Tidak ada hasil lab yang cocok dengan filter.</p>}
                {patient.labResults.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 mt-4">Tidak ada hasil lab.</p>}
            </div>
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Tambah Hasil Lab"><form onSubmit={handleAddLabResult} className="space-y-3"><div><label className="block text-sm">Nama Tes</label><input type="text" name="testName" required className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md"/></div><div><label className="block text-sm">Tanggal</label><input type="date" name="date" required className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md"/></div><div><label className="block text-sm">Hasil</label><input type="text" name="result" required className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md"/></div><div><label className="block text-sm">Rentang Normal</label><input type="text" name="normalRange" required className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md"/></div><button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md">Simpan</button></form></Modal>
            {editingLab && <Modal isOpen={!!editingLab} onClose={() => setEditingLab(null)} title="Edit Hasil Lab"><form onSubmit={handleUpdateLabResult} className="space-y-3"><div><label className="block text-sm">Nama Tes</label><input type="text" name="testName" defaultValue={editingLab.testName} required className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md"/></div><div><label className="block text-sm">Tanggal</label><input type="date" name="date" defaultValue={editingLab.date} required className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md"/></div><div><label className="block text-sm">Hasil</label><input type="text" name="result" defaultValue={editingLab.result} required className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md"/></div><div><label className="block text-sm">Rentang Normal</label><input type="text" name="normalRange" defaultValue={editingLab.normalRange} required className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md"/></div><button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md">Update</button></form></Modal>}
            <Modal isOpen={!!labToDelete} onClose={() => setLabToDelete(null)} title="Konfirmasi Hapus Hasil Lab">
                <div>
                    <p className="text-gray-700 dark:text-gray-300">
                        Apakah Anda yakin ingin menghapus hasil lab untuk tes "<span className="font-semibold">{labToDelete?.testName}</span>" pada tanggal {labToDelete?.date}? Tindakan ini tidak dapat diurungkan.
                    </p>
                    <div className="flex justify-end gap-4 mt-6">
                        <button onClick={() => setLabToDelete(null)} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Batal</button>
                        <button onClick={handleDeleteLabResult} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Hapus</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const PatientDetailView: React.FC<{ patients: PatientRecord[], updatePatientData: (patientId: string, data: Partial<PatientRecord>) => void, deletePatientData: (patientId: string) => void }> = ({ patients, updatePatientData, deletePatientData }) => {
    const { patientId } = useParams<{ patientId: string }>();
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingPatientData, setEditingPatientData] = useState<PatientRecord | null>(null);

    const patient = useMemo(() => patients.find(p => p.id === patientId), [patients, patientId]);
    
    useEffect(() => {
        if (patientId && !patient) {
            navigate('/', { replace: true });
        }
    }, [patientId, patient, navigate]);

    useEffect(() => {
        if (isEditModalOpen && patient) {
            setEditingPatientData(patient);
        }
    }, [isEditModalOpen, patient]);

    if (!patient) return null;

    const handleUpdatePatient = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingPatientData) return;
        const formData = new FormData(e.currentTarget);
        const updatedData = {
            name: formData.get('name') as string,
            dob: formData.get('dob') as string,
            gender: formData.get('gender') as 'Pria' | 'Wanita',
            bloodType: formData.get('bloodType') as string,
            contact: formData.get('contact') as string,
            address: formData.get('address') as string,
            emergencyContact: {
                name: formData.get('emergencyContactName') as string,
                phone: formData.get('emergencyContactPhone') as string,
            },
            alerts: (formData.get('alerts') as string).split(',').map(s => s.trim()).filter(Boolean),
        };
        updatePatientData(patient.id, updatedData);
        setIsEditModalOpen(false);
    };

    const handleDeletePatient = () => {
        if (patient) {
            deletePatientData(patient.id);
            setIsDeleteModalOpen(false);
            navigate('/');
        }
    };


    const navLinkClasses = ({ isActive }: { isActive: boolean }) => `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${isActive ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`;

    return (
        <>
            <div className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
                <div className="flex items-center space-x-4"><div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-600 dark:text-blue-300"><ProfileIcon /></div><div><h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{patient.name}</h2><p className="text-sm text-gray-500 dark:text-gray-400">{patient.id}</p></div></div>
                 <div className="flex items-center gap-2">
                    <button onClick={() => setIsEditModalOpen(true)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><EditIcon className="w-5 h-5"/></button>
                    <button onClick={() => setIsDeleteModalOpen(true)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                </div>
            </div>

            {patient.alerts && patient.alerts.length > 0 && (
                <div className="my-4 p-4 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-400 dark:border-yellow-600">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <ExclamationIcon className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-bold text-yellow-800 dark:text-yellow-200">Peringatan Medis Kritis</h3>
                            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                <ul className="list-disc space-y-1 pl-5">
                                    {patient.alerts.map((alert, index) => (
                                        <li key={index} className="font-semibold">{alert}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="my-4"><div className="border-b border-gray-200 dark:border-gray-700"><nav className="-mb-px flex space-x-8" aria-label="Tabs"><NavLink to="info" className={navLinkClasses}>Informasi</NavLink><NavLink to="visits" className={navLinkClasses}>Kunjungan</NavLink><NavLink to="labs" className={navLinkClasses}>Hasil Lab</NavLink></nav></div></div>
            <Outlet context={{ patient, updatePatientData }} />
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Info Pasien ${patient.name}`}>
                {editingPatientData && (
                     <form onSubmit={handleUpdatePatient} className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                        <div><label className="block text-sm">Nama Lengkap</label><input type="text" name="name" defaultValue={editingPatientData.name} required className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md"/></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm">Tanggal Lahir</label><input type="date" name="dob" defaultValue={editingPatientData.dob} required className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md"/></div>
                            <div><label className="block text-sm">Gol. Darah</label><input type="text" name="bloodType" defaultValue={editingPatientData.bloodType} required className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md"/></div>
                        </div>
                        <div><label className="block text-sm">Jenis Kelamin</label><select name="gender" defaultValue={editingPatientData.gender} className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md"><option>Pria</option><option>Wanita</option></select></div>
                        <div><label className="block text-sm">Kontak</label><input type="tel" name="contact" defaultValue={editingPatientData.contact} required className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md"/></div>
                        <div><label className="block text-sm">Alamat</label><textarea name="address" defaultValue={editingPatientData.address} rows={2} className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md"></textarea></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm">Nama Kontak Darurat</label><input type="text" name="emergencyContactName" defaultValue={editingPatientData.emergencyContact.name} required className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md"/></div>
                            <div><label className="block text-sm">Telepon Kontak Darurat</label><input type="tel" name="emergencyContactPhone" defaultValue={editingPatientData.emergencyContact.phone} required className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md"/></div>
                        </div>
                         <div><label className="block text-sm">Peringatan Medis (pisahkan koma)</label><textarea name="alerts" defaultValue={editingPatientData.alerts?.join(', ')} rows={2} className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 rounded-md"></textarea></div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md">Simpan Perubahan</button>
                    </form>
                )}
            </Modal>
             <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Konfirmasi Hapus Pasien">
                <div>
                    <p className="text-gray-700 dark:text-gray-300">
                        Apakah Anda yakin ingin menghapus rekam medis pasien <span className="font-semibold">{patient.name}</span>? Tindakan ini tidak dapat diurungkan dan akan menghapus semua data terkait.
                    </p>
                    <div className="flex justify-end gap-4 mt-6">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Batal</button>
                        <button onClick={handleDeletePatient} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Hapus Pasien</button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

const SelectPatientMessage: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400"><UsersIcon /></div>
        <h3 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200">Pilih Pasien</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Pilih seorang pasien dari daftar di sebelah kiri untuk melihat riwayat medis lengkap mereka.</p>
    </div>
);

const PatientHistoryContent: React.FC<{
    patients: PatientRecord[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filters: any;
    setFilters: (filters: any) => void;
    updatePatientData: (patientId: string, data: Partial<PatientRecord>) => void;
    deletePatientData: (patientId: string) => void;
}> = ({ patients, searchTerm, setSearchTerm, filters, setFilters, updatePatientData, deletePatientData }) => {
    const { patientId } = useParams<{ patientId: string }>();
    const [showFilters, setShowFilters] = useState(false);
    
    const filteredPatients = useMemo(() => {
        const { startDate, endDate, diagnosis, doctor } = filters;
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const lowerCaseDiagnosis = diagnosis.toLowerCase();
        const lowerCaseDoctor = doctor.toLowerCase();
        const isAdvancedFilterActive = !!(startDate || endDate || diagnosis || doctor);
        return patients.filter(p => {
            const matchesSearchTerm = lowerCaseSearchTerm === '' || p.name.toLowerCase().includes(lowerCaseSearchTerm) || p.id.toLowerCase().includes(lowerCaseSearchTerm);
            if (!matchesSearchTerm) return false;
            if (!isAdvancedFilterActive) return true;
            return p.visits.some(visit => {
                const visitDate = new Date(visit.date);
                const matchesDate = (!startDate || visitDate >= new Date(startDate)) && (!endDate || visitDate <= new Date(endDate));
                if (!matchesDate) return false;
                const matchesDiagnosis = !lowerCaseDiagnosis || visit.diagnosis.toLowerCase().includes(lowerCaseDiagnosis);
                if (!matchesDiagnosis) return false;
                const matchesDoctor = !lowerCaseDoctor || visit.doctor.toLowerCase().includes(lowerCaseDoctor);
                return matchesDoctor;
            });
        });
    }, [searchTerm, patients, filters]);
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => setFilters((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    const clearFilters = () => { setSearchTerm(''); setFilters({ startDate: '', endDate: '', diagnosis: '', doctor: '' }); };

    return (
        <div className="flex-grow flex flex-col md:flex-row gap-6 overflow-hidden">
            <div className="w-full md:w-1/3 flex flex-col bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div className="flex gap-2 mb-4">
                    <input type="text" placeholder="Cari Nama atau ID Pasien..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />
                    <button onClick={() => setShowFilters(!showFilters)} className={`p-2 border rounded-lg transition-colors flex-shrink-0 ${showFilters ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700' : 'dark:bg-gray-700 dark:border-gray-600'}`} aria-label="Toggle filters"><FilterIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" /></button>
                </div>
                {showFilters && (<div className="mb-4 p-4 border rounded-lg dark:border-gray-700 space-y-3 bg-gray-50 dark:bg-gray-700/50"><h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Filter Kunjungan Medis</h3><div className="grid grid-cols-2 gap-2"><div><label className="text-xs text-gray-500 dark:text-gray-400">Dari Tanggal</label><input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full mt-1 px-2 py-1 border rounded-md text-sm dark:bg-gray-600 dark:border-gray-500" /></div><div><label className="text-xs text-gray-500 dark:text-gray-400">Sampai Tanggal</label><input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full mt-1 px-2 py-1 border rounded-md text-sm dark:bg-gray-600 dark:border-gray-500" /></div></div><div><label className="text-xs text-gray-500 dark:text-gray-400">Diagnosis</label><input type="text" name="diagnosis" placeholder="e.g., Influenza" value={filters.diagnosis} onChange={handleFilterChange} className="w-full mt-1 px-2 py-1 border rounded-md text-sm dark:bg-gray-600 dark:border-gray-500" /></div><div><label className="text-xs text-gray-500 dark:text-gray-400">Dokter</label><input type="text" name="doctor" placeholder="e.g., Dr. Lestari" value={filters.doctor} onChange={handleFilterChange} className="w-full mt-1 px-2 py-1 border rounded-md text-sm dark:bg-gray-600 dark:border-gray-500" /></div><button onClick={clearFilters} className="w-full text-sm text-center pt-2 text-blue-600 hover:underline dark:text-blue-400">Bersihkan Filter</button></div>)}
                <div className="flex-grow overflow-y-auto pr-2 -mr-2"><ul className="space-y-2">{filteredPatients.map(p => (<li key={p.id}><Link to={`/${p.id}/info`} className={`w-full text-left p-3 rounded-lg block transition-colors duration-200 ${patientId === p.id ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}><p className="font-bold text-gray-800 dark:text-gray-100">{p.name}</p><p className="text-sm text-gray-500 dark:text-gray-400">{p.id} &bull; DOB: {p.dob}</p></Link></li>))}</ul></div>
            </div>
            <div className="w-full md:w-2/3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm overflow-y-auto">
                <Routes>
                    <Route path="/" element={<SelectPatientMessage />} />
                    <Route path="/:patientId" element={<Navigate to="info" replace />} />
                    <Route path="/:patientId/:tab" element={<PatientDetailView patients={patients} updatePatientData={updatePatientData} deletePatientData={deletePatientData} />} >
                         <Route path="info" element={<PatientInfo />} />
                         <Route path="visits" element={<PatientVisits />} />
                         <Route path="labs" element={<PatientLabs />} />
                    </Route>
                </Routes>
            </div>
        </div>
    );
};


const PatientHistory: React.FC = () => {
    const [patients, setPatients] = useState<PatientRecord[]>(() => getInitialState('patientsData', mockPatientsData));
    const [searchTerm, setSearchTerm] = useState(() => getInitialState('patientSearchTerm', ''));
    const [filters, setFilters] = useState(() => getInitialState('patientFilters', { startDate: '', endDate: '', diagnosis: '', doctor: '' }));

    useEffect(() => {
        localStorage.setItem('patientsData', JSON.stringify(patients));
    }, [patients]);
    
    useEffect(() => {
        localStorage.setItem('patientSearchTerm', JSON.stringify(searchTerm));
        localStorage.setItem('patientFilters', JSON.stringify(filters));
    }, [searchTerm, filters]);

    const updatePatientData = (patientId: string, updatedData: Partial<PatientRecord>) => {
        setPatients(prev => prev.map(p => p.id === patientId ? { ...p, ...updatedData } : p));
    };

    const deletePatientData = (patientId: string) => {
        setPatients(prev => prev.filter(p => p.id !== patientId));
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Riwayat Pasien</h1>
            <HashRouter>
                <PatientHistoryContent
                    patients={patients}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filters={filters}
                    setFilters={setFilters}
                    updatePatientData={updatePatientData}
                    deletePatientData={deletePatientData}
                />
            </HashRouter>
        </div>
    );
};

export default PatientHistory;
