import React, { useState } from 'react';
import { GraduationCap, UserPlus, BookOpen, Users, Award, Briefcase, Info, Upload } from 'lucide-react';
import ListStudents from './components/ListStudents';
import RegisterStudent from './components/RegisterStudent';
import BulkStudentUpload from './components/BulkStudentUpload';
import useDataStudents from './hooks/useDataStudents';
import DeleteAllStudentsButton from './components/DeleteAllStudentsButton';

const Students = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [levels, setLevels] = useState([]);
  const [sections, setSections] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [projects, setProjects] = useState([]);

  const {
    students,
    loading,
    id,
    studentCode,
    name,
    lastName,
    idLevel,
    idSection,
    idSpecialty,
    projectId,
    setStudentCode,
    setName,
    setLastName,
    setIdLevel,
    setIdSection,
    setIdSpecialty,
    setProjectId,
    saveStudent,
    deleteStudent,
    deleteAllStudents,
    updateStudent,
    handleEdit,
    clearForm,
    refreshStudents
  } = useDataStudents();

  React.useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [levelsRes, sectionsRes, specialtiesRes, projectsRes] = await Promise.all([
          fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/levels', { credentials: 'include' }),
          fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/sections', { credentials: 'include' }),
          fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/specialties', { credentials: 'include' }),
          fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/projects', { credentials: 'include' })
        ]);

        if (levelsRes.ok) setLevels(await levelsRes.json());
        if (sectionsRes.ok) setSections(await sectionsRes.json());
        if (specialtiesRes.ok) setSpecialties(await specialtiesRes.json());
        if (projectsRes.ok) setProjects(await projectsRes.json());
      } catch (error) {
        console.error('Error cargando catálogos:', error);
      }
    };

    fetchCatalogs();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'list') {
      clearForm();
    }
  };

  const handleCancelEdit = () => {
    clearForm();
    setActiveTab('list');
  };

  const handleBulkUploadComplete = () => {
    refreshStudents();
    setActiveTab('list');
  };

  const stats = {
    total: students.length,
    withProject: students.filter(s => s.projectId).length,
    withoutProject: students.filter(s => !s.projectId).length,
    withSpecialty: students.filter(s => s.idSpecialty).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">

      {/* Header Superior */}
      <div className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span>Sistema</span>
                <span>›</span>
                <span className="text-green-600 font-semibold">Gestión de Estudiantes</span>
              </div>
              <div className="flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-green-500" />
                <h1 className="text-3xl font-black text-gray-900">
                  Estudiantes Registrados
                </h1>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <div className="bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg">
                <div className="flex items-center justify-center mb-1">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-center">{stats.total}</div>
                <div className="text-xs font-semibold opacity-90 text-center">Total</div>
              </div>
              <div className="bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg">
                <div className="flex items-center justify-center mb-1">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-center">{stats.withProject}</div>
                <div className="text-xs font-semibold opacity-90 text-center">Con Proyecto</div>
              </div>
              <div className="bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg">
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
              className={`cursor-pointer relative px-6 py-4 font-bold text-sm transition-all duration-300 ${activeTab === 'list' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>Lista de Estudiantes</span>
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-black">
                  {stats.total}
                </span>
              </div>
              {activeTab === 'list' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 rounded-t-full"></div>
              )}
            </button>

            <button
              onClick={() => handleTabChange('register')}
              className={`cursor-pointer relative px-6 py-4 font-bold text-sm transition-all duration-300 ${activeTab === 'register' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                <span>{id ? 'Editar Estudiante' : 'Nuevo Estudiante'}</span>
              </div>
              {activeTab === 'register' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 rounded-t-full"></div>
              )}
            </button>

            <button
              onClick={() => handleTabChange('bulk')}
              className={`cursor-pointer relative px-6 py-4 font-bold text-sm transition-all duration-300 ${activeTab === 'bulk' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                <span>Carga Masiva</span>
              </div>
              {activeTab === 'bulk' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 rounded-t-full"></div>
              )}
            </button>

            <DeleteAllStudentsButton
              totalStudents={students.length}
              onDeleteAll={deleteAllStudents}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">

        {/* Stats móvil */}
        <div className="lg:hidden grid grid-cols-3 gap-3 mb-6">
          <div className="bg-green-500 text-white p-3 rounded-xl shadow-lg text-center">
            <Users className="w-5 h-5 mx-auto mb-1" />
            <div className="text-xl font-black">{stats.total}</div>
            <div className="text-xs font-semibold opacity-90">Total</div>
          </div>
          <div className="bg-green-500 text-white p-3 rounded-xl shadow-lg text-center">
            <Briefcase className="w-5 h-5 mx-auto mb-1" />
            <div className="text-xl font-black">{stats.withProject}</div>
            <div className="text-xs font-semibold opacity-90">Proyecto</div>
          </div>
          <div className="bg-green-500 text-white p-3 rounded-xl shadow-lg text-center">
            <Award className="w-5 h-5 mx-auto mb-1" />
            <div className="text-xl font-black">{stats.withSpecialty}</div>
            <div className="text-xs font-semibold opacity-90">Especial.</div>
          </div>
        </div>

        {/* Contenido */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {activeTab === 'list' ? (
            <ListStudents
              students={students}
              loading={loading}
              deleteStudent={deleteStudent}
              updateStudent={(student) => {
                updateStudent(student);
                setActiveTab('register');
              }}
              levels={levels}
              sections={sections}
              specialties={specialties}
            />
          ) : activeTab === 'register' ? (
            <div className="p-8">
              <RegisterStudent
                studentCode={studentCode}
                setStudentCode={setStudentCode}
                name={name}
                setName={setName}
                lastName={lastName}
                setLastName={setLastName}
                idLevel={idLevel}
                setIdLevel={setIdLevel}
                idSection={idSection}
                setIdSection={setIdSection}
                idSpecialty={idSpecialty}
                setIdSpecialty={setIdSpecialty}
                projectId={projectId}
                setProjectId={setProjectId}
                saveStudent={saveStudent}
                id={id}
                handleEdit={handleEdit}
                onCancel={handleCancelEdit}
              />
            </div>
          ) : (
            <BulkStudentUpload
              onUploadComplete={handleBulkUploadComplete}
              levels={levels}
              sections={sections}
              specialties={specialties}
              projects={projects}
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-5 rounded-r-xl">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 mb-2">Gestión de Estudiantes</h4>
              <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-green-600" />
                  <span><span className="font-semibold text-gray-800">Nivel y Sección:</span> Organización académica</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-green-600" />
                  <span><span className="font-semibold text-gray-800">Especialidad:</span> Para bachillerato</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-green-600" />
                  <span><span className="font-semibold text-gray-800">Proyectos:</span> Asignación de trabajos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-green-600" />
                  <span><span className="font-semibold text-gray-800">Carga masiva:</span> Múltiples estudiantes vía Excel</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students;