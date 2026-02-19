import React from 'react';

export interface StatCardData {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
}

export enum IGDStatus {
  Normal = 'Normal',
  Sibuk = 'Sibuk',
  Kritis = 'Kritis',
}

export interface HospitalStatusData {
  name: string;
  beds: {
    available: number;
    total: number;
  };
  igdStatus: IGDStatus;
  operatingRooms: {
    inUse: number;
    total: number;
  };
  ambulances: {
    ready: number;
    total: number;
  };
}

export enum NotificationPriority {
  Tinggi = 'Tinggi',
  Sedang = 'Sedang',
  Rendah = 'Rendah',
}

export interface NotificationData {
  priority: NotificationPriority;
  title: string;
  time: string;
  description: string;
  location: string;
}

export interface HRUtilizationData {
  distribution: { name: string; value: number; color: string }[];
  totalPersonnel: number;
  averageUtilization: number;
}

export interface LogisticsTrendData {
    months: string[];
    data: { name: string; values: number[]; color: string }[];
}

export enum StockStatus {
    Aman = 'Aman',
    PerluPerhatian = 'Perlu Perhatian',
    Kritis = 'Kritis',
}


export interface LowStockItemData {
    name: string;
    category: string;
    stock: string;
    status: StockStatus;
}

export interface PatientMetricsData {
  newAdmissions: number;
  discharged: number;
  currentInpatients: number;
  avgStay: number; // in days
}

// --- New Types for Feature Components ---

export interface StockHistoryEntry {
    date: string; // ISO string date
    stock: number;
    change: number; // positive for stock in, negative for stock out
    reason: string;
}

// Logistik & Stok
export interface InventoryItem {
    id: string;
    name: string;
    category: 'Obat' | 'Alkes' | 'Bahan Medis' | 'APD';
    stock: number;
    unit: string;
    capacity: number;
    threshold: number; // Critical level threshold
    lastUpdated: string; // ISO string date
    history?: StockHistoryEntry[];
}

// Pelayanan Medis
export enum SurgeryStatus {
    Scheduled = 'Terjadwal',
    InProgress = 'Berlangsung',
    Completed = 'Selesai',
    Canceled = 'Batal'
}

export interface SurgerySchedule {
    time: string;
    patientName: string;
    procedure: string;
    surgeon: string;
    room: string;
    status: SurgeryStatus;
}

export enum SpecialistStatus {
    Available = 'Tersedia',
    OnCall = 'On Call',
    OffDuty = 'Libur'
}

export interface Specialist {
    name: string;
    field: string;
    status: SpecialistStatus;
}

// SDM & Personel
export enum PersonnelStatus {
    Active = 'Aktif',
    OnLeave = 'Cuti'
}

export interface Personnel {
    id: string;
    name: string;
    role: string;
    department: string;
    status: PersonnelStatus;
    phone: string;
}

// Distribusi
export enum DeliveryStatus {
    InTransit = 'Dalam Perjalanan',
    Delivered = 'Terkirim',
    Delayed = 'Terlambat',
    Pending = 'Menunggu'
}

export interface Delivery {
    id: string;
    origin: string;
    destination: string;
    status: DeliveryStatus;
    eta: string;
    driver: string;
}

// Jadwal & Tugas
export interface Task {
    id: string;
    title: string;
    description: string;
    assignee: string;
    dueDate: string;
}

export interface ScheduleEvent {
    id: string;
    title: string;
    time: string; // e.g., "09:00 - 11:00"
    day: 'Sen' | 'Sel' | 'Rab' | 'Kam' | 'Jum' | 'Sab' | 'Min';
    type: 'surgery' | 'consultation' | 'meeting';
}

// Laporan & Analitik
export enum ReportFormat {
    PDF = 'PDF',
    CSV = 'CSV',
    XLSX = 'XLSX'
}
export interface Report {
    id: string;
    name: string;
    generatedDate: string;
    type: string;
    format: ReportFormat;
}

export interface AnalyticsDataPoint {
    month: string;
    bor: number; // Bed Occupancy Rate
    los: number; // Average Length of Stay
}

// Riwayat Pasien
export interface LabResult {
    id: string;
    testName: string;
    result: string;
    normalRange: string;
    date: string;
}

export interface MedicalVisit {
    id: string;
    date: string;
    hospital: string;
    doctor: string;
    diagnosis: string;
    notes: {
        symptoms: string;
        findings: string;
        treatmentPlan: string;
    };
    prescriptions: { name: string; dosage: string; frequency: string; duration: string; }[];
}

export interface PatientRecord {
    id: string;
    name: string;
    dob: string;
    gender: 'Pria' | 'Wanita';
    bloodType: string;
    contact: string;
    address: string;
    emergencyContact: { name: string; phone: string };
    visits: MedicalVisit[];
    labResults: LabResult[];
    alerts?: string[];
}