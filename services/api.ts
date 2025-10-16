
import { Client } from '../types';
import { MOCK_CLIENTS } from '../constants';

let clients: Client[] = [...MOCK_CLIENTS];

const simulateLatency = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getClients = async (): Promise<Client[]> => {
    await simulateLatency(500);
    return [...clients];
};

export const addClient = async (clientData: Omit<Client, 'id'>): Promise<Client> => {
    await simulateLatency(300);
    const newClient: Client = {
        ...clientData,
        id: new Date().getTime().toString(),
    };
    clients.push(newClient);
    return newClient;
};

export const updateClient = async (id: string, updatedData: Client): Promise<Client> => {
    await simulateLatency(300);
    const clientIndex = clients.findIndex(c => c.id === id);
    if (clientIndex === -1) {
        throw new Error('Client not found');
    }
    clients[clientIndex] = { ...clients[clientIndex], ...updatedData };
    return clients[clientIndex];
};

export const deleteClient = async (id: string): Promise<{ id: string }> => {
    await simulateLatency(300);
    const initialLength = clients.length;
    clients = clients.filter(c => c.id !== id);
    if (clients.length === initialLength) {
        throw new Error('Client not found');
    }
    return { id };
};
