import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, List, Grid3x3 } from 'lucide-react';
import CalendarGrid from './components/CalendarGrid';
import EventsList from './components/EventsList';
import EventModal from './components/EventModal';
import useEvents from './hooks/useEvents';
import { useAuth } from '../../context/AuthContext';

const Calendar = () => {
  useEffect(() => {
    document.title = "Calendario | STC";
  }, []);

  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    getOccupiedDates
  } = useEvents();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' o 'list'
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  // Navegación de meses
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handlers para eventos
  const handleDateClick = (date) => {
    if (!isAdmin) return; // Solo admins pueden crear eventos
    setSelectedDate(date);
    setEditingEvent(null);
    setShowEventModal(true);
  };

  const handleEventClick = (event) => {
    setEditingEvent(event);
    setSelectedDate(new Date(event.startDate));
    setShowEventModal(true);
  };

  const handleSaveEvent = async (eventData) => {
    if (editingEvent) {
      const result = await updateEvent(editingEvent._id, eventData);
      if (result.success) {
        setShowEventModal(false);
        setEditingEvent(null);
      }
    } else {
      const result = await createEvent(eventData);
      if (result.success) {
        setShowEventModal(false);
      }
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('¿Estás seguro de eliminar este evento?')) {
      const result = await deleteEvent(eventId);
      if (result.success) {
        setShowEventModal(false);
        setEditingEvent(null);
      }
    }
  };

  const handleCloseModal = () => {
    setShowEventModal(false);
    setEditingEvent(null);
    setSelectedDate(null);
  };

  // Obtener nombre del mes
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  // Estadísticas
  const stats = {
    total: events.length,
    active: events.filter(e => {
      const now = new Date();
      return new Date(e.startDate) <= now && new Date(e.endDate) >= now;
    }).length,
    upcoming: events.filter(e => new Date(e.startDate) > new Date()).length,
    past: events.filter(e => new Date(e.endDate) < new Date()).length
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pt-20 lg:pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-2">
                <span>Sistema</span>
                <span>›</span>
                <span className="text-pink-600 font-semibold">Calendario de Eventos</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-pink-500 flex-shrink-0" />
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">
                  Calendario de Eventos
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white border-b border-gray-200 sticky top-0 lg:static z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">

            {/* Navegación de mes */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>

              <div className="flex-1 sm:flex-none text-center">
                <h2 className="text-lg sm:text-xl font-black text-gray-900">
                  {currentMonth} {currentYear}
                </h2>
              </div>

              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>

              <button
                onClick={goToToday}
                className="px-3 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-semibold text-xs sm:text-sm transition-colors"
              >
                Hoy
              </button>
            </div>

            {/* Controles de vista y crear */}
            <div className="flex items-center gap-2">
              {/* Toggle de vista */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-semibold text-xs sm:text-sm transition-all ${viewMode === 'calendar'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Calendario</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-semibold text-xs sm:text-sm transition-all ${viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">Lista</span>
                </button>
              </div>

              {/* Botón crear evento (solo admin) */}
              {isAdmin && (
                <button
                  onClick={() => {
                    setSelectedDate(new Date());
                    setEditingEvent(null);
                    setShowEventModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-bold text-xs sm:text-sm shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nuevo Evento</span>
                  <span className="sm:hidden">Nuevo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 space-y-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-gray-900 font-bold text-base sm:text-lg">Cargando calendario</p>
              <p className="text-gray-500 text-xs sm:text-sm">Un momento por favor...</p>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'calendar' ? (
              <CalendarGrid
                currentDate={currentDate}
                events={events}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
                isAdmin={isAdmin}
              />
            ) : (
              <EventsList
                events={events}
                onEventClick={handleEventClick}
                onDeleteEvent={handleDeleteEvent}
                isAdmin={isAdmin}
              />
            )}
          </>
        )}
      </div>

      {/* Modal de evento */}
      {showEventModal && (
        <EventModal
          isOpen={showEventModal}
          onClose={handleCloseModal}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          selectedDate={selectedDate}
          editingEvent={editingEvent}
          getOccupiedDates={getOccupiedDates}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

export default Calendar;