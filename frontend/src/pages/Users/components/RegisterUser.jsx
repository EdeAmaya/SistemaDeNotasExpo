import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Shield, Crown, GraduationCap, Briefcase, Edit2, UserPlus, CheckCircle, Info, RefreshCw, XCircle, Loader2, BookOpen, Award } from 'lucide-react';

const RegisterUser = ({
  name, setName,
  lastName, setLastName,
  email, setEmail,
  password, setPassword,
  role, setRole,
  isVerified, setIsVerified,
  idLevel, setIdLevel,
  idSection, setIdSection,
  idSpecialty, setIdSpecialty,
  saveUser,
  id,
  handleEdit,
  onCancel
}) => {

  const [levels, setLevels] = useState([]);
  const [sections, setSections] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedLevelName, setSelectedLevelName] = useState('');

  // Cargar catálogos al montar el componente
  useEffect(() => {
    const fetchCatalogData = async () => {
      setLoadingData(true);
      setErrors({});

      try {
        const [levelsResponse, sectionsResponse, specialtiesResponse] = await Promise.all([
          fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/levels', { credentials: 'include' }),
          fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/sections', { credentials: 'include' }),
          fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/specialties', { credentials: 'include' })
        ]);

        if (levelsResponse.ok) {
          const levelsData = await levelsResponse.json();
          setLevels(Array.isArray(levelsData) ? levelsData : []);
        } else {
          setErrors(prev => ({ ...prev, levels: 'Error al cargar niveles' }));
        }

        if (sectionsResponse.ok) {
          const sectionsData = await sectionsResponse.json();
          setSections(Array.isArray(sectionsData) ? sectionsData : []);
        } else {
          setErrors(prev => ({ ...prev, sections: 'Error al cargar secciones' }));
        }

        if (specialtiesResponse.ok) {
          const specialtiesData = await specialtiesResponse.json();
          setSpecialties(Array.isArray(specialtiesData) ? specialtiesData : []);
        } else {
          setErrors(prev => ({ ...prev, specialties: 'Error al cargar especialidades' }));
        }

      } catch (error) {
        console.error('Error general cargando datos de catálogos:', error);
        setErrors({
          general: 'Error de conexión. Verifica que el servidor esté funcionando.'
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchCatalogData();
  }, []);

  // Determinar si se debe mostrar el campo de especialidad
  const shouldShowSpecialty = () => {
    if (!selectedLevelName) return false;

    const bachilleratoLevels = ['1° Bachillerato', '2° Bachillerato', '3° Bachillerato'];
    return bachilleratoLevels.some(level =>
      selectedLevelName.toLowerCase().includes(level.toLowerCase())
    );
  };

  // Determinar si se debe mostrar el campo de sección
  const shouldShowSection = () => {
    const selectedLevel = levels.find((level) => level._id === idLevel);
    // Muestra sección solo si el nivel no contiene la palabra "bachillerato"
    return selectedLevel && !selectedLevel.levelName?.toLowerCase().includes("bachillerato");
  };

  // Actualizar el nombre del nivel seleccionado
  useEffect(() => {
    if (idLevel && levels.length > 0) {
      const selectedLevel = levels.find(level => level._id === idLevel);
      if (selectedLevel) {
        setSelectedLevelName(selectedLevel.levelName || selectedLevel.name || '');
      }
    } else {
      setSelectedLevelName('');
    }
  }, [idLevel, levels]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar campos obligatorios para docentes
    if (role === 'Docente') {
      if (!idLevel) {
        alert('Para docentes, el campo Nivel es obligatorio');
        return;
      }

      // Solo validar especialidad si es un nivel de bachillerato
      if (shouldShowSpecialty() && !idSpecialty) {
        alert('Para docentes de Bachillerato, el campo Especialidad es obligatorio');
        return;
      }
    }

    if (id) {
      handleEdit(e);
    } else {
      saveUser(e);
    }
  };

  // Generar contraseña aleatoria
  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%&*';

    const allChars = uppercase + lowercase + numbers + symbols;
    let password = '';

    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = password.length; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    password = password.split('').sort(() => Math.random() - 0.5).join('');

    setPassword(password);
  };

  const roles = [
    {
      value: 'Admin',
      label: 'Administrador',
      icon: Crown,
      gradient: 'from-orange-500 to-orange-700',
      description: 'Control total del sistema'
    },
    {
      value: 'Docente',
      label: 'Docente',
      icon: GraduationCap,
      gradient: 'from-orange-500 to-orange-700',
      description: 'Gestión académica'
    },
    {
      value: 'Evaluador',
      label: 'Evaluador',
      icon: Briefcase,
      gradient: 'from-orange-500 to-orange-700',
      description: 'Evaluación de proyectos'
    },
    {
      value: 'Estudiante',
      label: 'Estudiante',
      icon: User,
      gradient: 'from-orange-500 to-orange-700',
      description: 'Acceso a cursos'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-3">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg flex-shrink-0`}>
            {id ? <Edit2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> : <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              {id ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              {id ? 'Actualiza la información del usuario' : 'Completa los datos para registrar un nuevo usuario'}
            </p>
          </div>
        </div>
      </div>

      {/* Mostrar errores generales */}
      {errors.general && (
        <div className="mb-4 sm:mb-6 bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 rounded-r-lg">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 font-medium text-xs sm:text-sm">{errors.general}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

        {/* Información Personal */}
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border-2 border-gray-200">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Información Personal</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={name || ''}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all text-gray-900 font-medium text-xs sm:text-base"
                placeholder="Ej: Juan"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                Apellido *
              </label>
              <input
                type="text"
                value={lastName || ''}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all text-gray-900 font-medium text-xs sm:text-base"
                placeholder="Ej: Pérez"
                required
              />
            </div>
          </div>
        </div>

        {/* Credenciales */}
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border-2 border-gray-200">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Credenciales de Acceso</span>
          </h3>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Correo Electrónico *</span>
              </label>
              <input
                type="email"
                value={email || ''}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all text-gray-900 font-medium text-xs sm:text-base"
                placeholder="usuario@ricaldone.edu.sv"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>
                  Contraseña {id && '(dejar vacío para mantener actual)'}
                  {!id && ' *'}
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={password || ''}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all text-gray-900 font-medium text-xs sm:text-base"
                  placeholder={id ? "Nueva contraseña (opcional)" : "Contraseña segura"}
                  required={!id}
                />
                <button
                  type="button"
                  onClick={generatePassword}
                  className="cursor-pointer px-3 sm:px-4 py-2 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 flex-shrink-0"
                  title="Generar contraseña"
                >
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              {!id && (
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Usa al menos 8 caracteres con números y letras
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Rol del Usuario */}
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border-2 border-gray-200">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Rol del Usuario *</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {roles.map((roleOption) => {
              const IconComponent = roleOption.icon;
              return (
                <label
                  key={roleOption.value}
                  className={`relative cursor-pointer group ${role === roleOption.value ? 'scale-105' : ''
                    }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={roleOption.value}
                    checked={role === roleOption.value}
                    onChange={(e) => setRole(e.target.value)}
                    className="sr-only"
                    required
                  />
                  <div className={`p-4 sm:p-5 rounded-xl border-3 text-center transition-all duration-300 ${role === roleOption.value
                    ? `bg-orange-500 text-white shadow-lg border-transparent`
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}>
                    <IconComponent className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 ${role === roleOption.value ? 'text-white' : 'text-gray-700'
                      }`} />
                    <div className={`font-bold text-sm sm:text-base mb-1 ${role === roleOption.value ? 'text-white' : 'text-gray-900'
                      }`}>
                      {roleOption.label}
                    </div>
                    <div className={`text-xs ${role === roleOption.value ? 'text-white/80' : 'text-gray-500'
                      }`}>
                      {roleOption.description}
                    </div>

                    {role === roleOption.value && (
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Información Académica - OBLIGATORIO PARA DOCENTES Y EVALUADORES */}
        {(role === 'Docente' || role === 'Evaluador') && (
          <div className="bg-blue-50 rounded-xl p-4 sm:p-6 border-2 border-blue-200">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <span>Información Académica (Obligatorio para Docentes y Evaluadores)</span>
            </h3>

            <div className={`grid grid-cols-1 gap-3 sm:gap-4 ${shouldShowSpecialty() && shouldShowSection() ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
              {/* Nivel */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Nivel *</span>
                </label>
                <select
                  value={idLevel || ''}
                  onChange={(e) => setIdLevel(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium text-xs sm:text-base"
                  required
                  disabled={loadingData}
                >
                  <option value="">
                    {loadingData ? 'Cargando niveles...' : 'Seleccionar nivel...'}
                  </option>
                  {levels.map((level) => (
                    <option key={level._id} value={level._id}>
                      {level.levelName || level.name}
                    </option>
                  ))}
                </select>
                {errors.levels && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {errors.levels}
                  </p>
                )}
              </div>

              {/* Sección - Solo para niveles que NO sean Bachillerato */}
              {shouldShowSection() && (
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Sección *</span>
                  </label>
                  <select
                    value={idSection || ''}
                    onChange={(e) => setIdSection(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium text-xs sm:text-base"
                    required
                    disabled={loadingData}
                  >
                    <option value="">
                      {loadingData ? 'Cargando secciones...' : 'Seleccionar sección...'}
                    </option>
                    {sections.map((section) => (
                      <option key={section._id} value={section._id}>
                        {section.sectionName || section.name}
                      </option>
                    ))}
                  </select>
                  {errors.sections && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {errors.sections}
                    </p>
                  )}
                </div>
              )}

              {/* Especialidad - Solo para Bachillerato */}
              {shouldShowSpecialty() && (
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                    <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Especialidad *</span>
                  </label>
                  <select
                    value={idSpecialty || ''}
                    onChange={(e) => setIdSpecialty(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium text-xs sm:text-base"
                    required
                    disabled={loadingData}
                  >
                    <option value="">
                      {loadingData ? 'Cargando especialidades...' : 'Seleccionar especialidad...'}
                    </option>
                    {specialties.map((specialty) => (
                      <option key={specialty._id} value={specialty._id}>
                        {specialty.specialtyName} ({specialty.letterSpecialty})
                      </option>
                    ))}
                  </select>
                  {errors.specialties && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {errors.specialties}
                    </p>
                  )}
                </div>
              )}
            </div>

            <p className="mt-3 text-xs text-blue-600 flex items-center gap-1">
              <Info className="w-3 h-3" />
              {shouldShowSpecialty()
                ? 'Para docentes de Bachillerato: Nivel, Sección y Especialidad son obligatorios'
                : 'Para docentes: Nivel y Sección son obligatorios'}
            </p>
          </div>
        )}

        {/* Loading indicator */}
        {loadingData && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 rounded-r-lg">
            <div className="flex items-center gap-3">
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 animate-spin" />
              <p className="text-blue-700 text-xs sm:text-sm font-medium">
                Cargando datos de catálogos...
              </p>
            </div>
          </div>
        )}

        {/* Verificación */}
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border-2 border-gray-200">
          <label className="flex items-center gap-3 sm:gap-4 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-12 h-7 sm:w-14 sm:h-8 rounded-full transition-all duration-300 ${isVerified ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                <div className={`absolute top-1 left-1 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${isVerified ? 'translate-x-5 sm:translate-x-6' : ''
                  }`}></div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-sm sm:text-base">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Usuario Verificado</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Los usuarios verificados tienen acceso completo al sistema
              </p>
            </div>
          </label>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
          <button
            type="submit"
            disabled={loadingData}
            className={`cursor-pointer flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base ${loadingData
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600'
              }`}
          >
            {id ? <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />}
            <span>{id ? 'Actualizar Usuario' : 'Registrar Usuario'}</span>
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="cursor-pointer px-4 sm:px-6 py-3 sm:py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <XCircle className="w-5 h-5" />
              <span>Cancelar</span>
            </button>
          )}
        </div>
      </form>

      {/* Info adicional */}
      <div className="mt-4 sm:mt-6 bg-orange-50 border-l-4 border-orange-500 p-3 sm:p-4 rounded-r-lg">
        <div className="flex gap-2 sm:gap-3">
          <Info className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 flex-shrink-0" />
          <div className="flex-1 text-xs sm:text-sm text-gray-700">
            <p className="font-bold text-gray-900 mb-1">Campos obligatorios</p>
            <p>Todos los campos marcados con (*) son obligatorios{id && ', excepto la contraseña al editar'}</p>
            {role === 'Docente' && (
              <p className="mt-1 text-blue-700 font-semibold">
                {shouldShowSpecialty()
                  ? 'Para docentes de Bachillerato: Nivel, Sección y Especialidad son obligatorios'
                  : 'Para docentes: Nivel y Sección son obligatorios'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;