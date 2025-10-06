import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, BookOpen, ClipboardList, Award, Info, FileText, BookOpenCheck } from 'lucide-react';
import ListGrades from './components/ListGrades';
import RegisterGrade from './components/RegisterGrade';
import DiplomasSection from './components/DiplomasSection'; 
import useDataEvaluations from './hooks/useDataEvaluations';
import useDataProjectScores from './hooks/useDataProjectScores';
import ProjectInfo from './components/ProjectInfo';
import { useAuth } from '../context/AuthContext';

const Grades = () => {
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Asignación de Notas | STC";
  }, []);

  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const { 
    projectScores, 
    loading: loadingScores, 
    getProjectScores 
  } = useDataProjectScores();

  const {
    evaluations,
    loading: loadingEvaluations,
    error,
    getEvaluations,
    createEvaluation,
    updateEvaluation,
    clearError
  } = useDataEvaluations();

  const [activeTab, setActiveTab] = useState('list');
  const [formData, setFormData] = useState({
    id: null,
    projectId: null,
    rubricId: null
  });

  useEffect(() => {
    if (user?.role === 'Evaluador') {
      setActiveTab('assign'); 
    }
  }, [user]);

  useEffect(() => {
    getProjectScores();
    getEvaluations();
  }, [getProjectScores, getEvaluations]);

  const handleTabChange = (tab) => {
    if (user?.role === 'Evaluador' && tab !== 'assign') {
      return; 
    }

    if (user?.role === 'Docente' && tab === 'diplomas') {
      return; 
    }

    setActiveTab(tab);
    if (tab === 'list') clearForm();
  };

  const clearForm = () => {
    setFormData({
      id: null,
      projectId: null,
      rubricId: null
    });
  };

  const handleSave = async (evaluationData) => {
    try {
      if (formData.id) {
        await updateEvaluation(formData.id, evaluationData);
      } else {
        await createEvaluation(evaluationData);
      }
      clearForm();
      
      // Evaluador permanece en 'assign' después de guardar
      if (user?.role !== 'Evaluador') {
        setActiveTab('list');
      }
      
      await getEvaluations();
      await getProjectScores();
    } catch (error) {
      console.error('Error al guardar la evaluación:', error);
    }
  };

  const handleCancelEdit = () => {
    clearForm();
    // Evaluador permanece en 'assign'
    if (user?.role !== 'Evaluador') {
      setActiveTab('list');
    }
  };

  const stats = {
    total: projectScores.length,
    avgScore: projectScores.length > 0 
      ? (projectScores.reduce((sum, p) => sum + (p.promedioTotal || 0), 0) / projectScores.length).toFixed(2)
      : 0,
    totalEvaluations: projectScores.reduce((acc, p) => acc + (p.totalEvaluaciones || 0), 0)
  };

  const currentLoading = activeTab === 'list' ? loadingScores : loadingEvaluations;

  const handleViewProjectDetails = (projectId) => {
    setSelectedProjectId(projectId);
    setActiveTab('details');
  };

  const handleBackToList = () => {
    setSelectedProjectId(null);
    setActiveTab('list');
  };

  const isTabEnabled = (tab) => {
    if (!user) return false;

    switch(user.role) {
      case 'Evaluador':
        return tab === 'assign'; 
      case 'Docente':
        return tab !== 'diplomas'; 
      case 'Admin':
      case 'Estudiante':
        return true;
      default:
        return false;
    }
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
                <span className="text-yellow-500 font-semibold">Gestión de Evaluaciones</span>
              </div>
              <div className="flex items-center gap-3">
                <BookOpenCheck className="w-8 h-8 text-yellow-500" />
                <h1 className="text-3xl font-black text-gray-900">
                  Evaluación de Proyectos
                </h1>
              </div>
            </div>

            {/* Stats desktop - Solo visible para roles que pueden ver estadísticas */}
            {user?.role !== 'Evaluador' && (
              <div className="hidden lg:flex items-center gap-4">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white px-4 py-3 rounded-xl shadow-lg text-center">
                  <ClipboardList className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-2xl font-black">{stats.total}</div>
                  <div className="text-xs font-semibold opacity-90">Proyectos</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-300 to-yellow-400 text-white px-4 py-3 rounded-xl shadow-lg text-center">
                  <Award className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-2xl font-black">{stats.avgScore}</div>
                  <div className="text-xs font-semibold opacity-90">Promedio</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white px-4 py-3 rounded-xl shadow-lg text-center">
                  <FileText className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-2xl font-black">{stats.totalEvaluations}</div>
                  <div className="text-xs font-semibold opacity-90">Evaluaciones</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-1 overflow-x-auto">
            {/* TAB: Proyectos Evaluados */}
            {isTabEnabled('list') && (
              <button
                onClick={() => handleTabChange('list')}
                className={`cursor-pointer relative px-6 py-4 font-bold text-sm transition-all duration-300 whitespace-nowrap ${
                  activeTab === 'list' ? 'text-yellow-500' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Proyectos Evaluados</span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-black">
                    {stats.total}
                  </span>
                </div>
                {activeTab === 'list' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-t-full"></div>
                )}
              </button>
            )}
            
            {/* TAB: Nueva Evaluación (Visible para todos los roles que acceden a Grades) */}
            {isTabEnabled('assign') && (
              <button
                onClick={() => handleTabChange('assign')}
                className={`cursor-pointer relative px-6 py-4 font-bold text-sm transition-all duration-300 whitespace-nowrap ${
                  activeTab === 'assign' ? 'text-yellow-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  <span>{formData.id ? 'Editar Evaluación' : 'Nueva Evaluación'}</span>
                </div>
                {activeTab === 'assign' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-t-full"></div>
                )}
              </button>
            )}

            {/* TAB: Diplomas (NO visible para Docente ni Evaluador) */}
            {isTabEnabled('diplomas') && (
              <button
                onClick={() => handleTabChange('diplomas')}
                className={`cursor-pointer relative px-6 py-4 font-bold text-sm transition-all duration-300 whitespace-nowrap ${
                  activeTab === 'diplomas' ? 'text-yellow-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span>Diplomas</span>
                </div>
                {activeTab === 'diplomas' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-t-full"></div>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        
        {/* Stats móvil - Solo visible para roles que pueden ver estadísticas */}
        {user?.role !== 'Evaluador' && (
          <div className="lg:hidden grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white p-3 rounded-xl shadow-lg text-center">
              <ClipboardList className="w-5 h-5 mx-auto mb-1" />
              <div className="text-xl font-black">{stats.total}</div>
              <div className="text-xs font-semibold opacity-90">Proyectos</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-300 to-yellow-400 text-white p-3 rounded-xl shadow-lg text-center">
              <Award className="w-5 h-5 mx-auto mb-1" />
              <div className="text-xl font-black">{stats.avgScore}</div>
              <div className="text-xs font-semibold opacity-90">Promedio</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-3 rounded-xl shadow-lg text-center">
              <FileText className="w-5 h-5 mx-auto mb-1" />
              <div className="text-xl font-black">{stats.totalEvaluations}</div>
              <div className="text-xs font-semibold opacity-90">Evaluaciones</div>
            </div>
          </div>
        )}

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

        {/* Contenido principal */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {activeTab === 'list' ? (
            <ListGrades 
              projectScores={projectScores}
              loading={loadingScores}
              onViewDetails={handleViewProjectDetails}
            />
          ) : activeTab === 'details' ? (
            <ProjectInfo 
              projectId={selectedProjectId}
              onBack={handleBackToList}
            />
          ) : activeTab === 'diplomas' ? (
            <DiplomasSection />
          ) : (
            <div className="p-8">
              <RegisterGrade
                formData={formData}
                setFormData={setFormData}
                onSave={handleSave}
                onCancel={handleCancelEdit}
                isEditing={!!formData.id}
              />
            </div>
          )}
        </div>

        {/* Footer informativo */}
        {activeTab !== 'diplomas' && (
          <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded-r-xl">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 mb-2">Sistema de Evaluación de Proyectos</h4>
                <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-yellow-600" />
                    <span><span className="font-semibold text-gray-800">Rúbricas:</span> Instrumentos de evaluación con criterios específicos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-yellow-600" />
                    <span><span className="font-semibold text-gray-800">Criterios:</span> Aspectos a evaluar con puntajes definidos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <span><span className="font-semibold text-gray-800">Evaluaciones:</span> Internas (docentes) y externas (jurados)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-yellow-600" />
                    <span><span className="font-semibold text-gray-800">Promedios:</span> Cálculo automático por tipo y total</span>
                  </div>
                </div>
                
                {/* Información adicional */}
                <div className="mt-4 pt-4 border-t border-yellow-200">
                  <h5 className="font-semibold text-gray-800 mb-2 text-sm">Cálculo de notas:</h5>
                  <div className="grid md:grid-cols-2 gap-2 text-xs text-gray-600">
                    <div className="bg-yellow-100 px-3 py-2 rounded-lg">
                      <span className="font-bold text-yellow-700">Escala Estimativa:</span> Nota = Σ (Puntaje × Peso/100)
                    </div>
                    <div className="bg-yellow-100 px-3 py-2 rounded-lg">
                      <span className="font-bold text-yellow-700">Rúbrica:</span> Nota = Σ (Puntajes obtenidos)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Grades;