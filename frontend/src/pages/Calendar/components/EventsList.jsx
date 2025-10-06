// frontend/src/pages/Calendar/components/EventsList.jsx
import React, { useState } from 'react';
import { Calendar, Clock, Edit2, Trash2, ChevronRight, AlertCircle } from 'lucide-react';

const EventsList = ({ events, onEventClick, onDeleteEvent, isAdmin }) => {
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, upcoming, past

  // Formatear fecha
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Calcular duración
  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Determinar estado del evento
  const getEventStatus = (event) => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (now < start) return 'upcoming';
    if (now > end) return 'past';
    return 'active';
  };

  // Filtrar eventos
  const filteredEvents = events.filter(event => {
    if (filterStatus === 'all') return true;
    return getEventStatus(event) === filterStatus;
  }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  // Estadísticas de filtros
  const stats = {
    all: events.length,
    active: events.filter(e => getEventStatus(e) === 'active').length,
    upcoming: events.filter(e => getEventStatus(e) === 'upcoming').length,
    past: events.filter(e => getEventStatus(e) === 'past').length
  };

  const filterButtons = [
    { key: 'all', label: 'Todos', color: 'blue' },
    { key: 'active', label: 'Activos', color: 'green' },
    { key: 'upcoming', label: 'Próximos', color: 'orange' },
    { key: 'past', label: 'Pasados', color: 'gray' }
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          label: 'En Curso',
          icon: '🟢'
        };
      case 'upcoming':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          label: 'Próximo',
          icon: '🟠'
        };
      case 'past':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          label: 'Finalizado',
          icon: '⚫'
        };
      default:
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          label: 'Evento',
          icon: '🔵'
        };
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Filtros */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {filterButtons.map(filter => (
          <button
            key={filter.key}
            onClick={() => setFilterStatus(filter.key)}
            className={`
              flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm 
              shadow-md transition-all flex-shrink-0
              ${filterStatus === filter.key
                ? `bg-gradient-to-r from-${filter.color}-500 to-${filter.color}-600 text-white scale-105`
                : 'bg-white text-gray-700 hover:shadow-lg border-2 border-gray-200'
              }
            `}
          >
            <span>{filter.label}</span>
            <div className={`px-2 py-0.5 rounded-full text-xs font-black ${
              filterStatus === filter.key
                ? 'bg-white/30 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {stats[filter.key]}
            </div>
          </button>
        ))}
      </div>

      {/* Lista de eventos */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 sm:p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">No hay eventos</h3>
              <p className="text-sm sm:text-base text-gray-600 max-w-md">
                {filterStatus === 'all' 
                  ? 'Aún no hay eventos registrados en el calendario'
                  : `No hay eventos en la categoría "${filterButtons.find(f => f.key === filterStatus)?.label}"`
                }
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredEvents.map((event, index) => {
            const status = getEventStatus(event);
            const statusInfo = getStatusBadge(status);
            const duration = calculateDuration(event.startDate, event.endDate);

            return (
              <div
                key={event._id}
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden animate-fadeIn"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Barra superior colorida */}
                <div 
                  className="h-2"
                  style={{ backgroundColor: event.color || '#3b82f6' }}
                ></div>

                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    
                    {/* Ícono de calendario con fecha */}
                    <div 
                      className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex flex-col items-center justify-center shadow-md"
                      style={{ backgroundColor: event.color || '#3b82f6' }}
                    >
                      <div className="text-white text-xs sm:text-sm font-bold">
                        {new Date(event.startDate).toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}
                      </div>
                      <div className="text-white text-2xl sm:text-3xl font-black">
                        {new Date(event.startDate).getDate()}
                      </div>
                    </div>

                    {/* Información del evento */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg sm:text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                          {event.title}
                        </h3>
                        
                        {/* Badge de estado */}
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border-2 ${statusInfo.color}`}>
                          <span>{statusInfo.icon}</span>
                          <span>{statusInfo.label}</span>
                        </span>
                      </div>

                      {/* Descripción */}
                      {event.description && (
                        <p className="text-sm sm:text-base text-gray-600 mb-3 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      {/* Fechas y duración */}
                      <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium">
                            {formatDate(event.startDate)}
                            {new Date(event.startDate).toDateString() !== new Date(event.endDate).toDateString() && (
                              <> → {formatDate(event.endDate)}</>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium">
                            {duration} {duration === 1 ? 'día' : 'días'}
                          </span>
                        </div>
                      </div>

                      {/* Creado por */}
                      {event.createdBy && (
                        <div className="text-xs text-gray-500">
                          Creado por: <span className="font-semibold">{event.createdBy.name} {event.createdBy.lastName}</span>
                        </div>
                      )}
                    </div>

                    {/* Acciones (solo admin) */}
                    {isAdmin && (
                      <div className="flex sm:flex-col gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => onEventClick(event)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all"
                          title="Editar evento"
                        >
                          <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="hidden xl:inline">Editar</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            if (window.confirm('¿Estás seguro de eliminar este evento?')) {
                              onDeleteEvent(event._id);
                            }
                          }}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all"
                          title="Eliminar evento"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="hidden xl:inline">Eliminar</span>
                        </button>
                      </div>
                    )}

                    {/* Botón ver más (usuarios no admin) */}
                    {!isAdmin && (
                      <button
                        onClick={() => onEventClick(event)}
                        className="self-end sm:self-center flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-xs sm:text-sm transition-all"
                      >
                        <span>Ver más</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
          animation-fill-mode: both;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default EventsList