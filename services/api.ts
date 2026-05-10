import { Client } from '../types';

// URL base de la API del backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Función auxiliar para hacer peticiones HTTP
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Funciones de la API
export const getClients = async (): Promise<Client[]> => {
  return fetchAPI<Client[]>('/clientes');
};

export const getClient = async (id: string): Promise<Client> => {
  return fetchAPI<Client>(`/clientes/${id}`);
};

export const addClient = async (clientData: Omit<Client, 'id'>): Promise<Client> => {
  return fetchAPI<Client>('/clientes', {
    method: 'POST',
    body: JSON.stringify(clientData),
  });
};

export const updateClient = async (id: string, updatedData: Client): Promise<Client> => {
  return fetchAPI<Client>(`/clientes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedData),
  });
};

export const deleteClient = async (id: string): Promise<{ id: string }> => {
  return fetchAPI<{ id: string }>(`/clientes/${id}`, {
    method: 'DELETE',
  });
};
