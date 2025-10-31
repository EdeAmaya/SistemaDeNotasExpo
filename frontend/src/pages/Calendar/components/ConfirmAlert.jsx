// Componente reutilizable para confirmar cuando se elimina algo
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmAlert = ({
  show,
  title = '¿Estás seguro?',
  message = 'Esta acción no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  confirmColor = 'red',
  icon: Icon = AlertTriangle
}) => {
  if (!show) return null;

  const colorClasses = {
    red: 'from-red-500 to-red-600 focus:ring-red-100',
    blue: 'from-blue-500 to-blue-600 focus:ring-blue-100',
    green: 'from-green-500 to-green-600 focus:ring-green-100',
    yellow: 'from-yellow-500 to-yellow-600 focus:ring-yellow-100',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-fadeIn">

        {/* Header */}
        <div className={`bg-gradient-to-r ${colorClasses[confirmColor] || colorClasses.red} p-5 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-black text-white">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="cursor-pointer text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-5">
          <p className="text-gray-800 font-medium text-base text-xl">{message}</p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              className="cursor-pointer flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`cursor-pointer flex-1 py-2.5 bg-${confirmColor}-600 hover:bg-${confirmColor}-700 text-white rounded-lg font-bold transition-all`}
            >
              {confirmText}
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

export default ConfirmAlert;
