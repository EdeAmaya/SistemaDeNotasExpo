import React from "react";
import { GraduationCap, Award, Briefcase, User, Mail, Calendar, Edit2, Trash2, BookOpen, FileText, CheckCircle, XCircle } from 'lucide-react';

const StudentCard = ({ student, deleteStudent, updateStudent, viewMode = 'list' }) => {
  
  const handleDelete = () => {
    if (window.confirm(`¿Eliminar a ${student.name} ${student.lastName}?`)) {
      deleteStudent(student._id);
    }
  };

  const handleEdit = () => {
    updateStudent(student);
  };

  const getLevelName = (level) => {
    if (!level) return 'No asignado';
    return level.name || level.levelName || 'Nivel no definido';
  };

  const getSectionName = (section) => {
    if (!section) return 'No asignada';
    return section.name || section.sectionName || 'Sección no definida';
  };

  const getSpecialtyName = (specialty) => {
    if (!specialty) return null;
    return specialty.name || specialty.specialtyName || 'Especialidad no definida';
  };

  const getProjectName = (project) => {
    if (!project) return null;
    return project.projectName || project.title || project.name || `Proyecto ${project.projectId || project._id}`;
  };

  // Vista de Lista (Horizontal)
  if (viewMode === 'list') {
    return (
      <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden">
        
        {/* Barra lateral colorida */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
          student.projectId ? 'bg-green-600' : 'bg-green-600/50'
        }`}></div>
        
        <div className="pl-4 pr-5 py-4 flex items-center gap-5">
          
          {/* Avatar con icono */}
          <div className={`relative flex-shrink-0 w-16 h-16 rounded-xl ${
            student.projectId ? 'bg-green-600' : 'bg-green-600/50'
          } flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
            <GraduationCap className="w-8 h-8 text-white" />
            
            {/* Indicador de proyecto */}
            {student.projectId ? (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                <Briefcase className="w-3 h-3 text-white" />
              </div>
            ) : (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-500 rounded-full border-2 border-white flex items-center justify-center">
                <XCircle className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* Información del estudiante */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-black text-gray-900 truncate group-hover:text-green-600 transition-colors">
                {student.name} {student.lastName}
              </h3>
              
              {/* Badge de código */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-xs font-bold shadow-sm">
                <FileText className="w-3.5 h-3.5" />
                <span>{student.studentCode}</span>
              </span>
            </div>

            {/* Info académica */}
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <div className="flex items-center gap-1.5 text-gray-600">
                <BookOpen className="w-4 h-4" />
                <span className="font-medium">{getLevelName(student.idLevel)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <FileText className="w-4 h-4" />
                <span className="font-medium">{getSectionName(student.idSection)}</span>
              </div>
              {student.idSpecialty && (
                <div className="flex items-center gap-1.5 text-purple-600">
                  <Award className="w-4 h-4" />
                  <span className="font-medium text-xs">{getSpecialtyName(student.idSpecialty)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              title="Editar estudiante"
            >
              <span className="flex items-center gap-1.5">
                <Edit2 className="w-4 h-4" />
                <span className="hidden xl:inline">Editar</span>
              </span>
            </button>
            
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              title="Eliminar estudiante"
            >
              <span className="flex items-center gap-1.5">
                <Trash2 className="w-4 h-4" />
                <span className="hidden xl:inline">Eliminar</span>
              </span>
            </button>
          </div>
        </div>

        {/* Barra inferior */}
        <div className={`h-0.5 ${student.projectId ? 'bg-green-600' : 'bg-green-600/50'} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
      </div>
    );
  }

  // Vista de Tarjetas (Grid)
  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden">
      
      {/* Header verde sólido */}
      <div className={`relative ${student.projectId ? 'bg-green-600' : 'bg-green-600/50'} p-6 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-3">
              <GraduationCap className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-black mb-1">{student.name} {student.lastName}</h3>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-bold">
              <FileText className="w-3 h-3" />
              {student.studentCode}
            </div>
          </div>
          
          {/* Badge de proyecto */}
          {student.projectId ? (
            <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <Briefcase className="w-6 h-6" />
            </div>
          ) : (
            <div className="flex-shrink-0 w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center shadow-lg">
              <XCircle className="w-6 h-6" />
            </div>
          )}
        </div>
      </div>

      {/* Body del card */}
      <div className="p-6 space-y-4">
        
        {/* Nivel */}
        <div className="flex items-center gap-2 text-gray-700">
          <BookOpen className="w-5 h-5 text-green-600" />
          <div>
            <div className="text-xs text-gray-500 font-semibold">Nivel</div>
            <div className="text-sm font-bold">{getLevelName(student.idLevel)}</div>
          </div>
        </div>

        {/* Sección */}
        <div className="flex items-center gap-2 text-gray-700">
          <FileText className="w-5 h-5 text-blue-600" />
          <div>
            <div className="text-xs text-gray-500 font-semibold">Sección</div>
            <div className="text-sm font-bold">{getSectionName(student.idSection)}</div>
          </div>
        </div>

        {/* Especialidad */}
        {student.idSpecialty && (
          <div className="flex items-center gap-2 text-gray-700">
            <Award className="w-5 h-5 text-purple-600" />
            <div>
              <div className="text-xs text-gray-500 font-semibold">Especialidad</div>
              <div className="text-sm font-bold">{getSpecialtyName(student.idSpecialty)}</div>
            </div>
          </div>
        )}

        {/* Proyecto */}
        {student.projectId ? (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-50 border-2 border-blue-200">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <div className="text-xs text-blue-600 font-semibold">Proyecto Asignado</div>
              <div className="text-sm font-bold text-blue-800">{getProjectName(student.projectId)}</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-50 border-2 border-green-200">
            <XCircle className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <div className="text-xs text-green-600 font-semibold">Sin Proyecto</div>
              <div className="text-sm font-bold text-green-800">No asignado</div>
            </div>
          </div>
        )}

        {/* Fecha de creación */}
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar className="w-5 h-5" />
          <span className="text-xs font-medium">
            Creado el {new Date(student.createdAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </span>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleEdit}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
            <span>Editar</span>
          </button>
          
          <button
            onClick={handleDelete}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>

      {/* Footer verde */}
      <div className={`${student.projectId ? 'bg-green-600' : 'bg-green-600/50'} h-2`}></div>
    </div>
  );
};

export default StudentCard;
