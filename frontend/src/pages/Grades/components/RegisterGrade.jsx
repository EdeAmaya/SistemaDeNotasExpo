import React, { useState, useEffect } from "react";
import { PlusCircle, Edit2, XCircle, ClipboardList, Award, CheckCircle, BookOpen, AlertTriangle, Calculator } from "lucide-react";
import useDataEvaluations from '../hooks/useDataEvaluations';

const RegisterGrade = ({ formData, setFormData, onCancel, isEditing }) => {
  const { createEvaluation, updateEvaluation, loading: evaluationLoading, error: evaluationError } = useDataEvaluations();

  const [rubrics, setRubrics] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedRubric, setSelectedRubric] = useState(null);
  const [loadingRubrics, setLoadingRubrics] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [errors, setErrors] = useState({});
  const [criteriaScores, setCriteriaScores] = useState([]);

  // Obtener opciones de calificación según el tipo de escala y el criterio
  const getScoreOptions = (criterion, criterionWeight) => {
    // Tipo 1: Promedio de puntuación - calificación manual de 0 a 10
    if (selectedRubric?.scaleType === 1) {
      return null; // Se usará input numérico
    }

    // Tipo 2: Escala de ejecución - niveles estándar (10, 8, 6, 4, opcionalmente 2)
    if (selectedRubric?.scaleType === 2) {
      const weights = criterion.weights || [];
      return weights.map(w => ({
        label: w.value === 10 ? 'Excelente' :
               w.value === 8 ? 'Bueno' :
               w.value === 6 ? 'Regular' :
               w.value === 4 ? 'Necesita Mejorar' :
               w.value === 2 ? 'Deficiente' : `Nivel ${w.value}`,
        value: (w.value * criterionWeight) / 100,
        baseValue: w.value,
        color: w.value === 10 ? 'green' :
               w.value === 8 ? 'blue' :
               w.value === 6 ? 'yellow' :
               w.value === 4 ? 'orange' : 'red'
      }));
    }

    // Tipo 3: Desempeño por criterios - niveles personalizados con descripciones
    if (selectedRubric?.scaleType === 3) {
      const weights = criterion.weights || [];
      return weights.map(w => ({
        label: w.value === 10 ? 'Excelente' :
               w.value === 8 ? 'Bueno' :
               w.value === 6 ? 'Regular' :
               w.value === 4 ? 'Necesita Mejorar' :
               w.value === 2 ? 'Deficiente' : `Nivel ${w.value}`,
        value: (w.value * criterionWeight) / 100,
        baseValue: w.value,
        description: w.description,
        color: w.value === 10 ? 'green' :
               w.value === 8 ? 'blue' :
               w.value === 6 ? 'yellow' :
               w.value === 4 ? 'orange' : 'red'
      }));
    }

    return [];
  };

  useEffect(() => {
    const fetchRubrics = async () => {
      setLoadingRubrics(true);
      try {
        const response = await fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/rubrics', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setRubrics(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoadingRubrics(false);
      }
    };
    fetchRubrics();
  }, []);

  // Proyectos en base a la rúbrica seleccionada
   useEffect(() => {
    const fetchProjects = async () => {
      if (!selectedRubric) {
        setProjects([]);
        return;
      }
      setLoadingProjects(true);
      try {
        const response = await fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/projects', { credentials: 'include' });
        if (response.ok) {
          const allProjects = await response.json();
          const filteredProjects = allProjects.filter(project => {
            const projectLevelName = project.idLevel?.levelName || '';
            
            // Si la rúbrica es de Tercer Ciclo (level = 1)
            if (selectedRubric.level === 1) {
              // Solo mostrar proyectos de Séptimo, Octavo o Noveno
              const tercerCicloGrades = ['Séptimo', 'Octavo', 'Noveno'];
              return tercerCicloGrades.includes(projectLevelName);
            }
            
            // Si la rúbrica es de Bachillerato (level = 2)
            if (selectedRubric.level === 2) {
              const rubricLevelId = selectedRubric.levelId?._id || selectedRubric.levelId;
              const projectIdLevel = project.idLevel?._id || project.idLevel;
              return projectIdLevel === rubricLevelId;
            }
            
            return false;
          });
          setProjects(filteredProjects);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, [selectedRubric]);

  const handleRubricChange = (rubricId) => {
    const rubric = rubrics.find(r => r._id === rubricId);
    setSelectedRubric(rubric);
    setFormData(prev => ({ ...prev, rubricId, projectId: null }));
    if (rubric?.criteria) {
      setCriteriaScores(rubric.criteria.map(criterio => ({
        criterioId: criterio._id,
        criterionName: criterio.criterionName,
        criterionDescription: criterio.criterionDescription,
        criterionWeight: criterio.criterionWeight || 0,
        weights: criterio.weights || [],
        puntajeObtenido: 0,
        nivelSeleccionado: '',
        baseValueSelected: null
      })));
    }
  };

  const updateCriterionScore = (index, selectedLevel, scoreValue, baseValue = null) => {
    const newScores = [...criteriaScores];
    newScores[index].puntajeObtenido = scoreValue;
    newScores[index].nivelSeleccionado = selectedLevel;
    newScores[index].baseValueSelected = baseValue;
    setCriteriaScores(newScores);
  };

  const calculateTotalScore = () => {
    if (!selectedRubric || criteriaScores.length === 0) return 0;
    if (selectedRubric.rubricType === 1) {
      // Para Escala Estimativa, siempre es suma ponderada
      return criteriaScores.reduce((total, criterio) => total + criterio.puntajeObtenido, 0);
    } else {
      // Para Rúbrica tradicional, es promedio
      const sum = criteriaScores.reduce((total, criterio) => total + criterio.puntajeObtenido, 0);
      return sum / criteriaScores.length;
    }
  };

  const totalScore = calculateTotalScore();

  const validateWeights = () => {
    if (selectedRubric?.rubricType === 1) {
      const totalWeight = criteriaScores.reduce((sum, c) => sum + c.criterionWeight, 0);
      return Math.abs(totalWeight - 100) < 0.01;
    }
    return true;
  };

  const isWeightValid = validateWeights();

  const allCriteriaScored = () => {
    return criteriaScores.every(c => {
      // Para tipo 1 (Promedio), el usuario ingresa manualmente de 0 a 10
      if (selectedRubric?.scaleType === 1) {
        return c.puntajeObtenido > 0;
      }
      // Para tipos 2 y 3, debe seleccionar un nivel
      return c.nivelSeleccionado !== '';
    });
  };

  const handleSubmit = async () => {
    setErrors({});
    if (!formData.rubricId || !formData.projectId) {
      setErrors({ general: "Selecciona rúbrica y proyecto" });
      return;
    }
    if (!allCriteriaScored()) {
      setErrors({ general: "Asigna calificación a todos los criterios" });
      return;
    }
    if (selectedRubric?.rubricType === 1 && !isWeightValid) {
      setErrors({ general: "Ponderaciones deben sumar 100%" });
      return;
    }

    const dataToSend = {
      projectId: formData.projectId,
      rubricId: formData.rubricId,
      criteriosEvaluados: criteriaScores.map(c => ({
        criterioId: c.criterioId,
        puntajeObtenido: c.puntajeObtenido,
        comentario: ''
      })),
      notaFinal: parseFloat(totalScore.toFixed(2)),
      tipoCalculo: selectedRubric.rubricType === 1 ? 'ponderado' : 'promedio'
    };

    try {
      let result;
      if (isEditing && formData._id) {
        result = await updateEvaluation(formData._id, dataToSend);
      } else {
        result = await createEvaluation(dataToSend);
      }
      if (result) {
        setFormData({ rubricId: null, projectId: null });
        setSelectedRubric(null);
        setCriteriaScores([]);
        if (onCancel) onCancel();
      }
    } catch (err) {
      setErrors({ general: evaluationError || "Error al guardar" });
    }
  };

  const getLevelName = (level) => level === 1 ? 'Tercer Ciclo' : level === 2 ? 'Bachillerato' : 'No definido';
  const getRubricTypeName = (type) => type === 1 ? 'Escala Estimativa' : type === 2 ? 'Rúbrica' : 'No definido';

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
            {isEditing ? <Edit2 className="w-6 h-6 text-white" /> : <PlusCircle className="w-6 h-6 text-white" />}
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              {isEditing ? "Editar Evaluación" : "Asignar Nueva Evaluación"}
            </h2>
            <p className="text-sm text-gray-500">Selecciona rúbrica y proyecto</p>
          </div>
        </div>
      </div>

      {(errors.general || evaluationError) && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 font-medium">{errors.general || evaluationError}</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            <span>Seleccionar Rúbrica</span>
          </h3>
          <select
            value={formData.rubricId || ''}
            onChange={(e) => handleRubricChange(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all"
            disabled={loadingRubrics || evaluationLoading}
          >
            <option value="">{loadingRubrics ? 'Cargando...' : 'Seleccionar...'}</option>
            {rubrics.map((rubric) => (
              <option key={rubric._id} value={rubric._id}>
                {rubric.rubricName} - {getLevelName(rubric.level)} - {getRubricTypeName(rubric.rubricType)}
              </option>
            ))}
          </select>

          {selectedRubric && (
            <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <div className="text-gray-500 font-semibold">Tipo</div>
                  <div className="text-gray-800 font-bold">{getRubricTypeName(selectedRubric.rubricType)}</div>
                </div>
                <div>
                  <div className="text-gray-500 font-semibold">Criterios</div>
                  <div className="text-gray-800 font-bold">{selectedRubric.criteria?.length || 0}</div>
                </div>
                {selectedRubric.rubricType === 1 && (
                  <>
                    <div>
                      <div className="text-gray-500 font-semibold">Tipo de Escala</div>
                      <div className="text-gray-800 font-bold">
                        {selectedRubric.scaleType === 1 ? 'Promedio' : 
                         selectedRubric.scaleType === 2 ? 'Ejecución' : 
                         selectedRubric.scaleType === 3 ? 'Por Criterios' : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 font-semibold">Cálculo</div>
                      <div className="text-gray-800 font-bold">Ponderado</div>
                    </div>
                  </>
                )}
              </div>
              {selectedRubric.rubricType === 1 && (
                <div className={`mt-3 p-3 rounded-lg border-2 ${isWeightValid ? 'bg-green-50 border-green-300' : 'bg-orange-50 border-orange-300'}`}>
                  <div className="flex items-center gap-2">
                    {isWeightValid ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertTriangle className="w-5 h-5 text-orange-600" />}
                    <span className={`text-sm font-bold ${isWeightValid ? 'text-green-700' : 'text-orange-700'}`}>
                      Ponderación: {criteriaScores.reduce((sum, c) => sum + c.criterionWeight, 0).toFixed(1)}%
                      {!isWeightValid && ' (debe ser 100%)'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {selectedRubric && (
          <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span>Seleccionar Proyecto</span>
            </h3>
            <select
              value={formData.projectId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all"
              disabled={loadingProjects || evaluationLoading}
            >
              <option value="">{loadingProjects ? 'Cargando...' : projects.length === 0 ? 'Sin proyectos' : 'Seleccionar...'}</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.projectName} - Equipo {project.teamNumber}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedRubric && formData.projectId && criteriaScores.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span>Asignar Calificaciones</span>
            </h3>

            <div className="space-y-3">
              {criteriaScores.map((criterio, index) => {
                const criterioOriginal = selectedRubric.criteria.find(c => c._id === criterio.criterioId);
                const scoreOptions = getScoreOptions(criterioOriginal, criterio.criterionWeight);

                return (
                  <div key={criterio.criterioId} className="bg-white rounded-lg p-4 border-2 border-gray-200">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">#{index + 1}</span>
                          <span className="font-bold text-gray-800">{criterio.criterionName}</span>
                        </div>
                        {criterio.criterionDescription && (
                          <div className="text-sm text-gray-600 mt-1 mb-2 pl-2 border-l-2 border-gray-300">
                            {criterio.criterionDescription}
                          </div>
                        )}
                        {selectedRubric.rubricType === 1 && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm text-purple-600 font-semibold">
                              Ponderación: {criterio.criterionWeight}%
                            </span>
                            {selectedRubric.scaleType === 1 && (
                              <span className="text-xs text-gray-500">
                                (0 a 10 puntos)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {criterio.puntajeObtenido > 0 && (
                        <div className="text-right">
                          <div className="text-2xl font-black text-green-600">
                            {criterio.puntajeObtenido.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">puntos</div>
                        </div>
                      )}
                    </div>

                    {/* Tipo 1: Promedio - Input manual */}
                    {selectedRubric.scaleType === 1 && (
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-gray-50">
                        <label className="block text-xs font-semibold text-gray-600 mb-2">
                          Calificación (0 a 10)
                        </label>
                        <input
                          type="number"
                          value={criterio.puntajeObtenido || ''}
                          onChange={(e) => {
                            let value = parseFloat(e.target.value);
                            if (isNaN(value) || value < 0) value = 0;
                            if (value > 10) value = 10;
                            // Calcular el puntaje ponderado
                            const weightedScore = (value * criterio.criterionWeight) / 100;
                            updateCriterionScore(index, value.toString(), weightedScore, value);
                          }}
                          className="w-full px-4 py-3 text-center font-bold text-xl border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 bg-white"
                          placeholder="0.00"
                          min="0"
                          max="10"
                          step="0.01"
                          disabled={evaluationLoading}
                        />
                        <div className="mt-2 text-xs text-center text-gray-500">
                          Puntaje ponderado: {criterio.puntajeObtenido.toFixed(2)} puntos
                        </div>
                      </div>
                    )}

                    {/* Tipo 2 y 3: Botones de niveles */}
                    {(selectedRubric.scaleType === 2 || selectedRubric.scaleType === 3) && scoreOptions && (
                      <div className="space-y-3">
                        <div className={`grid ${scoreOptions.length === 5 ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'} gap-2`}>
                          {scoreOptions.map((option) => {
                            const colorClasses = {
                              green: {
                                active: 'bg-green-500 border-green-600 text-white shadow-lg',
                                inactive: 'bg-green-50 border-green-300 text-green-700 hover:border-green-400 hover:bg-green-100'
                              },
                              blue: {
                                active: 'bg-blue-500 border-blue-600 text-white shadow-lg',
                                inactive: 'bg-blue-50 border-blue-300 text-blue-700 hover:border-blue-400 hover:bg-blue-100'
                              },
                              yellow: {
                                active: 'bg-yellow-500 border-yellow-600 text-white shadow-lg',
                                inactive: 'bg-yellow-50 border-yellow-300 text-yellow-700 hover:border-yellow-400 hover:bg-yellow-100'
                              },
                              orange: {
                                active: 'bg-orange-500 border-orange-600 text-white shadow-lg',
                                inactive: 'bg-orange-50 border-orange-300 text-orange-700 hover:border-orange-400 hover:bg-orange-100'
                              },
                              red: {
                                active: 'bg-red-500 border-red-600 text-white shadow-lg',
                                inactive: 'bg-red-50 border-red-300 text-red-700 hover:border-red-400 hover:bg-red-100'
                              }
                            };

                            const isSelected = criterio.baseValueSelected === option.baseValue;
                            const colorClass = colorClasses[option.color] || colorClasses.blue;

                            return (
                              <button
                                key={option.baseValue}
                                type="button"
                                onClick={() => updateCriterionScore(index, option.label, option.value, option.baseValue)}
                                className={`p-3 rounded-lg border-2 font-bold transition-all ${
                                  isSelected ? colorClass.active + ' scale-105' : colorClass.inactive
                                }`}
                                disabled={evaluationLoading}
                              >
                                <div className="text-xs mb-1">{option.label}</div>
                                <div className="text-lg font-black">{option.baseValue}</div>
                                <div className="text-[10px] mt-1 opacity-75">
                                  {option.value.toFixed(2)}pts
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Mostrar descripción del nivel seleccionado (solo tipo 3) */}
                        {selectedRubric.scaleType === 3 && criterio.nivelSeleccionado && (
                          <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-xs font-bold text-blue-800 mb-1">
                                  {criterio.nivelSeleccionado}
                                </div>
                                <div className="text-xs text-gray-700">
                                  {scoreOptions.find(opt => opt.label === criterio.nivelSeleccionado)?.description || 'Sin descripción'}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Para Rúbrica tradicional (rubricType === 2) */}
                    {selectedRubric.rubricType === 2 && (
                      <div className="border-2 border-gray-300 rounded-lg p-2 bg-white">
                        <input
                          type="number"
                          value={criterio.puntajeObtenido}
                          onChange={(e) => {
                            let value = parseFloat(e.target.value);
                            if (isNaN(value)) value = 0;
                            if (value < 0) value = 0;
                            if (value > 10) value = 10;
                            updateCriterionScore(index, '', value);
                          }}
                          className="w-full px-3 py-2 text-center font-bold text-lg focus:outline-none"
                          placeholder="0.00"
                          min="0"
                          max="10"
                          step="0.01"
                          disabled={evaluationLoading}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calculator className="w-6 h-6 text-green-600" />
                    <span className="text-xl font-bold text-gray-800">Nota Final</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedRubric.rubricType === 1 ? "Suma ponderada" : `Promedio de ${criteriaScores.length} criterios`}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-black text-green-600">{totalScore.toFixed(2)}</div>
                  <div className="text-sm text-gray-500 mt-1">sobre 10.0</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {formData.projectId && criteriaScores.length > 0 && (
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={evaluationLoading}
              className="flex-1 py-4 px-6 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {evaluationLoading ? (
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
                  <span>{isEditing ? "Actualizar" : "Guardar"}</span>
                </>
              )}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={evaluationLoading}
                className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-5 h-5" />
                <span>Cancelar</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterGrade;