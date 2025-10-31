// Componente de alerta de cierre de sesión
import React from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';

const LogoutAlert = ({ show, onCancel, onConfirm }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-fadeIn">

                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-black text-white">Cerrar Sesión</h3>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-white/80 hover:text-white transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 text-center space-y-4">
                    <p className="text-gray-800 font-medium text-base text-lg">
                        ¿Seguro que deseas cerrar tu sesión?
                    </p>
                    <p className="text-md text-gray-500">
                        Se cerrará tu cuenta actual y deberás volver a iniciar sesión.
                    </p>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onCancel}
                            className="cursor-pointer flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            className="cursor-pointer flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            Salir
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
        </div>
    );
};

export default LogoutAlert;
