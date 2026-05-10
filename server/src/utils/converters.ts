// Tipos compartidos (copiados desde el frontend)
export interface Loan {
  id: string;
  quienPresta: string;
  item: string;
  estado: 'prestado' | 'devuelto';
  fecha: string;
}

export interface Appointment {
  id: string;
  lugar: string;
  dia: string;
  medico: string;
  hora: string;
}

export interface Client {
  id: string;
  dni: string;
  nombre: string;
  apellido: string;
  dondeVive: string;
  condicionesVivienda: string;
  estadoCivil: string;
  manejaTecnologia: boolean;
  celular: string;
  familiarContacto: {
    nombre: string;
    telefono?: string;
  };
  medicoCabecera: string;
  fechaNacimiento: string;
  turnos: Appointment[];
  prestamos: Loan[];
}

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
    condicionesVivienda: dbClient.condiciones_vivienda || '',
    manejaTecnologia: dbClient.maneja_tecnologia,
    celular: dbClient.celular || '',
    familiarContacto: {
      nombre: dbClient.familiar_contacto_nombre || '',
      telefono: dbClient.familiar_contacto_telefono || undefined,
    },
    medicoCabecera: dbClient.medico_cabecera || '',
    fechaNacimiento: dbClient.fecha_nacimiento,
    turnos: appointments,
    prestamos: loans,
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

