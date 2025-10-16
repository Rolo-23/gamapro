
import { useState, useEffect, useCallback } from 'react';
import { Client } from '../types';
import * as api from '../services/api';

export const useClients = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchClients = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.getClients();
            setClients(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch clients');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const addClient = async (clientData: Omit<Client, 'id'>) => {
        try {
            const newClient = await api.addClient(clientData);
            setClients(prevClients => [...prevClients, newClient]);
        } catch (err) {
            setError('Failed to add client');
        }
    };

    const updateClient = async (id: string, updatedData: Client) => {
        try {
            const updatedClient = await api.updateClient(id, updatedData);
            setClients(prevClients =>
                prevClients.map(client => (client.id === id ? updatedClient : client))
            );
        } catch (err) {
            setError('Failed to update client');
        }
    };

    const deleteClient = async (id: string) => {
        try {
            await api.deleteClient(id);
            setClients(prevClients => prevClients.filter(client => client.id !== id));
        } catch (err) {
            setError('Failed to delete client');
        }
    };

    return { clients, loading, error, addClient, updateClient, deleteClient };
};
