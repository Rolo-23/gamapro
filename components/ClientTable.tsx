
import React from 'react';
import { Client, SortConfig } from '../types';
import SortIcon from './icons/SortIcon';

interface ClientTableProps {
    clients: Client[];
    onEdit: (client: Client) => void;
    onDelete: (client: Client) => void;
    onManageLoans: (client: Client) => void;
    onManageAppointments: (client: Client) => void;
    onViewDetails: (client: Client) => void;
    sortConfig: SortConfig;
    requestSort: (key: keyof Client) => void;
}

const TableHeader: React.FC<{
    sortKey: keyof Client;
    label: string;
    sortConfig: SortConfig;
    requestSort: (key: keyof Client) => void;
    className?: string;
}> = ({ sortKey, label, sortConfig, requestSort, className = '' }) => {
    const isActive = sortConfig.key === sortKey;
    const direction = isActive ? sortConfig.direction : undefined;

    return (
        <th className={`p-3 text-left text-sm font-bold text-sky-800 uppercase tracking-wider cursor-pointer ${className}`} onClick={() => requestSort(sortKey)}>
            <div className="flex items-center">
                {label}
                <div className="relative w-4 h-4 ml-1">
                    <SortIcon direction={direction} />
                </div>
            </div>
        </th>
    );
};


const ClientTable: React.FC<ClientTableProps> = ({ clients, onEdit, onDelete, onManageLoans, onManageAppointments, onViewDetails, sortConfig, requestSort }) => {
    if (clients.length === 0) {
        return <div className="text-center py-10 text-gray-600 text-lg">No se encontraron clientes.</div>;
    }

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 hidden md:table">
                <thead className="bg-sky-100">
                    <tr>
                        <TableHeader sortKey="dni" label="DNI" sortConfig={sortConfig} requestSort={requestSort} />
                        <TableHeader sortKey="apellido" label="Apellido" sortConfig={sortConfig} requestSort={requestSort} />
                        <TableHeader sortKey="nombre" label="Nombre" sortConfig={sortConfig} requestSort={requestSort} />
                        <th className="p-3 text-left text-sm font-bold text-sky-800 uppercase tracking-wider">Celular</th>
                        <th className="p-3 text-left text-sm font-bold text-sky-800 uppercase tracking-wider">Estado</th>
                        <th className="p-3 text-left text-sm font-bold text-sky-800 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {clients.map(client => (
                        <tr key={client.id} className="hover:bg-sky-100 transition-colors cursor-pointer" onClick={() => onViewDetails(client)}>
                            <td className="p-3 whitespace-nowrap text-base text-gray-700">{client.dni}</td>
                            <td className="p-3 whitespace-nowrap text-base font-medium text-gray-900">{client.apellido}</td>
                            <td className="p-3 whitespace-nowrap text-base text-gray-700">{client.nombre}</td>
                            <td className="p-3 whitespace-nowrap text-base text-gray-700">{client.celular}</td>
                            <td className="p-3 whitespace-nowrap text-base text-gray-700">
                                <div className="flex items-center gap-2">
                                    {client.prestamos.some(p => p.estado === 'prestado') && <span title="Préstamo pendiente" className="text-yellow-600 text-xl">●</span>}
                                    {client.turnos.length > 0 && <span title="Turno pendiente" className="text-sky-600 text-xl">●</span>}
                                </div>
                            </td>
                            <td className="p-3 whitespace-nowrap text-base font-medium">
                                <div className="flex items-center gap-3">
                                    <button onClick={(e) => { e.stopPropagation(); onManageLoans(client); }} className="text-yellow-600 hover:text-yellow-800 transition">Préstamos</button>
                                    <button onClick={(e) => { e.stopPropagation(); onManageAppointments(client); }} className="text-sky-600 hover:text-sky-800 transition">Turnos</button>
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(client); }} className="text-cyan-600 hover:text-cyan-900 transition">Editar</button>
                                    <button onClick={(e) => { e.stopPropagation(); onDelete(client); }} className="text-red-600 hover:text-red-900 transition">Eliminar</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {/* Mobile View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                {clients.map(client => (
                    <div key={client.id} className="bg-white p-4 rounded-lg shadow space-y-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onViewDetails(client)}>
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="text-xl font-bold text-gray-800">{client.apellido}, {client.nombre}</p>
                                <p className="text-base text-gray-600">DNI: {client.dni}</p>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                                {client.prestamos.some(p => p.estado === 'prestado') && <span title="Préstamo pendiente" className="text-yellow-600 text-xl">●</span>}
                                {client.turnos.length > 0 && <span title="Turno pendiente" className="text-sky-600 text-xl">●</span>}
                            </div>
                        </div>
                        <p className="text-base text-gray-700">Cel: {client.celular}</p>
                        <div className="border-t pt-3 flex flex-wrap gap-x-4 gap-y-2 justify-end">
                            <button onClick={(e) => { e.stopPropagation(); onManageLoans(client); }} className="text-base text-yellow-600 hover:text-yellow-800 transition">Préstamos</button>
                            <button onClick={(e) => { e.stopPropagation(); onManageAppointments(client); }} className="text-base text-sky-600 hover:text-sky-800 transition">Turnos</button>
                            <button onClick={(e) => { e.stopPropagation(); onEdit(client); }} className="text-base text-cyan-600 hover:text-cyan-900 transition">Editar</button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(client); }} className="text-base text-red-600 hover:text-red-900 transition">Eliminar</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ClientTable;
