import React, { useState, useEffect } from "react";
import { PlusCircle, Edit2, XCircle, ClipboardList, Award, CheckCircle, BookOpen, AlertTriangle, Calculator } from "lucide-react";

const RegisterGrade = ({ formData, setFormData, onSave, onCancel, isEditing }) => {
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
          
          // Filtrar proyectos que coincidan con nivel y especialidad de la rúbrica
          const filteredProjects = allProjects.filter(project => {
            const levelMatch = project.level === selectedRubric.level;
            
            // Si la rúbrica tiene especialidad, el proyecto también debe coincidir
            if (selectedRubric.specialtyId) {
              const specialtyMatch = project.specialtyId?._id === selectedRubric.specialtyId._id ||
                                    project.specialtyId === selectedRubric.specialtyId._id;
              return levelMatch && specialtyMatch;
            }
            
            return levelMatch;
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
    
    // Inicializar scores de criterios
    if (rubric?.criteria) {
      setCriteriaScores(rubric.criteria.map(c => ({
        criterionId: c._id,
        criterionName: c.criterionName,
        criterionWeight: c.criterionWeight,
        criterionScore: c.criterionScore,
        puntajeObtenido: 0
      })));
    }
  };

  // Actualizar puntaje de un criterio
  const updateCriterionScore = (index, value) => {
    const newScores = [...criteriaScores];
    newScores[index].puntajeObtenido = parseFloat(value) || 0;
    setCriteriaScores(newScores);
  };

  // Calcular nota total
  const calculateTotalScore = () => {
    if (selectedRubric?.rubricType === 1) {
      // Escala Estimativa - suma ponderada
      return criteriaScores.reduce((total, criterio) => {
        return total + (criterio.puntajeObtenido * criterio.criterionWeight / 100);
      }, 0);
    } else {
      // Rúbrica - suma simple
      return criteriaScores.reduce((total, criterio) => {
        return total + criterio.puntajeObtenido;
      }, 0);
    }
  };

  const totalScore = calculateTotalScore();

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

    const dataToSend = {
      projectId: formData.projectId,
      rubricId: formData.rubricId,
      criteriosEvaluados: criteriaScores.map(c => ({
        criterionId: c.criterionId,
        criterionName: c.criterionName,
        puntajeObtenido: c.puntajeObtenido
      }))
    };

    console.log('📤 Datos de evaluación a enviar:', dataToSend);

    try {
      await onSave(dataToSend);
    } catch (err) {
      console.error('❌ Error al guardar:', err);
      setErrors({ general: err.message || "Error al guardar la evaluación." });
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
      {errors.general && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 font-medium">{errors.general}</p>
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
            disabled={loadingRubrics}
          >
            <option value="">
              {loadingRubrics ? 'Cargando rúbricas...' : 'Seleccionar rúbrica...'}
            </option>
            {rubrics.map((rubric) => (
              <option key={rubric._id} value={rubric._id}>
                {rubric.rubricName} - {getLevelName(rubric.level)} - {getRubricTypeName(rubric.rubricType)}
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
              </div>
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
              onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value })
              )}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all"
              required
              disabled={loadingProjects}
            >
              <option value="">
                {loadingProjects ? 'Cargando proyectos...' : 
                 projects.length === 0 ? 'No hay proyectos disponibles para esta rúbrica' :
                 'Seleccionar proyecto...'}
              </option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.projectName} - {project.studentId?.name || 'Sin estudiante'}
                </option>
              ))}
            </select>

            {projects.length === 0 && selectedRubric && !loadingProjects && (
              <div className="mt-4 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-orange-700">
                  <AlertTriangle className="w-5 h-5" />
                  <p className="font-medium">
                    No hay proyectos que coincidan con el nivel y especialidad de esta rúbrica.
                  </p>
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
                      Puntaje Máximo
                    </th>
                    <th className="border-2 border-gray-300 px-4 py-3 text-center text-sm font-bold text-gray-700">
                      Puntaje Obtenido *
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {criteriaScores.map((criterio, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border-2 border-gray-300 px-4 py-2 text-center font-semibold text-gray-600">
                        {index + 1}
                      </td>
                      <td className="border-2 border-gray-300 px-4 py-2">
                        <div className="font-medium text-gray-800">{criterio.criterionName}</div>
                      </td>
                      {selectedRubric.rubricType === 1 && (
                        <td className="border-2 border-gray-300 px-4 py-2 text-center font-bold text-gray-700">
                          {criterio.criterionWeight}%
                        </td>
                      )}
                      <td className="border-2 border-gray-300 px-4 py-2 text-center font-bold text-gray-700">
                        {criterio.criterionScore}
                      </td>
                      <td className="border-2 border-gray-300 px-2 py-2">
                        <input
                          type="number"
                          value={criterio.puntajeObtenido}
                          onChange={(e) => updateCriterionScore(index, e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 text-center font-bold"
                          min="0"
                          max={criterio.criterionScore}
                          step="0.1"
                          required
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Nota Total */}
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="w-6 h-6 text-green-600" />
                  <span className="text-lg font-bold text-gray-800">Nota Total:</span>
                </div>
                <div className="text-3xl font-black text-green-700">
                  {totalScore.toFixed(2)}
                </div>
              </div>
              {selectedRubric.rubricType === 1 && (
                <p className="text-xs text-gray-600 mt-2">
                  * Calculado con ponderaciones: Σ (Puntaje × Peso/100)
                </p>
              )}
            </div>
          </div>
        )}

        {/* Botones */}
        {formData.projectId && criteriaScores.length > 0 && (
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 py-4 px-6 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
            >
              <CheckCircle className="w-5 h-5" />
              <span>{isEditing ? "Actualizar Evaluación" : "Guardar Evaluación"}</span>
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
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