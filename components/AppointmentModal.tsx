import React, { useState } from 'react';
import { Client, Appointment } from '../types';

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client;
    onSave: (appointments: Appointment[]) => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, client, onSave }) => {
    const [appointments, setAppointments] = useState<Appointment[]>(client.turnos);
    const [newAppointment, setNewAppointment] = useState({ lugar: '', medico: '', dia: '', hora: '' });

    if (!isOpen) return null;

    const handleAddAppointment = () => {
        // FIX: The value from Object.values was inferred as 'unknown', causing a type error on '.trim()'.
        // Added a 'typeof field === "string"' type guard to allow calling trim safely.
        if (Object.values(newAppointment).every(field => typeof field === 'string' && field.trim() !== '')) {
            const appointmentToAdd: Appointment = {
                id: new Date().getTime().toString(),
                ...newAppointment,
            };
            setAppointments([...appointments, appointmentToAdd]);
            setNewAppointment({ lugar: '', medico: '', dia: '', hora: '' });
        }
    };
    
    const handleRemoveAppointment = (id: string) => {
        setAppointments(appointments.filter(appt => appt.id !== id));
    };

    const handleSave = () => {
        onSave(appointments);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-sky-800 mb-4">Turnos de {client.nombre} {client.apellido}</h2>
                    
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 mb-4">
                        {appointments.length === 0 && <p className="text-gray-600 text-base">No hay turnos registrados.</p>}
                        {appointments.map(appt => (
                            <div key={appt.id} className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm">
                                <div>
                                    <p className="font-semibold text-base text-gray-800">{appt.medico} en {appt.lugar}</p>
                                    <p className="text-sm text-gray-600">Fecha: {new Date(appt.dia).toLocaleDateString()} a las {appt.hora}</p>
                                </div>
                                <button onClick={() => handleRemoveAppointment(appt.id)} className="text-red-500 hover:text-red-700 text-2xl font-bold leading-none flex items-center justify-center h-6 w-6 rounded-full hover:bg-red-100">
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold mb-2 text-gray-700">Agregar Nuevo Turno</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <input type="text" placeholder="Lugar" value={newAppointment.lugar} onChange={e => setNewAppointment({...newAppointment, lugar: e.target.value})} className="border p-2 rounded-md text-base bg-white text-gray-800 placeholder-gray-500"/>
                            <input type="text" placeholder="Médico" value={newAppointment.medico} onChange={e => setNewAppointment({...newAppointment, medico: e.target.value})} className="border p-2 rounded-md text-base bg-white text-gray-800 placeholder-gray-500"/>
                            <input type="date" value={newAppointment.dia} onChange={e => setNewAppointment({...newAppointment, dia: e.target.value})} className="border p-2 rounded-md text-base bg-white text-gray-800"/>
                            <input type="time" value={newAppointment.hora} onChange={e => setNewAppointment({...newAppointment, hora: e.target.value})} className="border p-2 rounded-md text-base bg-white text-gray-800"/>
                            <button onClick={handleAddAppointment} className="col-span-2 bg-sky-500 text-white px-4 py-2 rounded-md hover:bg-sky-600">Agregar</button>
                        </div>
                    </div>
                </div>
                <div className="bg-sky-50 px-6 py-3 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100">Cerrar</button>
                    <button type="button" onClick={handleSave} className="py-2 px-4 bg-sky-600 text-white rounded-lg hover:bg-sky-700">Guardar Cambios</button>
                </div>
            </div>
        </div>
    );
};

export default AppointmentModal;