// Configuración de base de datos para el sistema GAMA
// Conecta el frontend con MySQL/MariaDB

import { Client, Loan, Appointment } from '../types';

// Configuración de la base de datos
export const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gama_system',
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
};

// Interfaces para las respuestas de la base de datos
export interface DBClient {
  id: string;
  dni: string;
  nombre: string;
  apellido: string;
  donde_vive: string;
  estado_civil: string;
  condiciones_vivienda: string;
  maneja_tecnologia: boolean;
  celular: string;
  familiar_contacto_nombre: string;
  familiar_contacto_telefono: string | null;
  medico_cabecera: string;
  fecha_nacimiento: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  activo: boolean;
}

export interface DBLoan {
  id: string;
  cliente_id: string;
  quien_presta: string;
  item: string;
  estado: 'prestado' | 'devuelto';
  fecha_prestamo: string;
  fecha_devolucion: string | null;
  observaciones: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface DBAppointment {
  id: string;
  cliente_id: string;
  lugar: string;
  dia: string;
  medico: string;
  hora: string;
  especialidad: string | null;
  observaciones: string | null;
  estado: 'programado' | 'realizado' | 'cancelado' | 'reprogramado';
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// Función para convertir DBClient a Client
export function dbClientToClient(dbClient: DBClient, loans: Loan[], appointments: Appointment[]): Client {
  return {
    id: dbClient.id,
    dni: dbClient.dni,
    nombre: dbClient.nombre,
    apellido: dbClient.apellido,
    dondeVive: dbClient.donde_vive,
    estadoCivil: dbClient.estado_civil,
    condicionesVivienda: dbClient.condiciones_vivienda,
    manejaTecnologia: dbClient.maneja_tecnologia,
    celular: dbClient.celular,
    familiarContacto: {
      nombre: dbClient.familiar_contacto_nombre,
      telefono: dbClient.familiar_contacto_telefono || undefined,
    },
    medicoCabecera: dbClient.medico_cabecera,
    fechaNacimiento: dbClient.fecha_nacimiento,
    turnos: appointments,
    prestamos: loans,
  };
}

// Función para convertir Client a DBClient
export function clientToDBClient(client: Omit<Client, 'id'> | Client): Omit<DBClient, 'id' | 'fecha_creacion' | 'fecha_actualizacion'> {
  return {
    dni: client.dni,
    nombre: client.nombre,
    apellido: client.apellido,
    donde_vive: client.dondeVive,
    estado_civil: client.estadoCivil,
    condiciones_vivienda: client.condicionesVivienda,
    maneja_tecnologia: client.manejaTecnologia,
    celular: client.celular,
    familiar_contacto_nombre: client.familiarContacto.nombre,
    familiar_contacto_telefono: client.familiarContacto.telefono || null,
    medico_cabecera: client.medicoCabecera,
    fecha_nacimiento: client.fechaNacimiento,
    activo: true,
  };
}

// Función para convertir DBLoan a Loan
export function dbLoanToLoan(dbLoan: DBLoan): Loan {
  return {
    id: dbLoan.id,
    quienPresta: dbLoan.quien_presta,
    item: dbLoan.item,
    estado: dbLoan.estado,
    fecha: dbLoan.fecha_prestamo,
  };
}

// Función para convertir Loan a DBLoan
export function loanToDBLoan(loan: Omit<Loan, 'id'> | Loan, clienteId: string): Omit<DBLoan, 'id' | 'fecha_creacion' | 'fecha_actualizacion'> {
  return {
    cliente_id: clienteId,
    quien_presta: loan.quienPresta,
    item: loan.item,
    estado: loan.estado,
    fecha_prestamo: loan.fecha,
    fecha_devolucion: loan.estado === 'devuelto' ? loan.fecha : null,
    observaciones: null,
  };
}

// Función para convertir DBAppointment a Appointment
export function dbAppointmentToAppointment(dbAppointment: DBAppointment): Appointment {
  return {
    id: dbAppointment.id,
    lugar: dbAppointment.lugar,
    dia: dbAppointment.dia,
    medico: dbAppointment.medico,
    hora: dbAppointment.hora,
  };
}

// Función para convertir Appointment a DBAppointment
export function appointmentToDBAppointment(appointment: Omit<Appointment, 'id'> | Appointment, clienteId: string): Omit<DBAppointment, 'id' | 'fecha_creacion' | 'fecha_actualizacion'> {
  return {
    cliente_id: clienteId,
    lugar: appointment.lugar,
    dia: appointment.dia,
    medico: appointment.medico,
    hora: appointment.hora,
    especialidad: null,
    observaciones: null,
    estado: 'programado',
  };
}
