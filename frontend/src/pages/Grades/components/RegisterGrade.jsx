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

  // Cargar rúbricas
  useEffect(() => {
    const fetchRubrics = async () => {
      setLoadingRubrics(true);
      try {
        const response = await fetch('http://localhost:4000/api/rubrics');
        if (response.ok) {
          const data = await response.json();
          setRubrics(data);
        }
      } catch (error) {
        console.error('Error al cargar rúbricas:', error);
      } finally {
        setLoadingRubrics(false);
      }
    };
    fetchRubrics();
  }, []);

  // Cargar proyectos cuando se selecciona una rúbrica
  useEffect(() => {
    const fetchProjects = async () => {
      if (!selectedRubric) {
        setProjects([]);
        return;
      }

      setLoadingProjects(true);
      try {
        const response = await fetch('http://localhost:4000/api/projects');
        if (response.ok) {
          const allProjects = await response.json();

          const filteredProjects = allProjects.filter(project => {
            if (selectedRubric.level === 1) {
              return true;
            }

            if (selectedRubric.level === 2) {
              const rubricLevelId = selectedRubric.levelId?._id || selectedRubric.levelId;
              const projectIdLevel = project.idLevel?._id || project.idLevel;
              const levelIdMatch = projectIdLevel === rubricLevelId;

              if (!levelIdMatch) return false;

              let specialtyMatch = true;
              if (selectedRubric.specialtyId) {
                const rubricSpecialtyId = selectedRubric.specialtyId._id || selectedRubric.specialtyId;
                const projectSpecialtyId = project.selectedSpecialty?._id || project.selectedSpecialty;
                specialtyMatch = projectSpecialtyId === rubricSpecialtyId;
              }

              return levelIdMatch && specialtyMatch;
            }

            return false;
          });

          setProjects(filteredProjects);
        }
      } catch (error) {
        console.error('Error al cargar proyectos:', error);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [selectedRubric]);

  // Manejar selección de rúbrica
  const handleRubricChange = (rubricId) => {
    const rubric = rubrics.find(r => r._id === rubricId);
    setSelectedRubric(rubric);
    setFormData(prev => ({ ...prev, rubricId, projectId: null }));

    if (rubric?.criteria) {
      console.log('🔍 Criterios de la rúbrica:', rubric.criteria.map(c => ({
        _id: c._id,
        name: c.criterionName
      })));

      setCriteriaScores(rubric.criteria.map(criterio => ({
        criterioId: criterio._id,
        criterionName: criterio.criterionName,
        criterionWeight: criterio.criterionWeight || 0,
        puntajeObtenido: 0,
        comentario: ''
      })));
    }
  };

  // Actualizar puntaje de un criterio
  const updateCriterionScore = (index, value) => {
    let numericValue = parseFloat(value);

    // Evitar NaN o valores vacíos
    if (isNaN(numericValue)) numericValue = 0;

    // Limitar el rango entre 0 y 10
    if (numericValue < 0) numericValue = 0;
    if (numericValue > 10) numericValue = 10;

    const newScores = [...criteriaScores];
    newScores[index].puntajeObtenido = numericValue;
    setCriteriaScores(newScores);
  };

  // Calcular nota total según tipo de instrumento
  const calculateTotalScore = () => {
    if (!selectedRubric || criteriaScores.length === 0) return 0;

    if (selectedRubric.rubricType === 1) {
      // Escala Estimativa - Suma ponderada
      return criteriaScores.reduce((total, criterio) => {
        const score = criterio.puntajeObtenido;
        const weight = criterio.criterionWeight;
        return total + (score * weight / 100);
      }, 0);
    } else {
      // Rúbrica - Promedio simple
      const sum = criteriaScores.reduce((total, criterio) => {
        return total + criterio.puntajeObtenido;
      }, 0);
      return sum / criteriaScores.length;
    }
  };

  const totalScore = calculateTotalScore();

  // Validar que las ponderaciones sumen 100% para Escala Estimativa
  const validateWeights = () => {
    if (selectedRubric?.rubricType === 1) {
      const totalWeight = criteriaScores.reduce((sum, c) => sum + c.criterionWeight, 0);
      return Math.abs(totalWeight - 100) < 0.01;
    }
    return true;
  };

  const isWeightValid = validateWeights();

  // Validación y envío
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.rubricId) {
      setErrors({ general: "Debes seleccionar una rúbrica." });
      return;
    }

    if (!formData.projectId) {
      setErrors({ general: "Debes seleccionar un proyecto." });
      return;
    }

    if (criteriaScores.length === 0) {
      setErrors({ general: "La rúbrica seleccionada no tiene criterios." });
      return;
    }

    if (selectedRubric?.rubricType === 1 && !isWeightValid) {
      setErrors({ general: "Las ponderaciones de los criterios deben sumar 100%." });
      return;
    }

    const dataToSend = {
      projectId: formData.projectId,
      rubricId: formData.rubricId,
      criteriosEvaluados: criteriaScores.map(c => ({
        criterioId: c.criterioId,
        puntajeObtenido: c.puntajeObtenido,
        comentario: c.comentario || ''
      })),
      notaFinal: parseFloat(totalScore.toFixed(2)),
      tipoCalculo: selectedRubric.rubricType === 1 ? 'ponderado' : 'promedio'
    };

    console.log('📤 Datos de evaluación a enviar:', dataToSend);
    console.log('🔍 Criterios siendo enviados:', dataToSend.criteriosEvaluados.map(c => ({
      criterioId: c.criterioId,
      puntaje: c.puntajeObtenido
    })));

    try {
      let result;
      if (isEditing && formData._id) {
        result = await updateEvaluation(formData._id, dataToSend);
      } else {
        result = await createEvaluation(dataToSend);
      }

      if (result) {
        console.log('Evaluación guardada exitosamente:', result);

        // Resetear formulario
        setFormData({
          rubricId: null,
          projectId: null
        });
        setSelectedRubric(null);
        setCriteriaScores([]);

        if (onCancel) onCancel();
      }
    } catch (err) {
      console.error("Error al guardar:", err);
      setErrors({ general: evaluationError || err.message || "Error al guardar la evaluación." });
    }
  };

  const getLevelName = (level) => {
    if (level === 1) return 'Tercer Ciclo';
    if (level === 2) return 'Bachillerato';
    return 'No definido';
  };

  const getRubricTypeName = (type) => {
    if (type === 1) return 'Escala Estimativa';
    if (type === 2) return 'Rúbrica';
    return 'No definido';
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
            {isEditing ? <Edit2 className="w-6 h-6 text-white" /> : <PlusCircle className="w-6 h-6 text-white" />}
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              {isEditing ? "Editar Evaluación" : "Asignar Nueva Evaluación"}
            </h2>
            <p className="text-sm text-gray-500">
              Selecciona una rúbrica y proyecto para asignar calificación
            </p>
          </div>
        </div>
      </div>

      {/* Errores */}
      {(errors.general || evaluationError) && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 font-medium">{errors.general || evaluationError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selección de Rúbrica */}
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            <span>Seleccionar Rúbrica *</span>
          </h3>

          <select
            value={formData.rubricId || ''}
            onChange={(e) => handleRubricChange(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all"
            required
            disabled={loadingRubrics || evaluationLoading}
          >
            <option value="">
              {loadingRubrics ? 'Cargando rúbricas...' : 'Seleccionar rúbrica...'}
            </option>
            {rubrics.map((rubric) => (
              <option key={rubric._id} value={rubric._id}>
                {rubric.rubricName} - {getLevelName(rubric.level)} - {getRubricTypeName(rubric.rubricType)}
                {rubric.levelId?.levelName && ` - ${rubric.levelId.levelName}`}
              </option>
            ))}
          </select>

          {/* Info de la rúbrica seleccionada */}
          {selectedRubric && (
            <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <div className="text-gray-500 font-semibold mb-1">Nivel</div>
                  <div className="text-gray-800 font-bold">{getLevelName(selectedRubric.level)}</div>
                </div>
                <div>
                  <div className="text-gray-500 font-semibold mb-1">Tipo</div>
                  <div className="text-gray-800 font-bold">{getRubricTypeName(selectedRubric.rubricType)}</div>
                </div>
                <div>
                  <div className="text-gray-500 font-semibold mb-1">Año</div>
                  <div className="text-gray-800 font-bold">{selectedRubric.year}</div>
                </div>
                <div>
                  <div className="text-gray-500 font-semibold mb-1">Criterios</div>
                  <div className="text-gray-800 font-bold">{selectedRubric.criteria?.length || 0}</div>
                </div>
                {selectedRubric.level === 2 && selectedRubric.levelId && (
                  <div>
                    <div className="text-gray-500 font-semibold mb-1">Año Bachillerato</div>
                    <div className="text-gray-800 font-bold">{selectedRubric.levelId.levelName || selectedRubric.levelId.name}</div>
                  </div>
                )}
                {selectedRubric.specialtyId && (
                  <div>
                    <div className="text-gray-500 font-semibold mb-1">Especialidad</div>
                    <div className="text-gray-800 font-bold">{selectedRubric.specialtyId.specialtyName}</div>
                  </div>
                )}
              </div>

              {/* Advertencia de ponderaciones para Escala Estimativa */}
              {selectedRubric.rubricType === 1 && (
                <div className={`mt-3 p-3 rounded-lg border-2 ${isWeightValid ? 'bg-green-50 border-green-300' : 'bg-orange-50 border-orange-300'
                  }`}>
                  <div className="flex items-center gap-2">
                    {isWeightValid ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    )}
                    <span className={`text-sm font-bold ${isWeightValid ? 'text-green-700' : 'text-orange-700'
                      }`}>
                      Ponderación Total: {criteriaScores.reduce((sum, c) => sum + c.criterionWeight, 0).toFixed(1)}%
                      {!isWeightValid && ' (debe sumar 100%)'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selección de Proyecto */}
        {selectedRubric && (
          <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span>Seleccionar Proyecto *</span>
            </h3>

            <select
              value={formData.projectId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all"
              required
              disabled={loadingProjects || evaluationLoading}
            >
              <option value="">
                {loadingProjects ? 'Cargando proyectos...' :
                  projects.length === 0 ? 'No hay proyectos disponibles para esta rúbrica' :
                    'Seleccionar proyecto...'}
              </option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.projectName} - Equipo {project.teamNumber}
                </option>
              ))}
            </select>

            {projects.length === 0 && selectedRubric && !loadingProjects && (
              <div className="mt-4 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                <div className="flex items-start gap-2 text-orange-700">
                  <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">
                      No hay proyectos que coincidan con esta rúbrica.
                    </p>
                    <p className="text-sm">
                      Los proyectos deben coincidir en:
                    </p>
                    <ul className="text-sm list-disc list-inside mt-1 space-y-1">
                      {selectedRubric.level === 1 && (
                        <li>Nivel: {getLevelName(selectedRubric.level)}</li>
                      )}
                      {selectedRubric.level === 2 && (
                        <>
                          {selectedRubric.levelId && (
                            <li>Año: {selectedRubric.levelId.levelName || selectedRubric.levelId.name} (campo idLevel en proyecto)</li>
                          )}
                          {selectedRubric.specialtyId && (
                            <li>Especialidad: {selectedRubric.specialtyId.specialtyName} (campo selectedSpecialty en proyecto)</li>
                          )}
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Criterios de Evaluación */}
        {selectedRubric && formData.projectId && criteriaScores.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span>Asignar Calificaciones</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-yellow-100">
                    <th className="border-2 border-gray-300 px-4 py-3 text-left text-sm font-bold text-gray-700">
                      #
                    </th>
                    <th className="border-2 border-gray-300 px-4 py-3 text-left text-sm font-bold text-gray-700">
                      Criterio
                    </th>
                    {selectedRubric.rubricType === 1 && (
                      <th className="border-2 border-gray-300 px-4 py-3 text-center text-sm font-bold text-gray-700">
                        Ponderación (%)
                      </th>
                    )}
                    <th className="border-2 border-gray-300 px-4 py-3 text-center text-sm font-bold text-gray-700">
                      Puntaje Obtenido * (0-10)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {criteriaScores.map((criterio, index) => (
                    <tr key={criterio.criterioId} className="hover:bg-gray-50">
                      <td className="border-2 border-gray-300 px-4 py-2 text-center font-semibold text-gray-600">
                        {index + 1}
                      </td>
                      <td className="border-2 border-gray-300 px-4 py-2">
                        <div className="font-medium text-gray-800">{criterio.criterionName}</div>
                      </td>
                      {selectedRubric.rubricType === 1 && (
                        <td className="border-2 border-gray-300 px-4 py-2 text-center font-bold text-purple-600">
                          {criterio.criterionWeight.toFixed(1)}%
                        </td>
                      )}
                      <td className="border-2 border-gray-300 px-2 py-2">
                        <input
                          type="number"
                          value={criterio.puntajeObtenido}
                          onChange={(e) => updateCriterionScore(index, e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 text-center font-bold"
                          min="0"
                          max="10"
                          step="0.1"
                          required
                          disabled={evaluationLoading}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Nota Total */}
            <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calculator className="w-6 h-6 text-green-600" />
                    <span className="text-xl font-bold text-gray-800">Nota Final</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedRubric.rubricType === 1
                      ? "Calculada con ponderación: Σ(nota × peso%)"
                      : `Promedio de ${criteriaScores.length} criterios`}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-black text-green-600">
                    {totalScore.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">sobre 10.0</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        {formData.projectId && criteriaScores.length > 0 && (
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
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
                  <span>{isEditing ? "Actualizar Evaluación" : "Guardar Evaluación"}</span>
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
      </form>
    </div>
  );
};

export default RegisterGrade;