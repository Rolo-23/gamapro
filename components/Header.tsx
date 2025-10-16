import React from 'react';
import { FilterState, Client } from '../types';

interface HeaderProps {
    onAddClient: () => void;
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    data: Client[];
}

const logoSrc = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE1MCIgaGVpZ2h0PSIxNTAiIHJ4PSIyOCIgZmlsbD0iIzAyODRjNyIvPjxwYXRoIGQ9Ik03NSAzNy41TDM3LjUgNjguNzVWMT EyLjVIMTEyLjVWNjguNzVMNzUgMzcuNVoiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTc1IDc1VjEwMCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI4IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNNjIuNSA4Ny41SDg3LjUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+";

const Header: React.FC<HeaderProps> = ({ onAddClient, filters, setFilters, data }) => {
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    const handleExport = () => {
        if (data.length === 0) {
            alert("No hay datos para exportar.");
            return;
        }
        const headers = ["DNI", "Nombre", "Apellido", "Estado Civil", "Condiciones Vivienda", "Celular", "Fecha de Nacimiento"];
        const rows = data.map(client => 
            [
                client.dni, 
                client.nombre, 
                client.apellido,
                client.estadoCivil,
                client.condicionesVivienda,
                client.celular, 
                client.fechaNacimiento
            ].map(field => `"${String(field ?? '').replace(/"/g, '""')}"`).join(',')
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "clientes.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <header className="bg-white shadow-sm p-4 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <img src={logoSrc} alt="Logo GAMA" className="h-14 w-14 object-contain" />
                        <h1 className="text-3xl font-bold text-sky-800">GAMA (Gestión del Adulto Mayor)</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handleExport} className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-base font-medium">Exportar CSV</button>
                        <button onClick={onAddClient} className="py-2 px-4 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-base font-medium">
                            + Agregar Cliente
                        </button>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        name="query"
                        placeholder="Buscar por nombre, apellido o DNI..."
                        value={filters.query}
                        onChange={handleFilterChange}
                        className="p-2 border border-gray-300 rounded-md w-full text-base bg-white text-gray-800 focus:ring-sky-500 focus:border-sky-500"
                    />
                    <select name="techSavvy" value={filters.techSavvy} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-md w-full text-base bg-white text-gray-800 focus:ring-sky-500 focus:border-sky-500">
                        <option value="all">Tecnología (Todos)</option>
                        <option value="yes">Maneja tecnología</option>
                        <option value="no">No maneja tecnología</option>
                    </select>
                    <select name="pendingLoan" value={filters.pendingLoan} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-md w-full text-base bg-white text-gray-800 focus:ring-sky-500 focus:border-sky-500">
                        <option value="all">Préstamo (Todos)</option>
                        <option value="yes">Con préstamo pendiente</option>
                        <option value="no">Sin préstamo pendiente</option>
                    </select>
                    <select name="pendingAppointment" value={filters.pendingAppointment} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-md w-full text-base bg-white text-gray-800 focus:ring-sky-500 focus:border-sky-500">
                        <option value="all">Turno (Todos)</option>
                        <option value="yes">Con turno pendiente</option>
                        <option value="no">Sin turno pendiente</option>
                    </select>
                </div>
            </div>
        </header>
    );
};

export default Header;