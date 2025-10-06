import React, { useState } from 'react';
import { Award, Download, GraduationCap, Users, BookOpen } from 'lucide-react';
import useLevels from '../hooks/useLevels';
import useSections from '../hooks/useSections';
import useSpecialties from '../hooks/useSpecialties';

const isBachilleratoLevel = (levelName) => {
  const normalized = levelName.toLowerCase();
  return normalized.includes('bachillerato') || 
         normalized.includes('año') ||
         normalized.includes('desarrollo') ||
         normalized.includes('electr') ||
         normalized.includes('mecánica') ||
         normalized.includes('contaduría');
};

const getSectionsForLevel = (levelName, allSections) => {
  const normalizedLevel = levelName.toLowerCase();
  
  if (normalizedLevel.includes('tercer ciclo') || normalizedLevel.includes('3er ciclo')) {
    return allSections.filter(section => 
      /^[A-F]$/i.test(section.sectionName)
    );
  }
  
  if (isBachilleratoLevel(levelName)) {
    return allSections.filter(section => 
      /^[1-9][A-Z]$/i.test(section.sectionName)
    );
  }
  
  return [];
};

const LevelCard = ({ level, sections, specialties }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const levelSections = getSectionsForLevel(level.levelName, sections);
  const isBachillerato = isBachilleratoLevel(level.levelName);

  const handleDownloadDiplomas = () => {
    const downloadData = {
      level: level.levelName,
      levelId: level._id,
      sections: levelSections.map(s => ({
        id: s._id,
        name: s.sectionName
      }))
    };

    if (isBachillerato && selectedSpecialty) {
      downloadData.specialty = {
        id: selectedSpecialty._id,
        name: selectedSpecialty.specialtyName
      };
    } else if (isBachillerato && specialties.length > 0) {
      
      downloadData.specialties = specialties.map(sp => ({
        id: sp._id,
        name: sp.specialtyName
      }));
    }

    console.log('Descargando diplomas para:', downloadData);
    
    const specialtyText = selectedSpecialty 
      ? `\nEspecialidad: ${selectedSpecialty.specialtyName}`
      : isBachillerato && specialties.length > 0
        ? `\nTodas las especialidades (${specialties.length})`
        : '';
    
    alert(`Generando diplomas para:\n\nNivel: ${level.levelName}\nSecciones: ${levelSections.map(s => s.sectionName).join(', ')}${specialtyText}\n\n¡La descarga comenzará en breve!`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header de la card */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-3 rounded-lg shadow-md">
              <GraduationCap className="w-8 h-8 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">{level.levelName}</h3>
              {level.letterLevel && (
                <span className="text-sm font-semibold text-yellow-100">
                  Código: {level.letterLevel}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
            aria-label={isExpanded ? 'Contraer información' : 'Expandir información'}
          >
            <svg 
              className={`w-6 h-6 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body de la card */}
      <div className="p-6">
        {/* Información resumida */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-5 h-5 text-yellow-500" />
            <span className="text-sm">
              <span className="font-bold text-gray-800">{levelSections.length}</span> Secciones
            </span>
          </div>
          {isBachillerato && (
            <div className="flex items-center gap-2 text-gray-600">
              <BookOpen className="w-5 h-5 text-yellow-500" />
              <span className="text-sm">
                <span className="font-bold text-gray-800">{specialties.length}</span> Especialidades
              </span>
            </div>
          )}
        </div>

        {/* Contenido expandible */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            {/* Secciones */}
            <div>
              <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-yellow-600" />
                Secciones Disponibles
              </h4>
              <div className="flex flex-wrap gap-2">
                {levelSections.length > 0 ? (
                  levelSections.map((section) => (
                    <span
                      key={section._id}
                      className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold border border-yellow-200"
                    >
                      {section.sectionName}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm italic">No hay secciones disponibles</span>
                )}
              </div>
              {isBachillerato && (
                <p className="text-xs text-gray-500 mt-2">
                  * Todas las secciones (1A, 1B, 2A, 2B, etc.) están disponibles para este nivel
                </p>
              )}
            </div>

            {/* Especialidades (solo para bachillerato) */}
            {isBachillerato && specialties.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-yellow-600" />
                  Especialidades
                </h4>
                <div className="space-y-2">
                  {/* Opción para todas las especialidades */}
                  <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={`specialty-${level._id}`}
                      checked={selectedSpecialty === null}
                      onChange={() => setSelectedSpecialty(null)}
                      className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      Todas las especialidades
                    </span>
                  </label>
                  
                  {/* Opciones individuales */}
                  {specialties.map((specialty) => (
                    <label 
                      key={specialty._id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`specialty-${level._id}`}
                        checked={selectedSpecialty?._id === specialty._id}
                        onChange={() => setSelectedSpecialty(specialty)}
                        className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                      />
                      <span className="text-sm text-gray-700">
                        {specialty.specialtyName}
                        {specialty.letterSpecialty && (
                          <span className="text-gray-500 ml-1">({specialty.letterSpecialty})</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botón de descarga */}
        <button
          onClick={handleDownloadDiplomas}
          disabled={levelSections.length === 0}
          className={`w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 ${
            levelSections.length === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
        >
          <Download className="w-5 h-5" />
          {selectedSpecialty 
            ? `Descargar - ${selectedSpecialty.specialtyName}` 
            : 'Descargar Diplomas'
          }
        </button>
      </div>
    </div>
  );
};

const DiplomasSection = () => {
  const { levels, loading: loadingLevels, error: errorLevels } = useLevels();
  const { sections, loading: loadingSections } = useSections();
  const { specialties, loading: loadingSpecialties } = useSpecialties();

  const loading = loadingLevels || loadingSections || loadingSpecialties;

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-semibold">Cargando información de diplomas...</p>
        </div>
      </div>
    );
  }

  if (errorLevels) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-800">Error al cargar los datos</h3>
              <p className="text-sm text-red-700 mt-1">{errorLevels}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header de la sección */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Award className="w-8 h-8 text-yellow-500" />
          <h2 className="text-2xl font-black text-gray-800">Generación de Diplomas</h2>
        </div>
        <p className="text-gray-600">
          Selecciona el nivel académico y especialidad (si aplica) para generar y descargar los diplomas correspondientes.
        </p>
      </div>

      {/* Grid de cards de niveles */}
      {levels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level) => (
            <LevelCard
              key={level._id}
              level={level}
              sections={sections}
              specialties={specialties}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">No hay niveles disponibles</h3>
          <p className="text-gray-500">
            No se encontraron niveles académicos en el sistema.
          </p>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded-r-xl">
        <div className="flex items-start gap-3">
          <Award className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-gray-800 mb-2">Información sobre diplomas</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• <strong>Tercer Ciclo:</strong> Secciones A, B, C, D, E, F</li>
              <li>• <strong>Bachillerato:</strong> Todas las secciones (1A, 1B, 2A, 2B, etc.) disponibles por especialidad</li>
              <li>• Puedes generar diplomas para todas las especialidades o seleccionar una específica</li>
              <li>• Los archivos se descargarán en formato PDF</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiplomasSection;