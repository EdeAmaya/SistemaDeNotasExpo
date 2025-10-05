import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, UserCheck, Award, BookOpen, Target, Calendar, Layers, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import useProjectDetails from '../hooks/useDataProjectDetails';

const ProjectInfo = ({ projectId, onBack }) => {
    const { loading, error, projectDetails, fetchProjectDetails } = useProjectDetails();
    const [activeSection, setActiveSection] = useState(null);
    const [expandedEvaluations, setExpandedEvaluations] = useState({});

    useEffect(() => {
        if (projectId) {
            fetchProjectDetails(projectId);
        }
    }, [projectId, fetchProjectDetails]);

    const toggleEvaluation = (evaluationId) => {
        setExpandedEvaluations(prev => ({
            ...prev,
            [evaluationId]: !prev[evaluationId]
        }));
    };

    const getRubricTypeName = (type) => {
        if (type === 1) return 'Escala Estimativa';
        if (type === 2) return 'Rúbrica';
        return 'No definido';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
                    <p className="mt-4 text-gray-600 font-semibold">Cargando detalles del proyecto...</p>
                </div>
            </div>
        );
    }

    if (error || !projectDetails) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-600">{error || 'No se pudo cargar la información del proyecto'}</p>
                <button
                    onClick={onBack}
                    className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all"
                >
                    Volver
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            {/* Header con botón de regreso */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Volver</span>
                </button>
                <div className="flex-1">
                    <h2 className="text-2xl font-black text-gray-900">{projectDetails.projectName}</h2>
                    <p className="text-sm text-gray-500">Detalles de evaluaciones del proyecto</p>
                </div>
            </div>

            {/* Información general del proyecto */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <BookOpen className="w-8 h-8 text-yellow-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black mb-1">{projectDetails.projectName}</h3>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1.5">
                                    <Target className="w-4 h-4" />
                                    <span>{projectDetails.totalEvaluaciones || 0} evaluaciones</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm opacity-90 mb-1">Promedio Total</div>
                        <div className="text-5xl font-black">
                            {(projectDetails.promedioTotal || 0).toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Botones de selección de tipo de evaluación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Botón Evaluaciones Internas */}
                <button
                    onClick={() => setActiveSection(activeSection === 'internal' ? null : 'internal')}
                    className={`group relative overflow-hidden rounded-xl p-6 border-2 transition-all duration-300 ${
                        activeSection === 'internal'
                            ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                    }`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                activeSection === 'internal' ? 'bg-blue-500 shadow-lg' : 'bg-blue-100 group-hover:bg-blue-200'
                            }`}>
                                <Users className={`w-6 h-6 ${activeSection === 'internal' ? 'text-white' : 'text-blue-600'}`} />
                            </div>
                            <div className="text-left">
                                <h3 className={`text-lg font-bold ${activeSection === 'internal' ? 'text-blue-600' : 'text-gray-900'}`}>
                                    Evaluaciones Internas
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {projectDetails.evaluacionesInternas?.length || 0} evaluaciones
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-3xl font-black ${activeSection === 'internal' ? 'text-blue-600' : 'text-gray-700'}`}>
                                {(projectDetails.promedioInterno || 0).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 font-semibold">Promedio</div>
                        </div>
                    </div>
                    <div className={`h-1 rounded-full transition-all ${
                        activeSection === 'internal' ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 'bg-gray-200 group-hover:bg-blue-300'
                    }`}></div>
                </button>

                {/* Botón Evaluaciones Externas */}
                <button
                    onClick={() => setActiveSection(activeSection === 'external' ? null : 'external')}
                    className={`group relative overflow-hidden rounded-xl p-6 border-2 transition-all duration-300 ${
                        activeSection === 'external'
                            ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                            : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                    }`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                activeSection === 'external' ? 'bg-purple-500 shadow-lg' : 'bg-purple-100 group-hover:bg-purple-200'
                            }`}>
                                <UserCheck className={`w-6 h-6 ${activeSection === 'external' ? 'text-white' : 'text-purple-600'}`} />
                            </div>
                            <div className="text-left">
                                <h3 className={`text-lg font-bold ${activeSection === 'external' ? 'text-purple-600' : 'text-gray-900'}`}>
                                    Evaluaciones Externas
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {projectDetails.evaluacionesExternas?.length || 0} evaluaciones
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-3xl font-black ${activeSection === 'external' ? 'text-purple-600' : 'text-gray-700'}`}>
                                {(projectDetails.promedioExterno || 0).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 font-semibold">Promedio</div>
                        </div>
                    </div>
                    <div className={`h-1 rounded-full transition-all ${
                        activeSection === 'external' ? 'bg-gradient-to-r from-purple-400 to-purple-600' : 'bg-gray-200 group-hover:bg-purple-300'
                    }`}></div>
                </button>
            </div>

            {/* Contenido según la sección activa */}
            {activeSection && (
                <div className="animate-fadeIn">
                    <div className={`rounded-xl border-2 p-6 ${
                        activeSection === 'internal' ? 'border-blue-200 bg-blue-50' : 'border-purple-200 bg-purple-50'
                    }`}>
                        <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                            activeSection === 'internal' ? 'text-blue-700' : 'text-purple-700'
                        }`}>
                            {activeSection === 'internal' ? (
                                <>
                                    <Users className="w-6 h-6" />
                                    <span>Detalles de Evaluaciones Internas</span>
                                </>
                            ) : (
                                <>
                                    <UserCheck className="w-6 h-6" />
                                    <span>Detalles de Evaluaciones Externas</span>
                                </>
                            )}
                        </h3>

                        {/* Lista de evaluaciones */}
                        <div className="space-y-3">
                            {(activeSection === 'internal'
                                ? projectDetails.evaluacionesInternas
                                : projectDetails.evaluacionesExternas
                            )?.map((evaluacion) => {
                                const isExpanded = expandedEvaluations[evaluacion._id];
                                const rubric = evaluacion.rubricId;

                                return (
                                    <div key={evaluacion._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                        <button
                                            onClick={() => toggleEvaluation(evaluacion._id)}
                                            className="w-full p-4 hover:bg-gray-50 transition-all"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 text-left">
                                                    <div className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                                                        {rubric?.rubricName || 'Rúbrica sin nombre'}
                                                        <span className="text-xs font-semibold px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                                                            {getRubricTypeName(rubric?.rubricType)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                                        {rubric?.stageId?.name && (
                                                            <div className="flex items-center gap-1">
                                                                <Layers className="w-4 h-4" />
                                                                <span>{rubric.stageId.name}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1">
                                                            <Target className="w-4 h-4" />
                                                            <span>{evaluacion.criteriosEvaluados?.length || 0} criterios</span>
                                                        </div>
                                                        {evaluacion.fecha && (
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="w-4 h-4" />
                                                                <span>{new Date(evaluacion.fecha).toLocaleDateString('es-ES')}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <div className={`text-2xl font-black ${
                                                            activeSection === 'internal' ? 'text-blue-600' : 'text-purple-600'
                                                        }`}>
                                                            {evaluacion.notaFinal?.toFixed(2) || '0.00'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-semibold">Nota Final</div>
                                                    </div>
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </div>
                                            </div>
                                        </button>

                                        {/* Contenido desplegable - Criterios */}
                                        {isExpanded && (
                                            <div className="border-t border-gray-200 bg-gray-50 p-4">
                                                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                                    <Award className="w-4 h-4" />
                                                    Criterios Evaluados
                                                </h4>

                                                <div className="space-y-2">
                                                    {evaluacion.criteriosEvaluados?.map((criterio, idx) => {
                                                        const puntajeMaximo = criterio.puntajeMaximo || 10;
                                                        const peso = criterio.peso || 0;
                                                        const porcentaje = puntajeMaximo > 0 
                                                            ? ((criterio.puntajeObtenido / puntajeMaximo) * 100).toFixed(0)
                                                            : 0;

                                                        return (
                                                            <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className="text-xs font-bold text-gray-500">#{idx + 1}</span>
                                                                            <span className="font-semibold text-gray-800">
                                                                                {criterio.criterionName || 'Criterio sin nombre'}
                                                                            </span>
                                                                        </div>

                                                                        {criterio.descripcion && (
                                                                            <div className="text-xs text-gray-600 mt-1 mb-2">
                                                                                {criterio.descripcion}
                                                                            </div>
                                                                        )}

                                                                        <div className="flex items-center gap-3 mt-2">
                                                                            {peso > 0 && (
                                                                                <div className="flex items-center gap-1 text-xs text-purple-600">
                                                                                    <TrendingUp className="w-3 h-3" />
                                                                                    <span className="font-semibold">Peso: {peso}%</span>
                                                                                </div>
                                                                            )}
                                                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                                <Award className="w-3 h-3" />
                                                                                <span className="font-semibold">Máximo: {puntajeMaximo} pts</span>
                                                                            </div>
                                                                        </div>

                                                                        {criterio.comentario && (
                                                                            <div className="mt-2 text-xs text-gray-600 italic bg-gray-50 p-2 rounded border-l-2 border-yellow-400">
                                                                                <span className="font-semibold text-gray-700">Comentario:</span> {criterio.comentario}
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div className="text-right flex-shrink-0">
                                                                        <div className={`text-xl font-black ${
                                                                            activeSection === 'internal' ? 'text-blue-600' : 'text-purple-600'
                                                                        }`}>
                                                                            {criterio.puntajeObtenido?.toFixed(1) || '0.0'}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500 font-semibold">/ {puntajeMaximo}</div>
                                                                        <div className="text-xs text-gray-400 mt-1">
                                                                            {porcentaje}%
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Resumen de la evaluación */}
                                                {evaluacion.resumen && (
                                                    <div className={`mt-4 p-3 rounded-lg ${
                                                        activeSection === 'internal'
                                                            ? 'bg-blue-100 border border-blue-300'
                                                            : 'bg-purple-100 border border-purple-300'
                                                    }`}>
                                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                                            <div>
                                                                <div className="text-xs text-gray-600 mb-1">Total Criterios</div>
                                                                <div className="font-bold text-gray-800">{evaluacion.resumen.totalCriterios}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-gray-600 mb-1">Puntaje Obtenido</div>
                                                                <div className="font-bold text-gray-800">
                                                                    {evaluacion.resumen.totalPuntajeObtenido?.toFixed(2)} / {evaluacion.resumen.totalPuntajeMaximo}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-gray-600 mb-1">Tipo de Cálculo</div>
                                                                <div className="font-bold text-gray-800">
                                                                    {evaluacion.tipoCalculo === 'ponderado' ? 'Ponderado' : 'Simple'}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-gray-600 mb-1">Nota Final</div>
                                                                <div className={`text-xl font-black ${
                                                                    activeSection === 'internal' ? 'text-blue-700' : 'text-purple-700'
                                                                }`}>
                                                                    {evaluacion.notaFinal?.toFixed(2)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {(activeSection === 'internal'
                                ? projectDetails.evaluacionesInternas
                                : projectDetails.evaluacionesExternas
                            )?.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No hay evaluaciones {activeSection === 'internal' ? 'internas' : 'externas'} registradas
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Mensaje inicial */}
            {!activeSection && (
                <div className="text-center py-12 text-gray-500">
                    <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-semibold">Selecciona un tipo de evaluación para ver los detalles</p>
                    <p className="text-sm">Haz clic en "Evaluaciones Internas" o "Evaluaciones Externas"</p>
                </div>
            )}
        </div>
    );
};

export default ProjectInfo;