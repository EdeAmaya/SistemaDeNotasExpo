import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, BookOpen, ClipboardList, Award, Layers, Info, FileText } from 'lucide-react';
import ListRubrics from './components/ListRubrics';
import RegisterRubric from './components/RegisterRubric';
import useDataRubrics from './hooks/useDataRubrics';

const Evaluations = () => {
  // Cambiar el título del documento al montar el componente
  useEffect(() => {
    document.title = "Evaluaciones | STC";
  }, []);

  const [activeTab, setActiveTab] = useState('list');
  
  const {
    rubrics,
    loading,
    error,
    getRubrics,
    createRubric,
    updateRubric,
    deleteRubric,
    clearError
  } = useDataRubrics();

  // Estados para el formulario
  const [formData, setFormData] = useState({
    id: null,
    rubricName: '',
    level: '',
    specialtyId: null,
    year: new Date().getFullYear(),
    stageId: '',
    rubricType: '',
    criteria: []
  });

  // Cargar rúbricas al montar el componente
  useEffect(() => {
    getRubrics();
  }, [getRubrics]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'list') {
      clearForm();
    }
  };

  const clearForm = () => {
    setFormData({
      id: null,
      rubricName: '',
      level: '',
      specialtyId: null,
      year: new Date().getFullYear(),
      stageId: '',
      rubricType: '',
      criteria: []
    });
  };

  const handleEdit = (rubric) => {
    setFormData({
      id: rubric._id,
      rubricName: rubric.rubricName,
      level: rubric.level,
      specialtyId: rubric.specialtyId?._id || null,
      year: rubric.year,
      stageId: rubric.stageId?._id || rubric.stageId,
      rubricType: rubric.rubricType,
      criteria: rubric.criteria || []
    });
    setActiveTab('register');
  };

  const handleSave = async (rubricData) => {
    try {
      if (formData.id) {
        await updateRubric(formData.id, rubricData);
      } else {
        await createRubric(rubricData);
      }
      clearForm();
      setActiveTab('list');
      await getRubrics();
    } catch (error) {
      console.error('Error al guardar rúbrica:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRubric(id);
      await getRubrics();
    } catch (error) {
      console.error('Error al eliminar rúbrica:', error);
    }
  };

  const handleCancelEdit = () => {
    clearForm();
    setActiveTab('list');
  };

  // Calcular estadísticas
  const stats = {
    total: rubrics.length,
    evaluacion: rubrics.filter(r => r.rubricType === 'Evaluación').length,
    diagnostico: rubrics.filter(r => r.rubricType === 'Diagnóstico').length,
    formativa: rubrics.filter(r => r.rubricType === 'Formativa').length,
    sumativa: rubrics.filter(r => r.rubricType === 'Sumativa').length,
    withSpecialty: rubrics.filter(r => r.specialtyId).length,
    totalCriteria: rubrics.reduce((acc, r) => acc + (r.criteria?.length || 0), 0)
  };

  return (
    <div className="min-h-screen">
      
      {/* Header Superior */}
      <div className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span>Sistema</span>
                <span>›</span>
                <span className="text-purple-600 font-semibold">Gestión de Evaluaciones</span>
              </div>
              <div className="flex items-center gap-3">
                <ClipboardList className="w-8 h-8 text-purple-700" />
                <h1 className="text-3xl font-black text-gray-900">
                  Instrumentos y Evaluaciones
                </h1>
              </div>
            </div>

            {/* Stats desktop */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white px-4 py-3 rounded-xl shadow-lg">
                <div className="flex items-center justify-center mb-1">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-center">{stats.total}</div>
                <div className="text-xs font-semibold opacity-90 text-center">Total Rúbricas</div>
              </div>
              <div className="bg-gradient-to-br from-blue-400 to-blue-500 text-white px-4 py-3 rounded-xl shadow-lg">
                <div className="flex items-center justify-center mb-1">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-center">{stats.totalCriteria}</div>
                <div className="text-xs font-semibold opacity-90 text-center">Criterios</div>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-green-500 text-white px-4 py-3 rounded-xl shadow-lg">
                <div className="flex items-center justify-center mb-1">
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-center">{stats.withSpecialty}</div>
                <div className="text-xs font-semibold opacity-90 text-center">Especialidad</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-1">
            <button
              onClick={() => handleTabChange('list')}
              className={`cursor-pointer relative px-6 py-4 font-bold text-sm transition-all duration-300 ${
                activeTab === 'list' ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>Lista de Rúbricas</span>
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-black">
                  {stats.total}
                </span>
              </div>
              {activeTab === 'list' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-t-full"></div>
              )}
            </button>
            
            <button
              onClick={() => handleTabChange('register')}
              className={`cursor-pointer relative px-6 py-4 font-bold text-sm transition-all duration-300 ${
                activeTab === 'register' ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span>{formData.id ? 'Editar Rúbrica' : 'Nueva Rúbrica'}</span>
              </div>
              {activeTab === 'register' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-t-full"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        
        {/* Stats móvil */}
        <div className="lg:hidden grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-3 rounded-xl shadow-lg text-center">
            <ClipboardList className="w-5 h-5 mx-auto mb-1" />
            <div className="text-xl font-black">{stats.total}</div>
            <div className="text-xs font-semibold opacity-90">Rúbricas</div>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-blue-500 text-white p-3 rounded-xl shadow-lg text-center">
            <FileText className="w-5 h-5 mx-auto mb-1" />
            <div className="text-xl font-black">{stats.totalCriteria}</div>
            <div className="text-xs font-semibold opacity-90">Criterios</div>
          </div>
          <div className="bg-gradient-to-br from-green-400 to-green-500 text-white p-3 rounded-xl shadow-lg text-center">
            <Award className="w-5 h-5 mx-auto mb-1" />
            <div className="text-xl font-black">{stats.withSpecialty}</div>
            <div className="text-xs font-semibold opacity-90">Especial.</div>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button 
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Contenido */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {activeTab === 'list' ? (
            <ListRubrics 
              rubrics={rubrics}
              loading={loading}
              deleteRubric={handleDelete}
              updateRubric={handleEdit}
            />
          ) : (
            <div className="p-8">
              <RegisterRubric
                formData={formData}
                setFormData={setFormData}
                onSave={handleSave}
                onCancel={handleCancelEdit}
                isEditing={!!formData.id}
              />
            </div>
          )}
        </div>

        {/* Footer con información adicional */}
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-500 p-5 rounded-r-xl">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 mb-2">Gestión de Rúbricas y Evaluaciones</h4>
              <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-purple-600" />
                  <span><span className="font-semibold text-gray-800">Rúbricas:</span> Organización de criterios de evaluación</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span><span className="font-semibold text-gray-800">Criterios:</span> Elementos específicos a evaluar</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span><span className="font-semibold text-gray-800">Etapas:</span> Clasificación por etapa educativa</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-purple-600" />
                  <span><span className="font-semibold text-gray-800">Gestión:</span> Control y seguimiento académico</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Evaluations;