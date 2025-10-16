
import React from 'react';
import { Client } from '../types';

interface ClientDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client | null;
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-lg font-bold text-sky-700 border-b-2 border-sky-200 pb-2 mb-3">{title}</h3>
        <div className="space-y-2 text-base text-gray-700">{children}</div>
    </div>
);

const DetailItem: React.FC<{ label: string; value?: string | React.ReactNode }> = ({ label, value }) => (
    <div className="grid grid-cols-3 gap-4">
        <p className="font-semibold text-gray-800 col-span-1">{label}</p>
        <div className="col-span-2">{value || <span className="text-gray-500">No especificado</span>}</div>
    </div>
);

const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

const ClientDetailModal: React.FC<ClientDetailModalProps> = ({ isOpen, onClose, client }) => {
    if (!isOpen || !client) return null;
    
    const age = calculateAge(client.fechaNacimiento);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 sm:p-8">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold text-sky-800">Detalles de {client.nombre} {client.apellido}</h2>
                         <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl font-bold">&times;</button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                        <div>
                            <DetailSection title="Información Personal">
                                <DetailItem label="DNI" value={client.dni} />
                                <DetailItem label="Nombre Completo" value={`${client.nombre} ${client.apellido}`} />
                                <DetailItem label="Fecha de Nac." value={`${new Date(client.fechaNacimiento).toLocaleDateString()} (${age} años)`} />
                                <DetailItem label="Estado Civil" value={client.estadoCivil} />
                                <DetailItem label="Maneja Tecnología" value={client.manejaTecnologia ? 'Sí' : 'No'} />
                            </DetailSection>

                            <DetailSection title="Contacto">
                                <DetailItem label="Celular" value={client.celular} />
                                <DetailItem label="Familiar" value={client.familiarContacto.nombre} />
                                <DetailItem label="Tel. Familiar" value={client.familiarContacto.telefono} />
                                <DetailItem label="Médico" value={client.medicoCabecera} />
                            </DetailSection>
                        </div>

                        <div>
                            <DetailSection title="Vivienda">
                                 <DetailItem label="Residencia" value={client.dondeVive} />
                                 <DetailItem label="Condiciones" value={<p className="whitespace-pre-wrap">{client.condicionesVivienda}</p>} />
                            </DetailSection>
                        </div>
                    </div>

                    <DetailSection title="Préstamos">
                        {client.prestamos.length > 0 ? (
                            <ul className="space-y-2">
                                {client.prestamos.map(p => (
                                    <li key={p.id} className="p-2 border rounded-md bg-gray-50 flex justify-between items-center">
                                        <div>
                                            <p><span className="font-semibold">{p.item}</span> (prestado por {p.quienPresta})</p>
                                            <p className="text-sm text-gray-500">Fecha: {new Date(p.fecha).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${p.estado === 'prestado' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                            {p.estado === 'prestado' ? 'Pendiente' : 'Devuelto'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-gray-500">No hay préstamos registrados.</p>}
                    </DetailSection>

                    <DetailSection title="Turnos Médicos">
                        {client.turnos.length > 0 ? (
                            <ul className="space-y-2">
                                {client.turnos.map(t => (
                                    <li key={t.id} className="p-2 border rounded-md bg-gray-50">
                                        <p><span className="font-semibold">{t.medico}</span> en {t.lugar}</p>
                                        <p className="text-sm text-gray-500">Fecha: {new Date(t.dia).toLocaleDateString()} a las {t.hora}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-gray-500">No hay turnos registrados.</p>}
                    </DetailSection>

                </div>
                 <div className="bg-sky-50 px-6 py-3 flex justify-end">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-sky-600 text-white rounded-lg hover:bg-sky-700">Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export default ClientDetailModal;
