import React, { useState, useEffect } from "react";
import { PlusCircle, Edit2, XCircle, ClipboardList, Calendar, Layers, CheckCircle, Award, AlertTriangle } from "lucide-react";
import useDataRubrics from '../hooks/useDataRubrics'; // Ajusta la ruta según tu estructura

const RegisterRubric = ({ formData, setFormData, onCancel, isEditing }) => {
  // Hook personalizado para manejar las operaciones de rúbricas
  const { createRubric, updateRubric, loading: rubricLoading, error: rubricError } = useDataRubrics();
  
  const [specialties, setSpecialties] = useState([]);
  const [stages, setStages] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [loadingStages, setLoadingStages] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [errors, setErrors] = useState({});
  const [criteriaCount, setCriteriaCount] = useState(1);

  const levelOptions = [
    { value: "1", label: "Tercer Ciclo" },
    { value: "2", label: "Bachillerato" }
  ];

  const rubricTypeOptions = [
    { value: "1", label: "Escala Estimativa" },
    { value: "2", label: "Rúbrica" }
  ];

  // Cargar especialidades, etapas y niveles al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      setLoadingSpecialties(true);
      setLoadingStages(true);
      setLoadingLevels(true);

      try {
        const token = localStorage.getItem('token') ||
          localStorage.getItem('authToken') ||
          sessionStorage.getItem('token') ||
          sessionStorage.getItem('authToken');

        const headers = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const [specialtiesRes, stagesRes, levelsRes] = await Promise.all([
          fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/specialties', { headers }),
          fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/stages', { headers }),
          fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/levels', { headers })
        ]);

        if (levelsRes.ok) {
          const levelsData = await levelsRes.json();
          console.log('Niveles cargados:', levelsData);
          setLevels(levelsData);
        } else {
          console.error('Error al cargar niveles:', levelsRes.status);
        }

        if (specialtiesRes.ok) {
          const specialtiesData = await specialtiesRes.json();
          setSpecialties(specialtiesData);
        } else {
          console.error('Error al cargar especialidades:', specialtiesRes.status);
        }

        if (stagesRes.ok) {
          const stagesData = await stagesRes.json();
          setStages(stagesData);
        } else {
          console.error('Error al cargar etapas:', stagesRes.status);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setErrors({ general: 'Error al cargar los datos iniciales' });
      } finally {
        setLoadingSpecialties(false);
        setLoadingStages(false);
        setLoadingLevels(false);
      }
    };

    fetchData();
  }, []);

  // Limpiar especialidad y levelId si no es Bachillerato
  useEffect(() => {
    if (formData.level !== "2") {
      if (formData.specialtyId || formData.levelId) {
        setFormData(prev => ({ 
          ...prev, 
          specialtyId: null,
          levelId: null 
        }));
      }
    }
  }, [formData.level, formData.specialtyId, formData.levelId, setFormData]);

  // Calcular ponderación total para Escala Estimativa
  const calculateTotalWeight = () => {
    if (formData.rubricType !== "1") return 0;
    return formData.criteria.reduce((sum, criterion) => {
      return sum + (parseFloat(criterion.criterionWeight) || 0);
    }, 0);
  };

  const totalWeight = calculateTotalWeight();
  const isWeightValid = formData.rubricType === "1" ? totalWeight === 100 : true;

  // Inicializar criterios según la cantidad seleccionada
  const initializeCriteria = (count) => {
    const newCriteria = [];
    for (let i = 0; i < count; i++) {
      if (formData.rubricType === "1") {
        newCriteria.push({
          criterionName: "",
          criterionDescription: "",
          criterionWeight: ""
        });
      } else {
        newCriteria.push({
          criterionName: ""
        });
      }
    }
    setFormData(prev => ({ ...prev, criteria: newCriteria }));
  };

  // Actualizar campo de criterio
  const updateCriterionField = (index, field, value) => {
    const newCriteria = [...formData.criteria];
    newCriteria[index][field] = value;
    setFormData(prev => ({ ...prev, criteria: newCriteria }));
  };

  // Cambiar tipo de rúbrica (reinicia criterios)
  const handleRubricTypeChange = (value) => {
    setFormData(prev => ({
      ...prev,
      rubricType: value,
      criteria: []
    }));
    setCriteriaCount(1);
  };

  // Validación y envío usando el hook
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validaciones básicas
    if (!formData.rubricName || !formData.level || !formData.year || !formData.stageId || !formData.rubricType) {
      setErrors({ general: "Completa todos los campos obligatorios." });
      return;
    }

    if (formData.level === "2" && !formData.specialtyId) {
      setErrors({ general: "Bachillerato requiere una especialidad." });
      return;
    }

    if (formData.level === "2" && !formData.levelId) {
      setErrors({ general: "Bachillerato requiere seleccionar un nivel." });
      return;
    }

    // Validar que tenga al menos 1 criterio
    if (!formData.criteria || formData.criteria.length === 0) {
      setErrors({ general: "Debes agregar al menos un criterio de evaluación." });
      return;
    }

    // Validar que todos los criterios tengan nombre
    const emptyCriteria = formData.criteria.some(c => !c.criterionName?.trim());
    if (emptyCriteria) {
      setErrors({ general: "Todos los criterios deben tener un nombre." });
      return;
    }

    // Validaciones específicas para Escala Estimativa
    if (formData.rubricType === "1") {
      const emptyDescriptions = formData.criteria.some(c => !c.criterionDescription?.trim());
      if (emptyDescriptions) {
        setErrors({ general: "Todos los criterios deben tener una descripción." });
        return;
      }

      const emptyWeights = formData.criteria.some(c => !c.criterionWeight || parseFloat(c.criterionWeight) <= 0);
      if (emptyWeights) {
        setErrors({ general: "Todos los criterios deben tener una ponderación mayor a 0." });
        return;
      }

      if (totalWeight !== 100) {
        setErrors({ general: `La ponderación total debe sumar 100%. Actualmente suma ${totalWeight}%` });
        return;
      }
    }

    // Preparar datos según el modelo del backend
    const dataToSend = {
      rubricName: formData.rubricName,
      level: parseInt(formData.level),
      specialtyId: formData.specialtyId || null,
      levelId: formData.levelId || null,
      year: formData.year.toString(),
      stageId: formData.stageId,
      rubricType: parseInt(formData.rubricType),
      criteria: formData.criteria.map(criterion => {
        if (formData.rubricType === "1") {
          return {
            criterionName: criterion.criterionName,
            criterionDescription: criterion.criterionDescription,
            criterionScore: 0,
            criterionWeight: parseFloat(criterion.criterionWeight)
          };
        }
        return {
          criterionName: criterion.criterionName,
          criterionDescription: "",
          criterionScore: 0,
          criterionWeight: 0
        };
      })
    };

    console.log('Datos a enviar:', dataToSend);

    try {
      let result;
      if (isEditing && formData._id) {
        result = await updateRubric(formData._id, dataToSend);
      } else {
        result = await createRubric(dataToSend);
      }

      if (result) {
        console.log('Rúbrica guardada exitosamente:', result);
        // Resetear formulario
        setFormData({
          rubricName: "",
          level: "",
          levelId: null,
          specialtyId: null,
          year: "",
          stageId: "",
          rubricType: "",
          criteria: []
        });
        
        // Notificar éxito al componente padre si existe callback
        if (onCancel) onCancel();
      }
    } catch (err) {
      console.error('Error al guardar:', err);
      setErrors({ general: rubricError || "Error al guardar la rúbrica." });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
            {isEditing ? <Edit2 className="w-6 h-6 text-white" /> : <PlusCircle className="w-6 h-6 text-white" />}
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              {isEditing ? "Editar Rúbrica" : "Crear Nueva Rúbrica"}
            </h2>
            <p className="text-sm text-gray-500">
              {isEditing ? "Modifica los datos de la rúbrica seleccionada" : "Completa la información para registrar una rúbrica"}
            </p>
          </div>
        </div>
      </div>

      {/* Errores */}
      {(errors.general || rubricError) && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 font-medium">{errors.general || rubricError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos Generales */}
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            <span>Datos Generales</span>
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nombre de la Rúbrica *
              </label>
              <input
                type="text"
                value={formData.rubricName}
                onChange={(e) => setFormData(prev => ({ ...prev, rubricName: e.target.value }))}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                placeholder="Ej: Evaluación Proyecto Final"
                required
                disabled={rubricLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nivel *</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                required
                disabled={rubricLoading}
              >
                <option value="">Seleccionar nivel...</option>
                {levelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Año *</span>
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                placeholder="Ej: 2025"
                min="2020"
                max="2100"
                required
                disabled={rubricLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                <Layers className="w-4 h-4" />
                <span>Etapa *</span>
              </label>
              <select
                value={formData.stageId}
                onChange={(e) => setFormData(prev => ({ ...prev, stageId: e.target.value }))}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                required
                disabled={loadingStages || rubricLoading}
              >
                <option value="">
                  {loadingStages ? 'Cargando etapas...' : 'Seleccionar etapa...'}
                </option>
                {stages.map((stage) => (
                  <option key={stage._id} value={stage._id}>
                    {stage.stageName || stage.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Instrumento *</label>
              <select
                value={formData.rubricType}
                onChange={(e) => handleRubricTypeChange(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                required
                disabled={rubricLoading}
              >
                <option value="">Seleccionar tipo...</option>
                {rubricTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.level === "2" && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    <span>Especialidad *</span>
                  </label>
                  <select
                    value={formData.specialtyId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialtyId: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                    required
                    disabled={loadingSpecialties || rubricLoading}
                  >
                    <option value="">
                      {loadingSpecialties ? 'Cargando especialidades...' : 'Seleccionar especialidad...'}
                    </option>
                    {specialties.map((specialty) => (
                      <option key={specialty._id} value={specialty._id}>
                        {specialty.specialtyName || specialty.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    <span>Nivel de Bachillerato *</span>
                  </label>
                  <select
                    value={formData.levelId || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, levelId: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                    required
                    disabled={loadingLevels || rubricLoading}
                  >
                    <option value="">
                      {loadingLevels ? "Cargando niveles..." : "Seleccionar nivel..."}
                    </option>
                    {levels.map(lvl => (
                      <option key={lvl._id} value={lvl._id}>
                        {lvl.levelName || lvl.name || `Nivel ${lvl._id}`}
                      </option>
                    ))}
                  </select>

                  {!loadingLevels && levels.length === 0 && (
                    <p className="mt-2 text-sm text-amber-600">
                      No se encontraron niveles. Verifica que la API /levels esté funcionando.
                    </p>
                  )}

                  {!loadingLevels && levels.length > 0 && (
                    <p className="mt-2 text-xs text-gray-500">
                      {levels.length} nivel(es) disponible(s)
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Criterios */}
        {formData.rubricType && (
          <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5" />
              <span>Criterios de Evaluación *</span>
            </h3>

            {formData.criteria.length === 0 && (
              <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  ¿Cuántos criterios deseas agregar?
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={criteriaCount}
                    onChange={(e) => setCriteriaCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    disabled={rubricLoading}
                  />
                  <button
                    type="button"
                    onClick={() => initializeCriteria(criteriaCount)}
                    className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={rubricLoading}
                  >
                    Crear Criterios
                  </button>
                </div>
              </div>
            )}

            {formData.criteria.length > 0 && (
              <>
                {formData.rubricType === "1" && (
                  <div className={`mb-4 p-4 rounded-lg border-2 ${isWeightValid
                    ? 'bg-green-50 border-green-200'
                    : 'bg-orange-50 border-orange-200'
                    }`}>
                    <div className="flex items-center gap-2">
                      {isWeightValid ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                      )}
                      <span className={`font-bold ${isWeightValid ? 'text-green-700' : 'text-orange-700'}`}>
                        Ponderación Total: {totalWeight}%
                      </span>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-purple-100">
                        <th className="border-2 border-gray-300 px-4 py-3 text-left text-sm font-bold text-gray-700">#</th>
                        <th className="border-2 border-gray-300 px-4 py-3 text-left text-sm font-bold text-gray-700">
                          Nombre del Criterio *
                        </th>
                        {formData.rubricType === "1" && (
                          <>
                            <th className="border-2 border-gray-300 px-4 py-3 text-left text-sm font-bold text-gray-700">
                              Descripción *
                            </th>
                            <th className="border-2 border-gray-300 px-4 py-3 text-left text-sm font-bold text-gray-700">
                              Ponderación (%) *
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {formData.criteria.map((criterion, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border-2 border-gray-300 px-4 py-2 text-center font-semibold text-gray-600">
                            {index + 1}
                          </td>
                          <td className="border-2 border-gray-300 px-2 py-2">
                            <input
                              type="text"
                              value={criterion.criterionName}
                              onChange={(e) => updateCriterionField(index, "criterionName", e.target.value)}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                              placeholder="Ej: Creatividad"
                              disabled={rubricLoading}
                            />
                          </td>
                          {formData.rubricType === "1" && (
                            <>
                              <td className="border-2 border-gray-300 px-2 py-2">
                                <textarea
                                  value={criterion.criterionDescription}
                                  onChange={(e) => updateCriterionField(index, "criterionDescription", e.target.value)}
                                  className="w-full px-3 py-2 border-2 border-gray-200 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none"
                                  rows="2"
                                  placeholder="Descripción del criterio..."
                                  disabled={rubricLoading}
                                />
                              </td>
                              <td className="border-2 border-gray-300 px-2 py-2">
                                <input
                                  type="number"
                                  value={criterion.criterionWeight}
                                  onChange={(e) => updateCriterionField(index, "criterionWeight", e.target.value)}
                                  className="w-full px-3 py-2 border-2 border-gray-200 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                                  placeholder="0"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  disabled={rubricLoading}
                                />
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, criteria: [] }))}
                  className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={rubricLoading}
                >
                  Reiniciar Criterios
                </button>
              </>
            )}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={rubricLoading}
            className="flex-1 py-4 px-6 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {rubricLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>{isEditing ? "Actualizar Rúbrica" : "Guardar Rúbrica"}</span>
              </>
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={rubricLoading}
              className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle className="w-5 h-5" />
              <span>Cancelar</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RegisterRubric;