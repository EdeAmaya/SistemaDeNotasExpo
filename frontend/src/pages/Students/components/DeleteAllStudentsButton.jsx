import React, { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

const DeleteAllStudentsButton = ({ totalStudents, onDeleteAll }) => {
    const [showModal, setShowModal] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (confirmText !== 'ELIMINAR TODO') return;

        setIsDeleting(true);
        const success = await onDeleteAll();
        setIsDeleting(false);

        if (success) {
            setShowModal(false);
            setConfirmText('');
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                style={{ cursor: 'pointer' }}
                disabled={totalStudents === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${totalStudents === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-50 text-red-700 hover:bg-red-600 hover:text-white border-2 border-red-200 hover:border-red-600'
                    }`}
            >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar Todos</span>
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">

                        {/* Header */}
                        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                        <AlertTriangle className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white">¡ADVERTENCIA!</h3>
                                        <p className="text-red-100 text-sm font-medium">Acción irreversible</p>
                                    </div>
                                </div>
                                <button
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                        setShowModal(false);
                                        setConfirmText('');
                                    }}
                                    className="text-white/80 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                                <p className="text-gray-900 font-bold text-center text-lg mb-2">
                                    Estás a punto de eliminar
                                </p>
                                <p className="text-red-600 font-black text-center text-4xl">
                                    {totalStudents} {totalStudents === 1 ? 'estudiante' : 'estudiantes'}
                                </p>
                            </div>

                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <p>Esta acción <span className="font-bold text-gray-900">NO SE PUEDE DESHACER</span></p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <p>Todos los registros serán eliminados <span className="font-bold text-gray-900">permanentemente</span></p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <p>No habrá forma de recuperar la información</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-900">
                                    Para confirmar, escribe: <span className="text-red-600">ELIMINAR TODO</span>
                                </label>
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder="Escribe aquí..."
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all font-mono text-center font-bold"
                                    disabled={isDeleting}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setConfirmText('');
                                    }}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    style={{ cursor: 'pointer' }}
                                    onClick={handleDelete}
                                    disabled={confirmText !== 'ELIMINAR TODO' || isDeleting}
                                    className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${confirmText === 'ELIMINAR TODO' && !isDeleting
                                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Eliminando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-5 h-5" />
                                            <span>Eliminar Todo</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
        </>
    );
};

export default DeleteAllStudentsButton;