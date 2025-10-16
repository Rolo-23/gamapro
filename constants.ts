import { Client } from './types';

export const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    dni: '12345678',
    nombre: 'Juan',
    apellido: 'Pérez',
    dondeVive: 'Solo en su casa',
    estadoCivil: 'Viudo/a',
    condicionesVivienda: 'Casa propia, bien mantenida. Recibe visitas diarias de su hija.',
    manejaTecnologia: true,
    celular: '1122334455',
    familiarContacto: {
      nombre: 'María Pérez (Hija)',
      telefono: '1187654321',
    },
    medicoCabecera: 'Dr. García',
    fechaNacimiento: '1945-05-20',
    turnos: [
        { id: 't1', lugar: 'Hospital Central', dia: '2024-08-15', medico: 'Dr. House', hora: '10:00' }
    ],
    prestamos: [
        { id: 'p1', quienPresta: 'Centro de Jubilados', item: 'Silla de ruedas', estado: 'prestado', fecha: '2024-07-01' }
    ],
  },
  {
    id: '2',
    dni: '87654321',
    nombre: 'Ana',
    apellido: 'Gómez',
    dondeVive: 'Con su hija',
    estadoCivil: 'Casado/a',
    condicionesVivienda: 'Vive en un departamento en el primer piso del mismo edificio que su hija. El acceso tiene rampas.',
    manejaTecnologia: false,
    celular: '1155667788',
    familiarContacto: {
      nombre: 'Lucía Gómez (Hija)',
    },
    medicoCabecera: 'Dra. Fernández',
    fechaNacimiento: '1950-11-12',
    turnos: [],
    prestamos: [
         { id: 'p2', quienPresta: 'Vecino solidario', item: 'Andador', estado: 'devuelto', fecha: '2024-06-10' }
    ],
  },
  {
    id: '3',
    dni: '11223344',
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    dondeVive: 'Hogar de ancianos "La Esperanza"',
    estadoCivil: 'Soltero/a',
    condicionesVivienda: 'Habitación individual en hogar de ancianos. El lugar es limpio y cuenta con personal de enfermería 24hs.',
    manejaTecnologia: true,
    celular: '1199887766',
    familiarContacto: {
      nombre: 'Admin Hogar',
      telefono: '1112345678',
    },
    medicoCabecera: 'Dr. López',
    fechaNacimiento: '1948-02-03',
    turnos: [
        { id: 't2', lugar: 'Consultorio Privado', dia: '2024-09-01', medico: 'Dr. Smith', hora: '15:30' }
    ],
    prestamos: [],
  },
];