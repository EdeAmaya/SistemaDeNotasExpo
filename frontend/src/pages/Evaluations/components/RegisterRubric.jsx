import React, { useState, useEffect } from "react";
import { PlusCircle, Edit2, XCircle, ClipboardList, Calendar, Layers, CheckCircle, Award, AlertTriangle, Info, HelpCircle } from "lucide-react";
import useDataRubrics from '../hooks/useDataRubrics';

const RegisterRubric = ({ formData, setFormData, onCancel, isEditing }) => {
  const { createRubric, updateRubric, loading: rubricLoading, error: rubricError } = useDataRubrics();

  const [specialties, setSpecialties] = useState([]);
  const [stages, setStages] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [loadingStages, setLoadingStages] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [errors, setErrors] = useState({});
  const [criteriaCount, setCriteriaCount] = useState(1);
  const [includeDeficiente, setIncludeDeficiente] = useState(false);
  const [showScaleInfo, setShowScaleInfo] = useState(null);

  const levelOptions = [
    { value: "1", label: "Tercer Ciclo" },
    { value: "2", label: "Bachillerato" }
  ];

  const rubricTypeOptions = [
    { value: "1", label: "Escala Estimativa" },
    { value: "2", label: "Rúbrica" }
  ];

  const scaleTypeOptions = [
    {
      value: "1",
      label: "Promedio de puntuación",
      description: "Asigna solo el porcentaje que vale cada criterio. La puntuación se calcula automáticamente según el promedio."
    },
    {
      value: "2",
      label: "Escala de ejecución",
      description: "Define niveles de desempeño estándar: Excelente (10), Bueno (8), Regular (6), Necesita Mejorar (4). Opcionalmente puedes agregar Deficiente (2) para todos los criterios."
    },
    {
      value: "3",
      label: "Desempeño por criterios",
      description: "Personaliza cada nivel de desempeño con descripciones específicas: Excelente (10), Bueno (8), Regular (6), Necesita Mejorar (4), Deficiente (2)."
    }
  ];

  const getDefaultWeights = (scaleType) => {
    const baseWeights = [
      { value: 10, description: null },
      { value: 8, description: null },
      { value: 6, description: null },
      { value: 4, description: null }
    ];

    if (scaleType === "2" && includeDeficiente) {
      baseWeights.push({ value: 2, description: null });
    }

    if (scaleType === "3") {
      baseWeights.push({ value: 2, description: null });
    }

    return baseWeights;
  };

  const toggleDeficiente = () => {
    const newValue = !includeDeficiente;
    setIncludeDeficiente(newValue);

    if (formData.criteria.length > 0 && formData.scaleType === "2") {
      const newCriteria = formData.criteria.map(criterion => {
        const updatedCriterion = { ...criterion };
        if (newValue) {
          if (!updatedCriterion.weights.some(w => w.value === 2)) {
            updatedCriterion.weights.push({ value: 2, description: null });
          }
        } else {
          updatedCriterion.weights = updatedCriterion.weights.filter(w => w.value !== 2);
        }
        return updatedCriterion;
      });
      setFormData(prev => ({ ...prev, criteria: newCriteria }));
    }
  };

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
          fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/specialties', { headers, credentials: 'include' }),
          fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/stages', { headers, credentials: 'include' }),
          fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/levels', { headers, credentials: 'include' })
        ]);

        if (levelsRes.ok) {
          const levelsData = await levelsRes.json();
          setLevels(levelsData);
        }

        if (specialtiesRes.ok) {
          const specialtiesData = await specialtiesRes.json();
          setSpecialties(specialtiesData);
        }

        if (stagesRes.ok) {
          const stagesData = await stagesRes.json();
          setStages(stagesData);
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

  // Cargar criterios existentes al editar
  useEffect(() => {
    if (isEditing && formData.criteria && formData.criteria.length > 0) {
      if (formData.scaleType === "2") {
        const hasDeficiente = formData.criteria.some(criterion => 
          criterion.weights?.some(w => w.value === 2)
        );
        setIncludeDeficiente(hasDeficiente);
      }
    }
  }, [isEditing, formData.criteria, formData.scaleType]);

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

  const calculateTotalWeight = () => {
    if (formData.rubricType !== "1") return 0;
    return formData.criteria.reduce((sum, criterion) => {
      return sum + (parseFloat(criterion.criterionWeight) || 0);
    }, 0);
  };

  const totalWeight = calculateTotalWeight();
  const isWeightValid = formData.rubricType === "1" ? totalWeight === 100 : true;

  const initializeCriteria = (count) => {
    const newCriteria = [];
    for (let i = 0; i < count; i++) {
      if (formData.rubricType === "1") {
        const criterion = {
          criterionName: "",
          criterionDescription: "",
          criterionWeight: ""
        };

        if (formData.scaleType === "2" || formData.scaleType === "3") {
          criterion.weights = getDefaultWeights(formData.scaleType);
        }

        newCriteria.push(criterion);
      } else {
        newCriteria.push({
          criterionName: ""
        });
      }
    }
    setFormData(prev => ({ ...prev, criteria: newCriteria }));

    if (formData.scaleType === "2") {
      setIncludeDeficiente(false);
    }
  };

  const updateCriterionField = (index, field, value) => {
    const newCriteria = [...formData.criteria];
    newCriteria[index][field] = value;
    setFormData(prev => ({ ...prev, criteria: newCriteria }));
  };

  const updateWeightDescription = (criterionIndex, weightIndex, description) => {
    const newCriteria = [...formData.criteria];
    if (!newCriteria[criterionIndex].weights) {
      newCriteria[criterionIndex].weights = getDefaultWeights(formData.scaleType);
    }
    newCriteria[criterionIndex].weights[weightIndex].description = description;
    setFormData(prev => ({ ...prev, criteria: newCriteria }));
  };

  const handleRubricTypeChange = (value) => {
    setFormData(prev => ({
      ...prev,
      rubricType: value,
      scaleType: value === "1" ? "" : null,
      criteria: []
    }));
    setCriteriaCount(1);
    setIncludeDeficiente(false);
  };

  const handleScaleTypeChange = (value) => {
    setFormData(prev => ({
      ...prev,
      scaleType: value,
      criteria: []
    }));
    setCriteriaCount(1);
    setIncludeDeficiente(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.rubricName || !formData.level || !formData.year || !formData.stageId || !formData.rubricType) {
      setErrors({ general: "Completa todos los campos obligatorios." });
      return;
    }

    if (formData.rubricType === "1" && !formData.scaleType) {
      setErrors({ general: "Debes seleccionar un tipo de escala para la Escala Estimativa." });
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

    if (!formData.criteria || formData.criteria.length === 0) {
      setErrors({ general: "Debes agregar al menos un criterio de evaluación." });
      return;
    }

    const emptyCriteria = formData.criteria.some(c => !c.criterionName?.trim());
    if (emptyCriteria) {
      setErrors({ general: "Todos los criterios deben tener un nombre." });
      return;
    }

    if (formData.rubricType === "1") {
      const emptyWeights = formData.criteria.some(c => !c.criterionWeight || parseFloat(c.criterionWeight) <= 0);
      if (emptyWeights) {
        setErrors({ general: "Todos los criterios deben tener una ponderación mayor a 0." });
        return;
      }

      if (totalWeight !== 100) {
        setErrors({ general: `La ponderación total debe sumar 100%. Actualmente suma ${totalWeight}%` });
        return;
      }

      if (formData.scaleType === "3") {
        const missingDescriptions = formData.criteria.some(criterion =>
          criterion.weights?.some(w => !w.description?.trim())
        );
        if (missingDescriptions) {
          setErrors({ general: "Para 'Desempeño por criterios' todas las ponderaciones deben tener descripción." });
          return;
        }
      }
    }

    const dataToSend = {
      rubricName: formData.rubricName,
      level: parseInt(formData.level),
      specialtyId: formData.specialtyId || null,
      levelId: formData.levelId || null,
      year: formData.year.toString(),
      stageId: formData.stageId,
      rubricType: parseInt(formData.rubricType),
      scaleType: formData.rubricType === "1" ? parseInt(formData.scaleType) : null,
      criteria: formData.criteria.map(criterion => {
        const baseCriterion = {
          criterionName: criterion.criterionName,
          criterionDescription: criterion.criterionDescription || "",
        };

        if (formData.rubricType === "1") {
          baseCriterion.criterionWeight = parseFloat(criterion.criterionWeight);

          if (formData.scaleType === "2" || formData.scaleType === "3") {
            baseCriterion.weights = criterion.weights || getDefaultWeights(formData.scaleType);
          }
        }

        return baseCriterion;
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
        setFormData({
          rubricName: "",
          level: "",
          levelId: null,
          specialtyId: null,
          year: "",
          stageId: "",
          rubricType: "",
          scaleType: "",
          criteria: []
        });

        if (onCancel) onCancel();
      }
    } catch (err) {
      console.error('Error al guardar:', err);
      setErrors({ general: rubricError || "Error al guardar la rúbrica." });
    }
  };

  const InfoTooltip = ({ content, id }) => (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShowScaleInfo(id)}
        onMouseLeave={() => setShowScaleInfo(null)}
        className="cursor-pointer ml-2 text-blue-500 hover:text-blue-700 transition-colors"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      {showScaleInfo === id && (
        <div className="absolute z-50 left-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
          <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
          {content}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
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

      {(errors.general || rubricError) && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 font-medium">{errors.general || rubricError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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

            {formData.rubricType === "1" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Escala *</label>
                <div className="space-y-2">
                  {scaleTypeOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${formData.scaleType === option.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                      onClick={() => !rubricLoading && handleScaleTypeChange(option.value)}
                    >
                      <input
                        type="radio"
                        name="scaleType"
                        value={option.value}
                        checked={formData.scaleType === option.value}
                        onChange={() => { }}
                        className="mr-3"
                        disabled={rubricLoading}
                      />
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900">{option.label}</span>
                          <InfoTooltip content={option.description} id={option.value} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {formData.scaleType === "2" && (
                  <div className="mt-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeDeficiente}
                        onChange={toggleDeficiente}
                        className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        disabled={rubricLoading}
                      />
                      <div>
                        <span className="text-sm font-bold text-gray-900">
                          Incluir nivel "Deficiente (2)" para todos los criterios
                        </span>
                        <p className="text-xs text-gray-600 mt-0.5">
                          Activa esta opción si necesitas evaluar el nivel más bajo de desempeño
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            )}

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
                </div>
              </>
            )}
          </div>
        </div>

        {formData.rubricType && (formData.rubricType === "2" || (formData.rubricType === "1" && formData.scaleType)) && (
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
                    className="cursor-pointer px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

                {formData.scaleType === "2" && (
                  <div className="mb-6 bg-white rounded-lg border-2 border-purple-200 p-4">
                    <h4 className="text-sm font-bold text-gray-700 mb-3">Configuración de Niveles de Desempeño</h4>
                    <div className={`grid ${includeDeficiente ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'} gap-3`}>
                      <div className="bg-purple-50 p-3 rounded-lg border-2 border-purple-200 text-center">
                        <div className="font-bold text-purple-800 mb-1">Excelente</div>
                        <div className="text-2xl font-black text-purple-600">10</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg border-2 border-purple-200 text-center">
                        <div className="font-bold text-purple-800 mb-1">Bueno</div>
                        <div className="text-2xl font-black text-purple-600">8</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg border-2 border-purple-200 text-center">
                        <div className="font-bold text-purple-800 mb-1">Regular</div>
                        <div className="text-2xl font-black text-purple-600">6</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg border-2 border-purple-200 text-center">
                        <div className="font-bold text-purple-800 mb-1">Necesita Mejorar</div>
                        <div className="text-2xl font-black text-purple-600">4</div>
                      </div>
                      {includeDeficiente && (
                        <div className="bg-purple-50 p-3 rounded-lg border-2 border-purple-200 text-center animate-fadeIn">
                          <div className="font-bold text-purple-800 mb-1">Deficiente</div>
                          <div className="text-2xl font-black text-purple-600">2</div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-3">
                      Esta configuración se aplicará a todos los criterios
                    </p>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-purple-100">
                        <th className="border-2 border-gray-300 px-4 py-3 text-left text-sm font-bold text-gray-700 w-12">#</th>
                        <th className="border-2 border-gray-300 px-4 py-3 text-left text-sm font-bold text-gray-700">
                          Nombre del Criterio *
                        </th>
                        <th className="border-2 border-gray-300 px-4 py-3 text-left text-sm font-bold text-gray-700">
                          Descripción {formData.scaleType === "3" ? "" : "(Opcional)"}
                        </th>
                        {formData.rubricType === "1" && (
                          <th className="border-2 border-gray-300 px-4 py-3 text-left text-sm font-bold text-gray-700 w-32">
                            Ponderación (%) *
                          </th>
                        )}
                        {formData.scaleType === "3" && (
                          <th className="border-2 border-gray-300 px-4 py-3 text-left text-sm font-bold text-gray-700 w-16">
                            Niveles *
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {formData.criteria.map((criterion, index) => (
                        <React.Fragment key={index}>
                          <tr className="hover:bg-gray-50">
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
                            {formData.rubricType === "1" && (
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
                            )}
                            {formData.scaleType === "3" && (
                              <td className="border-2 border-gray-300 px-2 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const element = document.getElementById(`levels-${index}`);
                                    if (element) {
                                      element.classList.toggle('hidden');
                                    }
                                  }}
                                  className="cursor-pointer px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded font-semibold transition-colors"
                                  disabled={rubricLoading}
                                >
                                  Editar
                                </button>
                              </td>
                            )}
                          </tr>

                          {formData.scaleType === "3" && (
                            <tr id={`levels-${index}`} className="hidden">
                              <td colSpan={formData.rubricType === "1" ? 5 : 4} className="border-2 border-gray-300 p-4 bg-gray-50">
                                <div className="space-y-3">
                                  <h5 className="text-sm font-bold text-gray-700 mb-2">
                                    Descripciones de Niveles de Desempeño - Criterio #{index + 1}
                                  </h5>
                                  {criterion.weights?.map((weight, weightIndex) => {
                                    const labels = ['Excelente', 'Bueno', 'Regular', 'Necesita Mejorar', 'Deficiente'];
                                    const label = labels[weightIndex];

                                    return (
                                      <div key={weightIndex} className="bg-purple-50 p-3 rounded-lg border-2 border-purple-200">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="font-bold text-purple-800">{label}</span>
                                          <span className="text-xl font-black text-purple-600">{weight.value}</span>
                                        </div>
                                        <textarea
                                          value={weight.description || ''}
                                          onChange={(e) => updateWeightDescription(index, weightIndex, e.target.value)}
                                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none bg-white text-sm"
                                          rows="2"
                                          placeholder={`Describe qué significa "${label}" para este criterio...`}
                                          disabled={rubricLoading}
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, criteria: [] }));
                    setIncludeDeficiente(false);
                  }}
                  className="cursor-pointer mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={rubricLoading}
                >
                  Reiniciar Criterios
                </button>
              </>
            )}
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={rubricLoading}
            className="cursor-pointer flex-1 py-4 px-6 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
              className="cursor-pointer px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle className="w-5 h-5" />
              <span>Cancelar</span>
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
        <div className="flex gap-3">
          <Info className="w-6 h-6 text-purple-600 flex-shrink-0" />
          <div className="flex-1 text-sm text-gray-700">
            <p className="font-bold text-gray-900 mb-1">Tipos de Escala Estimativa</p>
            <ul className="space-y-1">
              <li>• <strong>Promedio:</strong> Solo defines el porcentaje de cada criterio</li>
              <li>• <strong>Escala de ejecución:</strong> Niveles estándar aplicados a todos los criterios (10, 8, 6, 4, opcionalmente 2)</li>
              <li>• <strong>Desempeño por criterios:</strong> Personaliza descripciones para cada nivel de cada criterio (10, 8, 6, 4, 2)</li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RegisterRubric;