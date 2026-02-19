import React, { useMemo, useState } from 'react';
import { Delivery, DeliveryStatus, IGDStatus } from '../types';
import { BoxIcon, MapIcon, PlusIcon } from './Icons';
import Modal from './Modal';

const mockDeliveriesData: Delivery[] = [
    { id: 'LOG-001', origin: 'Gudang Pusat Jakarta', destination: 'RSPAU Hardjolukito', status: DeliveryStatus.InTransit, eta: '14:30', driver: 'Sgt. Agus' },
    { id: 'LOG-002', origin: 'Gudang Pusat Jakarta', destination: 'RS Lanud Halim', status: DeliveryStatus.Delivered, eta: '11:00', driver: 'Cpl. Budi' },
    { id: 'LOG-003', origin: 'Depot Farmasi Bandung', destination: 'RS Lanud Adisutjipto', status: DeliveryStatus.Delayed, eta: '13:00', driver: 'Pvt. Chandra' },
    { id: 'LOG-004', origin: 'Gudang Pusat Jakarta', destination: 'RS Lanud Husein S.', status: DeliveryStatus.Pending, eta: '16:00', driver: 'Sgt. Dedi' },
];

type NodeType = 'RS' | 'Gudang' | 'Unit Distribusi';
type LogisticsType = 'Obat' | 'Alkes' | 'APD' | 'Bahan Medis';

interface CommandNode {
    id: string;
    name: string;
    type: NodeType;
    region: 'Jakarta' | 'Yogyakarta' | 'Bandung';
    position: [number, number];
    stock: string;
    bor: string;
    igdStatus: IGDStatus;
    eta: string;
    logisticsTypes: LogisticsType[];
}

interface DistributionRoute {
    id: string;
    fromNodeId: string;
    toNodeId: string;
    deliveryId: string;
}

const commandNodes: CommandNode[] = [
    { id: 'NODE-GD-JKT', name: 'Gudang Pusat Jakarta', type: 'Gudang', region: 'Jakarta', position: [-6.1745, 106.8227], stock: '82%', bor: 'N/A', igdStatus: IGDStatus.Normal, eta: 'Ready Dispatch 24/7', logisticsTypes: ['Obat', 'Alkes', 'APD', 'Bahan Medis'] },
    { id: 'NODE-RS-HALIM', name: 'RS Lanud Halim', type: 'RS', region: 'Jakarta', position: [-6.2667, 106.8903], stock: '68%', bor: '76%', igdStatus: IGDStatus.Sibuk, eta: '11:00', logisticsTypes: ['Obat', 'Alkes'] },
    { id: 'NODE-UD-JKT-TIM', name: 'Unit Distribusi Jakarta Timur', type: 'Unit Distribusi', region: 'Jakarta', position: [-6.2217, 106.9106], stock: '55%', bor: 'N/A', igdStatus: IGDStatus.Normal, eta: '15:10', logisticsTypes: ['APD', 'Bahan Medis'] },
    { id: 'NODE-RSPAU-HARDJO', name: 'RSPAU Hardjolukito', type: 'RS', region: 'Yogyakarta', position: [-7.7887, 110.3834], stock: '61%', bor: '81%', igdStatus: IGDStatus.Sibuk, eta: '14:30', logisticsTypes: ['Obat', 'Alkes', 'APD'] },
    { id: 'NODE-RS-ADISUT', name: 'RS Lanud Adisutjipto', type: 'RS', region: 'Yogyakarta', position: [-7.789, 110.4318], stock: '48%', bor: '88%', igdStatus: IGDStatus.Kritis, eta: '13:00', logisticsTypes: ['Obat', 'Bahan Medis'] },
    { id: 'NODE-GD-BDG', name: 'Depot Farmasi Bandung', type: 'Gudang', region: 'Bandung', position: [-6.9175, 107.6191], stock: '74%', bor: 'N/A', igdStatus: IGDStatus.Normal, eta: 'Prepared 12:15', logisticsTypes: ['Obat', 'Bahan Medis', 'Alkes'] },
    { id: 'NODE-RS-HUSEIN', name: 'RS Lanud Husein S.', type: 'RS', region: 'Bandung', position: [-6.9006, 107.5764], stock: '70%', bor: '69%', igdStatus: IGDStatus.Normal, eta: '16:00', logisticsTypes: ['Obat', 'APD'] },
];

const distributionRoutes: DistributionRoute[] = [
    { id: 'ROUTE-1', fromNodeId: 'NODE-GD-JKT', toNodeId: 'NODE-RSPAU-HARDJO', deliveryId: 'LOG-001' },
    { id: 'ROUTE-2', fromNodeId: 'NODE-GD-JKT', toNodeId: 'NODE-RS-HALIM', deliveryId: 'LOG-002' },
    { id: 'ROUTE-3', fromNodeId: 'NODE-GD-BDG', toNodeId: 'NODE-RS-ADISUT', deliveryId: 'LOG-003' },
    { id: 'ROUTE-4', fromNodeId: 'NODE-GD-JKT', toNodeId: 'NODE-RS-HUSEIN', deliveryId: 'LOG-004' },
];

const TILE_CONFIG = { zoom: 6, minX: 50, maxX: 52, minY: 31, maxY: 32, tileSize: 256 };

const lngToWorldX = (lng: number, zoom: number) => ((lng + 180) / 360) * (2 ** zoom) * TILE_CONFIG.tileSize;
const latToWorldY = (lat: number, zoom: number) => {
    const latRad = (lat * Math.PI) / 180;
    return ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * (2 ** zoom) * TILE_CONFIG.tileSize;
};

const getNodeColor = (type: NodeType) => (type === 'RS' ? '#2563eb' : type === 'Gudang' ? '#16a34a' : '#7c3aed');
const getRouteColor = (status: DeliveryStatus) => (status === DeliveryStatus.Delayed ? '#dc2626' : status === DeliveryStatus.InTransit ? '#2563eb' : status === DeliveryStatus.Delivered ? '#16a34a' : '#6b7280');

const StatusBadge: React.FC<{ status: DeliveryStatus }> = ({ status }) => {
    const statusClasses = {
        [DeliveryStatus.InTransit]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        [DeliveryStatus.Delivered]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        [DeliveryStatus.Delayed]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        [DeliveryStatus.Pending]: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses[status]}`}>{status}</span>;
};

const ProgressBar: React.FC<{ value: number; color: string }> = ({ value, color }) => (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4"><div className={`${color} h-4 rounded-full text-center text-white text-xs font-bold leading-4`} style={{ width: `${value}%` }}>{value}%</div></div>
);

const Distribution: React.FC = () => {
    const [deliveries, setDeliveries] = useState(mockDeliveriesData);
    const [filter, setFilter] = useState('All');
    const [regionFilter, setRegionFilter] = useState<'All' | CommandNode['region']>('All');
    const [logisticsFilter, setLogisticsFilter] = useState<'All' | LogisticsType>('All');
    const [selectedNodeId, setSelectedNodeId] = useState(commandNodes[0].id);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mapTileFailed, setMapTileFailed] = useState(false);

    const nodesById = useMemo(() => new Map(commandNodes.map(node => [node.id, node])), []);
    const mapWidth = (TILE_CONFIG.maxX - TILE_CONFIG.minX + 1) * TILE_CONFIG.tileSize;
    const mapHeight = (TILE_CONFIG.maxY - TILE_CONFIG.minY + 1) * TILE_CONFIG.tileSize;
    const mapStartX = TILE_CONFIG.minX * TILE_CONFIG.tileSize;
    const mapStartY = TILE_CONFIG.minY * TILE_CONFIG.tileSize;

    const getMapPoint = ([lat, lng]: [number, number]) => {
        const x = lngToWorldX(lng, TILE_CONFIG.zoom) - mapStartX;
        const y = latToWorldY(lat, TILE_CONFIG.zoom) - mapStartY;
        return { x, y };
    };

    const filteredDeliveries = useMemo(() => (filter === 'All' ? deliveries : deliveries.filter(d => d.status === filter)), [deliveries, filter]);

    const filteredNodes = useMemo(() => commandNodes.filter(node => (regionFilter === 'All' || node.region === regionFilter) && (logisticsFilter === 'All' || node.logisticsTypes.includes(logisticsFilter))), [regionFilter, logisticsFilter]);

    const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(node => node.id)), [filteredNodes]);

    const mapRoutes = useMemo(() => distributionRoutes.map(route => {
        const fromNode = nodesById.get(route.fromNodeId);
        const toNode = nodesById.get(route.toNodeId);
        const delivery = deliveries.find(item => item.id === route.deliveryId);
        if (!fromNode || !toNode || !delivery) return null;
        if (!filteredNodeIds.has(fromNode.id) && !filteredNodeIds.has(toNode.id)) return null;
        return { ...route, fromNode, toNode, status: delivery.status };
    }).filter((route): route is NonNullable<typeof route> => Boolean(route)), [deliveries, filteredNodeIds, nodesById]);

    const selectedNode = useMemo(() => filteredNodes.find(node => node.id === selectedNodeId) || filteredNodes[0] || null, [filteredNodes, selectedNodeId]);

    const handleAddDelivery = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        setDeliveries(prev => [{ id: `LOG-${String(prev.length + 1).padStart(3, '0')}`, origin: formData.get('origin') as string, destination: formData.get('destination') as string, driver: formData.get('driver') as string, eta: formData.get('eta') as string, status: DeliveryStatus.Pending }, ...prev]);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Distribusi Logistik</h1>
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-3 bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center"><MapIcon className="mr-2" /> Command Center Map</h2>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value as typeof regionFilter)} className="px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"><option value="All">Semua Wilayah</option><option value="Jakarta">Jakarta</option><option value="Yogyakarta">Yogyakarta</option><option value="Bandung">Bandung</option></select>
                            <select value={logisticsFilter} onChange={(e) => setLogisticsFilter(e.target.value as typeof logisticsFilter)} className="px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"><option value="All">Semua Logistik</option><option value="Obat">Obat</option><option value="Alkes">Alkes</option><option value="APD">APD</option><option value="Bahan Medis">Bahan Medis</option></select>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex flex-wrap gap-x-6 gap-y-1"><span>● RS</span><span className="text-green-600">● Gudang</span><span className="text-purple-600">● Unit Distribusi</span><span className="text-blue-600">— Rute Normal</span><span className="text-red-600">— Rute Terlambat</span></div>
                    {mapTileFailed ? (
                        <div className="h-96 bg-gray-100 dark:bg-gray-700 rounded-lg p-4 overflow-y-auto">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Fallback Non-Map View</h3>
                            <div className="space-y-3">{filteredNodes.map(node => <button key={node.id} onClick={() => setSelectedNodeId(node.id)} className="w-full text-left p-3 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-blue-500"><p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{node.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{node.type} • {node.region} • ETA {node.eta}</p></button>)}</div>
                            <p className="mt-4 text-xs text-amber-600 dark:text-amber-400">Tile map gagal dimuat. Menampilkan daftar node sebagai fallback.</p>
                        </div>
                    ) : (
                        <div className="h-96 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-slate-200 relative">
                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-2">
                                {Array.from({ length: TILE_CONFIG.maxX - TILE_CONFIG.minX + 1 }, (_, ix) => ix + TILE_CONFIG.minX).flatMap(x => Array.from({ length: TILE_CONFIG.maxY - TILE_CONFIG.minY + 1 }, (_, iy) => iy + TILE_CONFIG.minY).map(y => (
                                    <img key={`${x}-${y}`} src={`https://tile.openstreetmap.org/${TILE_CONFIG.zoom}/${x}/${y}.png`} alt="OpenStreetMap tile" className="w-full h-full object-cover" onError={() => setMapTileFailed(true)} />
                                )))}
                            </div>
                            <svg viewBox={`0 0 ${mapWidth} ${mapHeight}`} className="absolute inset-0 w-full h-full">
                                {mapRoutes.map(route => {
                                    const from = getMapPoint(route.fromNode.position);
                                    const to = getMapPoint(route.toNode.position);
                                    return <line key={route.id} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={getRouteColor(route.status)} strokeWidth="4" strokeOpacity="0.85" />;
                                })}
                            </svg>
                            {filteredNodes.map(node => {
                                const point = getMapPoint(node.position);
                                return (
                                    <button key={node.id} title={`${node.name} (${node.type})`} onClick={() => setSelectedNodeId(node.id)} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md" style={{ left: `${(point.x / mapWidth) * 100}%`, top: `${(point.y / mapHeight) * 100}%`, width: selectedNode?.id === node.id ? '20px' : '15px', height: selectedNode?.id === node.id ? '20px' : '15px', backgroundColor: getNodeColor(node.type) }} />
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800"><h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Detail Node Terpilih</h2>{selectedNode ? <div className="space-y-3 text-sm"><p className="font-semibold text-gray-900 dark:text-gray-100">{selectedNode.name}</p><p className="text-gray-600 dark:text-gray-300">Jenis: {selectedNode.type}</p><p className="text-gray-600 dark:text-gray-300">Wilayah: {selectedNode.region}</p><p className="text-gray-600 dark:text-gray-300">Stok: <span className="font-semibold">{selectedNode.stock}</span></p><p className="text-gray-600 dark:text-gray-300">BOR: <span className="font-semibold">{selectedNode.bor}</span></p><p className="text-gray-600 dark:text-gray-300">Status IGD: <span className="font-semibold">{selectedNode.igdStatus}</span></p><p className="text-gray-600 dark:text-gray-300">ETA: <span className="font-semibold">{selectedNode.eta}</span></p><p className="text-gray-600 dark:text-gray-300">Jenis Logistik: {selectedNode.logisticsTypes.join(', ')}</p></div> : <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada node yang sesuai filter.</p>}</div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800 lg:col-span-1"><h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center"><BoxIcon className="mr-2" /> Inventaris Gudang Pusat</h2><div className="space-y-4"><div><p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Obat-obatan</p><ProgressBar value={75} color="bg-blue-500" /></div><div><p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Alat Kesehatan</p><ProgressBar value={60} color="bg-green-500" /></div><div><p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Bahan Medis</p><ProgressBar value={85} color="bg-yellow-500" /></div><div><p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">APD</p><ProgressBar value={90} color="bg-purple-500" /></div></div></div></div>
            <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4"><h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Status Pengiriman</h2><button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"><PlusIcon /> Kirim Logistik Baru</button></div>
                <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b dark:border-gray-700"><span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-2">Filter Status:</span>{['All', ...Object.values(DeliveryStatus)].map(status => <button key={status} onClick={() => setFilter(status)} className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-200 ${filter === status ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}>{status === 'All' ? 'Semua Status' : status}</button>)}</div>
                <div className="overflow-x-auto"><table className="min-w-full"><thead><tr className="border-b dark:border-gray-700"><th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</th><th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Asal</th><th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tujuan</th><th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Pengemudi</th><th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ETA</th><th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th></tr></thead><tbody className="divide-y divide-gray-200 dark:divide-gray-700">{filteredDeliveries.map(d => <tr key={d.id}><td className="py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">{d.id}</td><td className="py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{d.origin}</td><td className="py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{d.destination}</td><td className="py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{d.driver}</td><td className="py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{d.eta}</td><td className="py-4 whitespace-nowrap text-sm"><StatusBadge status={d.status} /></td></tr>)}</tbody></table></div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Kirim Logistik Baru"><form onSubmit={handleAddDelivery} className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Asal</label><input type="text" name="origin" required defaultValue="Gudang Pusat Jakarta" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tujuan</label><input type="text" name="destination" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pengemudi</label><input type="text" name="driver" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ETA</label><input type="time" name="eta" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" /></div><button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Buat Pengiriman</button></form></Modal>
        </div>
    );
};

export default Distribution;
