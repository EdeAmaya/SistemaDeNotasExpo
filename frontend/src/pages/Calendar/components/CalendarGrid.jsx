// frontend/src/pages/Calendar/components/CalendarGrid.jsx
import React from 'react';

const CalendarGrid = ({ currentDate, events, onDateClick, onEventClick, isAdmin }) => {
  
  // Generar días del mes
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0);
    
    // Día de la semana del primer día (0 = Domingo, 1 = Lunes, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Días del mes anterior (para rellenar)
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }
    
    // Días del mes actual
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true
      });
    }
    
    // Días del mes siguiente (para completar la última semana)
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  // Verificar si una fecha es hoy
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Obtener eventos para una fecha específica
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      
      // Normalizar fechas para comparar solo día/mes/año
      eventStart.setHours(0, 0, 0, 0);
      eventEnd.setHours(23, 59, 59, 999);
      const checkDate = new Date(date);
      checkDate.setHours(12, 0, 0, 0);
      
      return checkDate >= eventStart && checkDate <= eventEnd;
    });
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      
      {/* Header de días de la semana */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-3 text-center"
          >
            <span className="text-xs sm:text-sm font-bold text-gray-700">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDate(day.date);
          const isTodayDate = isToday(day.date);
          
          return (
            <div
              key={index}
              onClick={() => day.isCurrentMonth && isAdmin && onDateClick(day.date)}
              className={`
                min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 
                ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${day.isCurrentMonth && isAdmin ? 'cursor-pointer hover:bg-blue-50' : ''}
                transition-colors relative
              `}
            >
              {/* Número del día */}
              <div className="flex items-center justify-between mb-1">
                <span className={`
                  text-xs sm:text-sm font-bold
                  ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                  ${isTodayDate ? 'bg-blue-600 text-white w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center' : ''}
                `}>
                  {day.date.getDate()}
                </span>
              </div>

              {/* Eventos del día */}
              <div className="space-y-0.5 sm:space-y-1">
                {dayEvents.slice(0, 3).map((event, eventIndex) => (
                  <div
                    key={event._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className="text-[8px] sm:text-xs px-1 sm:px-2 py-0.5 rounded cursor-pointer hover:opacity-80 transition-opacity truncate font-semibold text-white"
                    style={{ backgroundColor: event.color || '#3b82f6' }}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                
                {/* Indicador de más eventos */}
                {dayEvents.length > 3 && (
                  <div className="text-[8px] sm:text-xs text-gray-600 font-bold px-1 sm:px-2">
                    +{dayEvents.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      {!isAdmin && (
        <div className="bg-gray-50 p-3 sm:p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <span className="font-semibold">ℹ️</span>
            <span>Haz clic en un evento para ver más detalles</span>
          </div>
        </div>
      )}
      
      {isAdmin && (
        <div className="bg-blue-50 p-3 sm:p-4 border-t border-blue-200">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-700">
            <span className="font-semibold">💡</span>
            <span>Haz clic en una fecha para crear un evento o en un evento existente para editarlo</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarGrid;