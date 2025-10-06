// frontend/src/pages/Calendar/components/EventModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Type, AlignLeft, Palette, Save, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const EventModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  selectedDate, 
  editingEvent,
  getOccupiedDates,
  isAdmin 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    description: '',
    color: '#3b82f6'
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [occupiedDates, setOccupiedDates] = useState([]);
  const [startPickerMonth, setStartPickerMonth] = useState(new Date());
  const [endPickerMonth, setEndPickerMonth] = useState(new Date());
  const [errors, setErrors] = useState({});

  // Colores predefinidos
  const colorOptions = [
    { value: '#3b82f6', label: 'Azul' },
    { value: '#10b981', label: 'Verde' },
    { value: '#f59e0b', label: 'Naranja' },
    { value: '#ef4444', label: 'Rojo' },
    { value: '#8b5cf6', label: 'Morado' },
    { value: '#ec4899', label: 'Rosa' },
    { value: '#06b6d4', label: 'Cyan' },
    { value: '#84cc16', label: 'Lima' }
  ];

  // Inicializar formulario
  useEffect(() => {
    if (editingEvent) {
      const startDateObj = new Date(editingEvent.startDate);
      const endDateObj = new Date(editingEvent.endDate);
      
      const startDateStr = new Date(startDateObj.getTime() - startDateObj.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0];
      const endDateStr = new Date(endDateObj.getTime() - endDateObj.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0];
      
      setFormData({
        title: editingEvent.title,
        startDate: startDateStr,
        endDate: endDateStr,
        description: editingEvent.description || '',
        color: editingEvent.color || '#3b82f6'
      });
      setStartPickerMonth(new Date(editingEvent.startDate));
      setEndPickerMonth(new Date(editingEvent.startDate));
    } else if (selectedDate) {
      const dateObj = new Date(selectedDate);
      const dateStr = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0];
      
      setFormData({
        title: '',
        startDate: dateStr,
        endDate: dateStr,
        description: '',
        color: '#3b82f6'
      });
      setStartPickerMonth(selectedDate);
      setEndPickerMonth(selectedDate);
    }
  }, [editingEvent, selectedDate]);

  // Cargar fechas ocupadas cuando se abre cualquier picker
  useEffect(() => {
    if (showStartDatePicker) {
      loadOccupiedDatesForPicker(startPickerMonth);
    }
  }, [showStartDatePicker, startPickerMonth]);

  useEffect(() => {
    if (showEndDatePicker) {
      loadOccupiedDatesForPicker(endPickerMonth);
    }
  }, [showEndDatePicker, endPickerMonth]);

  const loadOccupiedDatesForPicker = async (pickerMonth) => {
    try {
      const year = pickerMonth.getFullYear();
      const month = pickerMonth.getMonth();
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0);

      const occupied = await getOccupiedDates(startOfMonth, endOfMonth);
      setOccupiedDates(occupied || []);
    } catch (error) {
      console.error('Error cargando fechas ocupadas:', error);
      setOccupiedDates([]);
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'La fecha de fin es requerida';
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = 'La fecha de fin debe ser posterior a la de inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Asegurarse de que las fechas estén en formato ISO correcto
    const eventData = {
      title: formData.title.trim(),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      description: formData.description.trim(),
      color: formData.color
    };

    console.log('Enviando datos del evento:', eventData); // Debug
    onSave(eventData);
  };

  // Generar días para el picker
  const generatePickerDays = (pickerMonth) => {
    const year = pickerMonth.getFullYear();
    const month = pickerMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true
      });
    }
    
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const isDateOccupied = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return occupiedDates.some(d => d.date === dateStr);
  };

  const isDateSelected = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return dateStr === formData.startDate || dateStr === formData.endDate;
  };

  const isDateInRange = (date) => {
    if (!formData.startDate || !formData.endDate) return false;
    
    const dateStr = date.toISOString().split('T')[0];
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const checkDate = new Date(dateStr);
    
    return checkDate > startDate && checkDate < endDate;
  };

  const handleStartDateSelect = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, startDate: dateStr }));
    setErrors({ ...errors, startDate: '' });
    setShowStartDatePicker(false);
    
    // Si la fecha de fin es anterior a la nueva fecha de inicio, actualizarla
    if (formData.endDate) {
      const endDate = new Date(formData.endDate + 'T00:00:00');
      const selectedDate = new Date(dateStr + 'T00:00:00');
      
      if (endDate < selectedDate) {
        setFormData(prev => ({ ...prev, startDate: dateStr, endDate: dateStr }));
      }
    }
  };

  const handleEndDateSelect = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    if (!formData.startDate) {
      setErrors({ ...errors, endDate: 'Primero selecciona una fecha de inicio' });
      return;
    }
    
    const startDate = new Date(formData.startDate + 'T00:00:00');
    const selectedDate = new Date(dateStr + 'T00:00:00');
    
    if (selectedDate < startDate) {
      setErrors({ ...errors, endDate: 'La fecha de fin debe ser posterior a la de inicio' });
      return;
    }
    
    setFormData(prev => ({ ...prev, endDate: dateStr }));
    setErrors({ ...errors, endDate: '' });
    setShowEndDatePicker(false);
  };

  const goToPreviousMonthStart = () => {
    setStartPickerMonth(new Date(startPickerMonth.getFullYear(), startPickerMonth.getMonth() - 1, 1));
  };

  const goToNextMonthStart = () => {
    setStartPickerMonth(new Date(startPickerMonth.getFullYear(), startPickerMonth.getMonth() + 1, 1));
  };

  const goToPreviousMonthEnd = () => {
    setEndPickerMonth(new Date(endPickerMonth.getFullYear(), endPickerMonth.getMonth() - 1, 1));
  };

  const goToNextMonthEnd = () => {
    setEndPickerMonth(new Date(endPickerMonth.getFullYear(), endPickerMonth.getMonth() + 1, 1));
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {isAdmin ? 'Completa la información del evento' : 'Detalles del evento'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Contenido */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Título */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  <span>Título del Evento *</span>
                </div>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium ${
                  errors.title ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                }`}
                placeholder="Ej: Exposición de Proyectos"
                disabled={!isAdmin}
                required
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fecha de inicio */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Fecha de Inicio *</span>
                  </div>
                </label>
                {isAdmin ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.startDate ? new Date(formData.startDate + 'T00:00:00').toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      }) : ''}
                      onClick={() => setShowStartDatePicker(!showStartDatePicker)}
                      className={`w-full px-4 py-3 bg-white border-2 rounded-lg cursor-pointer focus:ring-4 focus:ring-blue-100 transition-all ${
                        errors.startDate ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                      }`}
                      placeholder="Seleccionar fecha"
                      readOnly
                      required
                    />
                    
                    {/* Mini Calendario Picker - INICIO */}
                    {showStartDatePicker && (
                      <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 p-4 z-10 w-80">
                        <div className="flex items-center justify-between mb-3">
                          <button
                            type="button"
                            onClick={goToPreviousMonthStart}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <div className="font-bold text-gray-900">
                            {monthNames[startPickerMonth.getMonth()]} {startPickerMonth.getFullYear()}
                          </div>
                          <button
                            type="button"
                            onClick={goToNextMonthStart}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {weekDays.map((day, idx) => (
                            <div key={idx} className="text-center text-xs font-bold text-gray-600 p-1">
                              {day}
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {generatePickerDays(startPickerMonth).map((day, idx) => {
                            const occupied = isDateOccupied(day.date);
                            const selected = formData.startDate === day.date.toISOString().split('T')[0];

                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => day.isCurrentMonth && handleStartDateSelect(day.date)}
                                disabled={!day.isCurrentMonth}
                                className={`
                                  p-2 text-xs font-semibold rounded-lg transition-all
                                  ${!day.isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : ''}
                                  ${selected ? 'bg-blue-600 text-white' : ''}
                                  ${occupied && !selected ? 'bg-red-50 text-red-600' : ''}
                                  ${day.isCurrentMonth && !selected && !occupied 
                                    ? 'hover:bg-gray-100 text-gray-900' 
                                    : ''
                                  }
                                `}
                              >
                                {day.date.getDate()}
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-4 h-4 bg-blue-600 rounded"></div>
                            <span className="text-gray-600">Seleccionado</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
                            <span className="text-gray-600">Ocupado</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={formData.startDate ? new Date(formData.startDate + 'T00:00:00').toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    }) : ''}
                    className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg"
                    disabled
                  />
                )}
                {errors.startDate && (
                  <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>
                )}
              </div>

              {/* Fecha de fin */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Fecha de Fin *</span>
                  </div>
                </label>
                {isAdmin ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.endDate ? new Date(formData.endDate + 'T00:00:00').toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      }) : ''}
                      onClick={() => setShowEndDatePicker(!showEndDatePicker)}
                      className={`w-full px-4 py-3 bg-white border-2 rounded-lg cursor-pointer focus:ring-4 focus:ring-blue-100 transition-all ${
                        errors.endDate ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                      }`}
                      placeholder="Seleccionar fecha"
                      readOnly
                      required
                    />
                    
                    {/* Mini Calendario Picker */}
                    {showEndDatePicker && (
                      <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 p-4 z-10 w-80">
                        {/* Navegación del picker */}
                        <div className="flex items-center justify-between mb-3">
                          <button
                            type="button"
                            onClick={goToPreviousMonthEnd}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <div className="font-bold text-gray-900">
                            {monthNames[endPickerMonth.getMonth()]} {endPickerMonth.getFullYear()}
                          </div>
                          <button
                            type="button"
                            onClick={goToNextMonthEnd}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Días de la semana */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {weekDays.map((day, idx) => (
                            <div key={idx} className="text-center text-xs font-bold text-gray-600 p-1">
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* Grid de días */}
                        <div className="grid grid-cols-7 gap-1">
                          {generatePickerDays(endPickerMonth).map((day, idx) => {
                            const occupied = isDateOccupied(day.date);
                            const selected = isDateSelected(day.date);
                            const inRange = isDateInRange(day.date);
                            const isPastStart = day.date < new Date(formData.startDate);

                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => day.isCurrentMonth && !isPastStart && handleEndDateSelect(day.date)}
                                disabled={!day.isCurrentMonth || isPastStart}
                                className={`
                                  p-2 text-xs font-semibold rounded-lg transition-all
                                  ${!day.isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : ''}
                                  ${isPastStart ? 'text-gray-300 cursor-not-allowed bg-gray-50' : ''}
                                  ${selected ? 'bg-blue-600 text-white' : ''}
                                  ${inRange && !selected ? 'bg-blue-100 text-blue-600' : ''}
                                  ${occupied && !selected && !isPastStart ? 'bg-red-50 text-red-600' : ''}
                                  ${day.isCurrentMonth && !selected && !inRange && !occupied && !isPastStart 
                                    ? 'hover:bg-gray-100 text-gray-900' 
                                    : ''
                                  }
                                `}
                              >
                                {day.date.getDate()}
                              </button>
                            );
                          })}
                        </div>

                        {/* Leyenda */}
                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-4 h-4 bg-blue-600 rounded"></div>
                            <span className="text-gray-600">Seleccionado</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-4 h-4 bg-blue-100 rounded"></div>
                            <span className="text-gray-600">Rango</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
                            <span className="text-gray-600">Ocupado</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={formData.endDate ? new Date(formData.endDate + 'T00:00:00').toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    }) : ''}
                    className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg"
                    disabled
                  />
                )}
                {errors.endDate && (
                  <p className="mt-1 text-xs text-red-600">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <AlignLeft className="w-4 h-4" />
                  <span>Descripción (Opcional)</span>
                </div>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium resize-none"
                placeholder="Añade detalles adicionales sobre el evento..."
                rows="3"
                disabled={!isAdmin}
                maxLength={500}
              />
              <div className="mt-1 text-xs text-gray-500 text-right">
                {formData.description.length}/500 caracteres
              </div>
            </div>

            {/* Color */}
            {isAdmin && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    <span>Color del Evento</span>
                  </div>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`
                        relative h-12 rounded-lg transition-all transform hover:scale-110
                        ${formData.color === color.value ? 'ring-4 ring-offset-2 ring-gray-400 scale-110' : ''}
                      `}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    >
                      {formData.color === color.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-gray-900 rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Vista previa de duración */}
            {formData.startDate && formData.endDate && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-blue-700">
                  <Clock className="w-5 h-5" />
                  <div className="font-bold">
                    Duración: {
                      Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1
                    } {
                      Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1 === 1 
                        ? 'día' 
                        : 'días'
                    }
                  </div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200">
              {/* Botón eliminar (solo para edición) */}
              {isAdmin && editingEvent && (
                <button
                  type="button"
                  onClick={() => onDelete(editingEvent._id)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Eliminar Evento</span>
                </button>
              )}

              {/* Espaciador */}
              <div className="flex-1"></div>

              {/* Botón cancelar */}
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
              >
                {isAdmin ? 'Cancelar' : 'Cerrar'}
              </button>

              {/* Botón guardar (solo admin) */}
              {isAdmin && (
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  <Save className="w-5 h-5" />
                  <span>{editingEvent ? 'Actualizar Evento' : 'Crear Evento'}</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventModal;