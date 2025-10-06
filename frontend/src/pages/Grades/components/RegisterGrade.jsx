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

  // Definir niveles de calificación por ponderación
  const getScoreOptions = (weight) => {
    if (weight === 20) {
      return [
        { label: 'Excelente', value: 2.0, color: 'green' },
        { label: 'Bueno', value: 1.6, color: 'blue' },
        { label: 'Regular', value: 1.0, color: 'yellow' },
        { label: 'Deficiente', value: 0.8, color: 'red' }
      ];
    } else if (weight === 15) {
      return [
        { label: 'Excelente', value: 1.5, color: 'green' },
        { label: 'Bueno', value: 1.2, color: 'blue' },
        { label: 'Regular', value: 0.9, color: 'yellow' },
        { label: 'Deficiente', value: 0.6, color: 'red' }
      ];
    } else if (weight === 10) {
      return [
        { label: 'Excelente', value: 1.0, color: 'green' },
        { label: 'Bueno', value: 0.8, color: 'blue' },
        { label: 'Regular', value: 0.6, color: 'yellow' },
        { label: 'Deficiente', value: 0.4, color: 'red' }
      ];
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
        criterionWeight: criterio.criterionWeight || 0,
        puntajeObtenido: 0,
        nivelSeleccionado: ''
      })));
    }
  };

  const updateCriterionScore = (index, selectedLevel, scoreValue) => {
    const newScores = [...criteriaScores];
    newScores[index].puntajeObtenido = scoreValue;
    newScores[index].nivelSeleccionado = selectedLevel;
    setCriteriaScores(newScores);
  };

  const calculateTotalScore = () => {
    if (!selectedRubric || criteriaScores.length === 0) return 0;
    if (selectedRubric.rubricType === 1) {
      return criteriaScores.reduce((total, criterio) => total + criterio.puntajeObtenido, 0);
    } else {
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
    if (selectedRubric?.rubricType === 1) {
      return criteriaScores.every(c => c.nivelSeleccionado !== '');
    }
    return criteriaScores.every(c => c.puntajeObtenido > 0);
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
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-gray-500 font-semibold">Tipo</div>
                  <div className="text-gray-800 font-bold">{getRubricTypeName(selectedRubric.rubricType)}</div>
                </div>
                <div>
                  <div className="text-gray-500 font-semibold">Criterios</div>
                  <div className="text-gray-800 font-bold">{selectedRubric.criteria?.length || 0}</div>
                </div>
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
                const scoreOptions = getScoreOptions(criterio.criterionWeight);
                const hasValidOptions = scoreOptions.length > 0;

                // Obtener descripción del criterio original
                const criterioOriginal = selectedRubric.criteria.find(c => c._id === criterio.criterioId);
                const descripcion = criterioOriginal?.criterionDescription || '';

                return (
                  <div key={criterio.criterioId} className="bg-white rounded-lg p-4 border-2 border-gray-200">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">#{index + 1}</span>
                          <span className="font-bold text-gray-800">{criterio.criterionName}</span>
                        </div>
                        {descripcion && (
                          <div className="text-sm text-gray-600 mt-1 mb-2">
                            {descripcion}
                          </div>
                        )}
                        {selectedRubric.rubricType === 1 && (
                          <div className="text-sm text-purple-600 font-semibold">
                            Ponderación: {criterio.criterionWeight}%
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

                    {selectedRubric.rubricType === 1 ? (
                      hasValidOptions ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {scoreOptions.map((option) => (
                            <button
                              key={option.label}
                              type="button"
                              onClick={() => updateCriterionScore(index, option.label, option.value)}
                              className={`p-3 rounded-lg border-2 font-bold transition-all ${
                                criterio.nivelSeleccionado === option.label
                                  ? 'bg-yellow-500 border-yellow-600 text-white shadow-lg scale-105'
                                  : 'bg-white border-gray-300 text-gray-700 hover:border-yellow-400 hover:bg-yellow-50'
                              }`}
                              disabled={evaluationLoading}
                            >
                              <div className="text-sm mb-1">{option.label}</div>
                              <div className="text-lg">{option.value}</div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 bg-orange-50 border-2 border-orange-300 rounded-lg text-orange-700 text-sm">
                          <AlertTriangle className="w-4 h-4 inline mr-2" />
                          Ponderación {criterio.criterionWeight}% no soportada. Use: 20%, 15% o 10%
                        </div>
                      )
                    ) : (
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
                          placeholder="0.00000"
                          min="0"
                          max="10"
                          step="0.00001"
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