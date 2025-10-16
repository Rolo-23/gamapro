import React, { useState, useEffect } from 'react';
import { Client } from '../types';

interface ClientFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (client: Omit<Client, 'id'> | Client) => void;
    client: Client | null;
}

const initialFormState = {
    dni: '',
    nombre: '',
    apellido: '',
    dondeVive: '',
    estadoCivil: '',
    condicionesVivienda: '',
    manejaTecnologia: false,
    celular: '',
    familiarContacto: { nombre: '', telefono: '' },
    medicoCabecera: '',
    fechaNacimiento: '',
    turnos: [],
    prestamos: [],
};

const ClientFormModal: React.FC<ClientFormModalProps> = ({ isOpen, onClose, onSave, client }) => {
    const [formState, setFormState] = useState<Omit<Client, 'id'>>(initialFormState);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (client) {
            setFormState(client);
        } else {
            setFormState(initialFormState);
        }
    }, [client, isOpen]);

    // FIX: The original check `type === 'checkbox'` used a destructured variable,
    // which prevents TypeScript's control flow analysis from narrowing the type of `e.target`.
    // By checking `e.target`'s properties directly, TypeScript can correctly infer the type.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
            setFormState(prev => ({ ...prev, [name]: e.target.checked }));
        } else {
            setFormState(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFamiliarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({
            ...prev,
            familiarContacto: { ...prev.familiarContacto, [name]: value },
        }));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formState.dni.match(/^\d{7,8}$/)) newErrors.dni = 'DNI debe tener 7 u 8 dígitos numéricos.';
        if (!formState.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio.';
        if (!formState.apellido.trim()) newErrors.apellido = 'El apellido es obligatorio.';
        if (!formState.celular.trim()) newErrors.celular = 'El celular es obligatorio.';
        if (!formState.fechaNacimiento) newErrors.fechaNacimiento = 'La fecha de nacimiento es obligatoria.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave(client ? { ...formState, id: client.id } : formState);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-sky-800 mb-6">{client ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div>
                                <label className="block text-base font-medium text-gray-700">DNI</label>
                                <input type="text" name="dni" value={formState.dni} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-base bg-white text-gray-800" required />
                                {errors.dni && <p className="text-red-500 text-xs mt-1">{errors.dni}</p>}
                            </div>
                            <div>
                                <label className="block text-base font-medium text-gray-700">Nombre</label>
                                <input type="text" name="nombre" value={formState.nombre} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-base bg-white text-gray-800" required/>
                                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                            </div>
                            <div>
                                <label className="block text-base font-medium text-gray-700">Apellido</label>
                                <input type="text" name="apellido" value={formState.apellido} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-base bg-white text-gray-800" required/>
                                {errors.apellido && <p className="text-red-500 text-xs mt-1">{errors.apellido}</p>}
                            </div>
                             <div>
                                <label className="block text-base font-medium text-gray-700">Fecha de Nacimiento</label>
                                <input type="date" name="fechaNacimiento" value={formState.fechaNacimiento} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-base bg-white text-gray-800" required/>
                                {errors.fechaNacimiento && <p className="text-red-500 text-xs mt-1">{errors.fechaNacimiento}</p>}
                            </div>
                            <div>
                                <label className="block text-base font-medium text-gray-700">Estado Civil</label>
                                <select name="estadoCivil" value={formState.estadoCivil} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-base bg-white text-gray-800">
                                    <option value="">Seleccione...</option>
                                    <option value="Soltero/a">Soltero/a</option>
                                    <option value="Casado/a">Casado/a</option>
                                    <option value="Viudo/a">Viudo/a</option>
                                    <option value="Divorciado/a">Divorciado/a</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-base font-medium text-gray-700">Celular</label>
                                <input type="text" name="celular" value={formState.celular} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-base bg-white text-gray-800" required />
                                {errors.celular && <p className="text-red-500 text-xs mt-1">{errors.celular}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-base font-medium text-gray-700">¿Dónde o con quién vive?</label>
                                <textarea name="dondeVive" value={formState.dondeVive} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-base bg-white text-gray-800" rows={2}></textarea>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-base font-medium text-gray-700">Condiciones de Vivienda</label>
                                <textarea name="condicionesVivienda" value={formState.condicionesVivienda} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-base bg-white text-gray-800" rows={3}></textarea>
                            </div>
                             <div>
                                <label className="block text-base font-medium text-gray-700">Médico de Cabecera</label>
                                <input type="text" name="medicoCabecera" value={formState.medicoCabecera} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-base bg-white text-gray-800" />
                            </div>
                            <div>
                                <label className="block text-base font-medium text-gray-700">Familiar de Contacto</label>
                                <input type="text" name="nombre" placeholder="Nombre del familiar" value={formState.familiarContacto.nombre} onChange={handleFamiliarChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-base bg-white text-gray-800 placeholder-gray-500" />
                            </div>
                            <div>
                                <label className="block text-base font-medium text-gray-700">Teléfono del Familiar</label>
                                <input type="text" name="telefono" placeholder="Teléfono (opcional)" value={formState.familiarContacto.telefono} onChange={handleFamiliarChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-base bg-white text-gray-800 placeholder-gray-500" />
                            </div>
                             <div className="md:col-span-2 flex items-center mt-2">
                                <input type="checkbox" id="manejaTecnologia" name="manejaTecnologia" checked={formState.manejaTecnologia} onChange={handleChange} className="h-4 w-4 text-sky-600 border-gray-300 rounded" />
                                <label htmlFor="manejaTecnologia" className="ml-2 block text-base text-gray-900">Maneja la tecnología</label>
                            </div>
                        </div>
                    </div>
                    <div className="bg-sky-50 px-6 py-3 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100">Cancelar</button>
                        <button type="submit" className="py-2 px-4 bg-sky-600 text-white rounded-lg hover:bg-sky-700">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientFormModal;