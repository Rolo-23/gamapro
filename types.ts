export interface Loan {
  id: string;
  quienPresta: string;
  item: string;
  estado: 'prestado' | 'devuelto';
  fecha: string; // ISO date string
}

export interface Appointment {
  id: string;
  lugar: string;
  dia: string; // ISO date string
  medico: string;
  hora: string; // e.g., "10:30"
}

export interface Client {
  id: string;
  dni: string;
  nombre: string;
  apellido: string;
  dondeVive: string;
  condicionesVivienda: string; // New field
  estadoCivil: string; // New field
  manejaTecnologia: boolean;
  celular: string;
  familiarContacto: {
    nombre: string;
    telefono?: string;
  };
  medicoCabecera: string;
  fechaNacimiento: string; // ISO date string
  turnos: Appointment[];
  prestamos: Loan[];
}

export interface SortConfig {
    key: keyof Client;
    direction: 'ascending' | 'descending';
}

export interface FilterState {
    query: string;
    techSavvy: 'all' | 'yes' | 'no';
    pendingLoan: 'all' | 'yes' | 'no';
    pendingAppointment: 'all' | 'yes' | 'no';
}