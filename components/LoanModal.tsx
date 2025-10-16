import React, { useState } from 'react';
import { Client, Loan } from '../types';

interface LoanModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client;
    onSave: (loans: Loan[]) => void;
}

const LoanModal: React.FC<LoanModalProps> = ({ isOpen, onClose, client, onSave }) => {
    const [loans, setLoans] = useState<Loan[]>(client.prestamos);
    const [newLoan, setNewLoan] = useState({ quienPresta: '', item: '' });

    if (!isOpen) return null;

    const handleAddLoan = () => {
        if (newLoan.quienPresta.trim() && newLoan.item.trim()) {
            const loanToAdd: Loan = {
                id: new Date().getTime().toString(),
                ...newLoan,
                estado: 'prestado',
                fecha: new Date().toISOString().split('T')[0],
            };
            setLoans([...loans, loanToAdd]);
            setNewLoan({ quienPresta: '', item: '' });
        }
    };

    const toggleLoanStatus = (id: string) => {
        setLoans(loans.map(loan => 
            loan.id === id 
            ? { ...loan, estado: loan.estado === 'prestado' ? 'devuelto' : 'prestado' } 
            : loan
        ));
    };
    
    const handleRemoveLoan = (id: string) => {
        setLoans(loans.filter(loan => loan.id !== id));
    };

    const handleSave = () => {
        onSave(loans);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-sky-800 mb-4">Préstamos de {client.nombre} {client.apellido}</h2>
                    
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 mb-4">
                        {loans.length === 0 && <p className="text-gray-600 text-base">No hay préstamos registrados.</p>}
                        {loans.map(loan => (
                            <div key={loan.id} className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm">
                                <div>
                                    <p className="font-semibold text-base text-gray-800">{loan.item}</p>
                                    <p className="text-sm text-gray-600">Prestado por: {loan.quienPresta} el {new Date(loan.fecha).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                     <button onClick={() => toggleLoanStatus(loan.id)} className={`text-sm font-semibold px-3 py-1 rounded-full ${loan.estado === 'prestado' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                        {loan.estado === 'prestado' ? 'Pendiente' : 'Devuelto'}
                                    </button>
                                     <button onClick={() => handleRemoveLoan(loan.id)} className="text-red-500 hover:text-red-700 text-2xl font-bold leading-none flex items-center justify-center h-6 w-6 rounded-full hover:bg-red-100">
                                       &times;
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold mb-2 text-gray-700">Agregar Nuevo Préstamo</h3>
                        <div className="flex gap-2">
                            <input type="text" placeholder="Item prestado" value={newLoan.item} onChange={e => setNewLoan({...newLoan, item: e.target.value})} className="flex-grow border p-2 rounded-md text-base bg-white text-gray-800 placeholder-gray-500"/>
                            <input type="text" placeholder="Quién presta" value={newLoan.quienPresta} onChange={e => setNewLoan({...newLoan, quienPresta: e.target.value})} className="flex-grow border p-2 rounded-md text-base bg-white text-gray-800 placeholder-gray-500"/>
                            <button onClick={handleAddLoan} className="bg-sky-500 text-white px-4 py-2 rounded-md hover:bg-sky-600">Agregar</button>
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

export default LoanModal;