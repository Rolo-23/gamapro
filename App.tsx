
import React, { useState, useMemo, useCallback } from 'react';
import { Client, SortConfig, FilterState, Loan, Appointment } from './types';
import { useClients } from './hooks/useClients';
import Header from './components/Header';
import ClientTable from './components/ClientTable';
import ClientFormModal from './components/ClientFormModal';
import LoanModal from './components/LoanModal';
import AppointmentModal from './components/AppointmentModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ClientDetailModal from './components/ClientDetailModal';
import { ToastProvider } from './contexts/ToastContext';
import { useToast } from './hooks/useToast';

const AppContent: React.FC = () => {
    const { clients, addClient, updateClient, deleteClient, loading, error } = useClients();
    const { showToast } = useToast();

    const [isClientModalOpen, setClientModalOpen] = useState(false);
    const [isLoanModalOpen, setLoanModalOpen] = useState(false);
    const [isAppointmentModalOpen, setAppointmentModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
    const [selectedClientForDetails, setSelectedClientForDetails] = useState<Client | null>(null);


    const [filters, setFilters] = useState<FilterState>({
        query: '',
        techSavvy: 'all',
        pendingLoan: 'all',
        pendingAppointment: 'all',
    });

    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'apellido', direction: 'ascending' });
    
    const handleAddClient = () => {
        setEditingClient(null);
        setClientModalOpen(true);
    };

    const handleEditClient = (client: Client) => {
        setEditingClient(client);
        setClientModalOpen(true);
    };
    
    const handleCloseClientModal = () => {
        setClientModalOpen(false);
        setEditingClient(null);
    };

    const handleSaveClient = async (client: Omit<Client, 'id'> | Client) => {
        if ('id' in client) {
            await updateClient(client.id, client);
            showToast('Cliente actualizado con éxito', 'success');
        } else {
            await addClient(client);
            showToast('Cliente agregado con éxito', 'success');
        }
        handleCloseClientModal();
    };

    const handleDeleteRequest = (client: Client) => {
        setClientToDelete(client);
        setDeleteModalOpen(true);
    };
    
    const confirmDelete = async () => {
        if (clientToDelete) {
            await deleteClient(clientToDelete.id);
            showToast('Cliente eliminado con éxito', 'success');
            setDeleteModalOpen(false);
            setClientToDelete(null);
        }
    };

    const handleManageLoans = (client: Client) => {
        setSelectedClient(client);
        setLoanModalOpen(true);
    };

    const handleSaveLoans = (loans: Loan[]) => {
        if (selectedClient) {
            updateClient(selectedClient.id, { ...selectedClient, prestamos: loans });
            showToast('Préstamos actualizados', 'success');
        }
        setLoanModalOpen(false);
        setSelectedClient(null);
    };

    const handleManageAppointments = (client: Client) => {
        setSelectedClient(client);
        setAppointmentModalOpen(true);
    };

    const handleSaveAppointments = (appointments: Appointment[]) => {
        if (selectedClient) {
            updateClient(selectedClient.id, { ...selectedClient, turnos: appointments });
            showToast('Turnos actualizados', 'success');
        }
        setAppointmentModalOpen(false);
        setSelectedClient(null);
    };

    const handleViewDetails = (client: Client) => {
        setSelectedClientForDetails(client);
        setDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setDetailModalOpen(false);
        setSelectedClientForDetails(null);
    };

    const filteredClients = useMemo(() => {
        return clients.filter(client => {
            const fullName = `${client.nombre.toLowerCase()} ${client.apellido.toLowerCase()}`;
            const queryMatch = filters.query === '' || fullName.includes(filters.query.toLowerCase()) || client.dni.includes(filters.query);
            
            const techMatch = filters.techSavvy === 'all' || client.manejaTecnologia === (filters.techSavvy === 'yes');

            const hasPendingLoan = client.prestamos.some(p => p.estado === 'prestado');
            const loanMatch = filters.pendingLoan === 'all' || hasPendingLoan === (filters.pendingLoan === 'yes');

            const hasPendingAppointment = client.turnos.length > 0; // Simplified logic, could be based on date
            const appointmentMatch = filters.pendingAppointment === 'all' || hasPendingAppointment === (filters.pendingAppointment === 'yes');
            
            return queryMatch && techMatch && loanMatch && appointmentMatch;
        });
    }, [clients, filters]);
    
    const sortedClients = useMemo(() => {
        let sortableClients = [...filteredClients];
        if (sortConfig.key !== null) {
            sortableClients.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableClients;
    }, [filteredClients, sortConfig]);
    
    const requestSort = (key: keyof Client) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="min-h-screen bg-sky-50 text-gray-800">
            <Header onAddClient={handleAddClient} filters={filters} setFilters={setFilters} data={sortedClients} />
            <main className="p-4 sm:p-6 lg:p-8">
                {loading && <p className="text-center">Cargando clientes...</p>}
                {error && <p className="text-center text-red-500">Error: {error}</p>}
                {!loading && !error && (
                    <ClientTable
                        clients={sortedClients}
                        onEdit={handleEditClient}
                        onDelete={handleDeleteRequest}
                        onManageLoans={handleManageLoans}
                        onManageAppointments={handleManageAppointments}
                        onViewDetails={handleViewDetails}
                        sortConfig={sortConfig}
                        requestSort={requestSort}
                    />
                )}
            </main>
            {isClientModalOpen && (
                <ClientFormModal
                    isOpen={isClientModalOpen}
                    onClose={handleCloseClientModal}
                    onSave={handleSaveClient}
                    client={editingClient}
                />
            )}
            {isLoanModalOpen && selectedClient && (
                 <LoanModal
                    isOpen={isLoanModalOpen}
                    onClose={() => setLoanModalOpen(false)}
                    client={selectedClient}
                    onSave={handleSaveLoans}
                />
            )}
            {isAppointmentModalOpen && selectedClient && (
                <AppointmentModal
                    isOpen={isAppointmentModalOpen}
                    onClose={() => setAppointmentModalOpen(false)}
                    client={selectedClient}
                    onSave={handleSaveAppointments}
                />
            )}
            {isDeleteModalOpen && clientToDelete && (
                <DeleteConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    clientName={`${clientToDelete.nombre} ${clientToDelete.apellido}`}
                />
            )}
            {isDetailModalOpen && (
                <ClientDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={handleCloseDetailModal}
                    client={selectedClientForDetails}
                />
            )}
        </div>
    );
}

const App: React.FC = () => (
    <ToastProvider>
        <AppContent />
    </ToastProvider>
);

export default App;
