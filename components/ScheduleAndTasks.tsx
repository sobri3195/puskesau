import React, { useState, DragEvent } from 'react';
import { Task, ScheduleEvent } from '../types';
import { CheckSquareIcon, CalendarIcon, PlusIcon } from './Icons';
import Modal from './Modal';

interface TaskColumn {
    status: string;
    tasks: Task[];
}

const initialTasks: TaskColumn[] = [
    { status: 'Tugas Baru', tasks: [
        { id: 'T1', title: 'Siapkan laporan stok bulanan', description: 'Kompilasi data dari semua RS', assignee: 'Staf Logistik', dueDate: '2025-05-30' },
        { id: 'T2', title: 'Jadwalkan pemeliharaan X-Ray', description: 'Hubungi vendor teknis', assignee: 'Tim Alkes', dueDate: '2025-06-02' },
    ]},
    { status: 'Sedang Dikerjakan', tasks: [
        { id: 'T3', title: 'Verifikasi data pasien', description: 'Cross-check data baru dari RSPAU', assignee: 'Admin Medis', dueDate: '2025-05-28' },
    ]},
    { status: 'Selesai', tasks: [
        { id: 'T4', title: 'Pesan ulang reagen lab', description: 'Pesanan untuk kebutuhan bulan Juni', assignee: 'Lab Pusat', dueDate: '2025-05-25' },
    ]},
];

const initialEvents: ScheduleEvent[] = [
    { id: 'E1', title: 'Rapat Staf Mingguan', time: '08:00', day: 'Sen', type: 'meeting' },
    { id: 'E2', title: 'Konsultasi Dr. Sutrisno', time: '10:00', day: 'Sel', type: 'consultation' },
    { id: 'E3', title: 'Operasi Cito', time: '11:00', day: 'Rab', type: 'surgery' },
    { id: 'E4', title: 'Training K3', time: '14:00', day: 'Kam', type: 'meeting' },
    { id: 'E5', title: 'Visite Besar', time: '09:00', day: 'Jum', type: 'consultation' },
];

const daysOfWeek: ScheduleEvent['day'][] = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
type DayOfWeek = typeof daysOfWeek[number];

const getEventTypeColor = (type: ScheduleEvent['type']) => {
    switch(type) {
        case 'surgery': return 'bg-red-500 border-red-600 text-white';
        case 'consultation': return 'bg-blue-500 border-blue-600 text-white';
        case 'meeting': return 'bg-yellow-500 border-yellow-600 text-black';
        default: return 'bg-gray-500 border-gray-600 text-white';
    }
};

const getTaskStatusColor = (status: string) => {
    if (status === 'Tugas Baru') return 'border-t-blue-500';
    if (status === 'Sedang Dikerjakan') return 'border-t-yellow-500';
    if (status === 'Selesai') return 'border-t-green-500';
    return 'border-t-gray-500';
};

const ScheduleAndTasks: React.FC = () => {
    const [events, setEvents] = useState<ScheduleEvent[]>(initialEvents);
    const [taskColumns, setTaskColumns] = useState<TaskColumn[]>(initialTasks);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
    const [newEvent, setNewEvent] = useState({ title: '', time: '09:00', type: 'meeting' as ScheduleEvent['type'] });
    const [draggedTask, setDraggedTask] = useState<{task: Task, fromStatus: string} | null>(null);

    const handleDayClick = (day: DayOfWeek) => {
        setSelectedDay(day);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDay(null);
        setNewEvent({ title: '', time: '09:00', type: 'meeting' });
    };

    const handleAddEvent = (e: React.FormEvent) => {
        e.preventDefault();
        if (newEvent.title && newEvent.time && selectedDay) {
            const newEventObject: ScheduleEvent = {
                id: `E${events.length + 1}`,
                day: selectedDay,
                ...newEvent,
            };
            setEvents(prevEvents => [...prevEvents, newEventObject].sort((a,b) => a.time.localeCompare(b.time)));
            handleCloseModal();
        }
    };

    const handleDragStart = (e: DragEvent<HTMLDivElement>, task: Task, fromStatus: string) => {
        setDraggedTask({ task, fromStatus });
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.style.opacity = '0.5';
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>, toStatus: string) => {
        e.preventDefault();
        if (!draggedTask || draggedTask.fromStatus === toStatus) return;

        setTaskColumns(prevColumns => {
            const newColumns = prevColumns.map(col => ({...col, tasks: [...col.tasks]}));
            
            // Remove from old column
            const fromColIndex = newColumns.findIndex(col => col.status === draggedTask.fromStatus);
            if (fromColIndex !== -1) {
                newColumns[fromColIndex].tasks = newColumns[fromColIndex].tasks.filter(t => t.id !== draggedTask.task.id);
            }
            
            // Add to new column
            const toColIndex = newColumns.findIndex(col => col.status === toStatus);
            if (toColIndex !== -1) {
                newColumns[toColIndex].tasks.push(draggedTask.task);
            }

            return newColumns;
        });

        setDraggedTask(null);
    };
    
    const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.opacity = '1';
        setDraggedTask(null);
    }

    const selectedDayEvents = selectedDay ? events.filter(e => e.day === selectedDay) : [];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Jadwal & Tugas</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center"><CalendarIcon className="mr-2" /> Kalender Tim Medis</h2>
                <div className="grid grid-cols-7 border-t border-l dark:border-gray-700">
                    {daysOfWeek.map(day => (
                        <div key={day} className="text-center font-bold py-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">{day}</div>
                    ))}
                    {daysOfWeek.map(day => (
                        <div 
                            key={day} 
                            onClick={() => handleDayClick(day)}
                            className="h-48 border-b border-r dark:border-gray-700 p-1 relative cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 overflow-y-auto"
                        >
                            {events.filter(e => e.day === day).map(event => (
                                <div key={event.id} className={`p-1 rounded text-xs mb-1 border-l-4 ${getEventTypeColor(event.type)}`}>
                                    <p className="font-bold">{event.time}</p>
                                    <p className="truncate">{event.title}</p>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
                 <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center"><CheckSquareIcon className="mr-2" /> Papan Tugas</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {taskColumns.map(column => (
                        <div 
                            key={column.status} 
                            className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 min-h-[200px]"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, column.status)}
                        >
                            <h3 className={`font-bold text-gray-700 dark:text-gray-200 mb-4 pb-2 border-b-2 ${getTaskStatusColor(column.status)}`}>{column.status} ({column.tasks.length})</h3>
                            <div className="space-y-4">
                                {column.tasks.map(task => (
                                    <div 
                                        key={task.id} 
                                        draggable="true"
                                        onDragStart={(e) => handleDragStart(e, task, column.status)}
                                        onDragEnd={handleDragEnd}
                                        className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 cursor-grab ${getTaskStatusColor(column.status)}`}
                                    >
                                        <p className="font-bold text-gray-800 dark:text-gray-100">{task.title}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 my-1">{task.description}</p>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex justify-between">
                                            <span>PIC: {task.assignee}</span>
                                            <span>Due: {task.dueDate}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={`Jadwal untuk Hari ${selectedDay}`}>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Acara Terjadwal</h3>
                        {selectedDayEvents.length > 0 ? (
                            <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {selectedDayEvents.map(event => (
                                    <li key={event.id} className={`p-2 rounded text-sm border-l-4 ${getEventTypeColor(event.type)}`}>
                                        <span className="font-bold">{event.time}</span> - {event.title}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada jadwal untuk hari ini.</p>
                        )}
                    </div>
                    
                    <div className="border-t pt-4 dark:border-gray-600">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Tambah Acara Baru</h3>
                        <form onSubmit={handleAddEvent} className="space-y-3">
                             <div>
                                <label htmlFor="event-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Judul Acara</label>
                                <input type="text" id="event-title" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="event-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Waktu</label>
                                    <input type="time" id="event-time" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
                                </div>
                                <div>
                                    <label htmlFor="event-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipe</label>
                                    <select id="event-type" value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value as ScheduleEvent['type']})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" >
                                        <option value="meeting">Rapat</option>
                                        <option value="consultation">Konsultasi</option>
                                        <option value="surgery">Operasi</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                <PlusIcon /> <span className="ml-2">Tambah Acara</span>
                            </button>
                        </form>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ScheduleAndTasks;