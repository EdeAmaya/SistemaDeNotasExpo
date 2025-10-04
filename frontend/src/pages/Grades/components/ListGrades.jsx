import React, { useState } from "react";
import { List, LayoutGrid, Search } from "lucide-react";
import GradeCard from "./GradeCard";

const ListGrades = ({ rubrics, loading, deleteGrade, editGrade }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");

  // Filtrar por búsqueda
  const filteredGrades = rubrics.filter((grade) => {
    const search = searchTerm.toLowerCase();
    return (
      grade.projectId?.projectName?.toLowerCase().includes(search) ||
      grade.rubricId?.rubricName?.toLowerCase().includes(search) ||
      grade.projectId?.studentId?.name?.toLowerCase().includes(search)
    );
  });

  // Estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
          <p className="mt-4 text-gray-600 font-semibold">Cargando evaluaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Barra de búsqueda y vista */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 max-w-2xl">
          <div className="relative group">
            <input
              type="text"
              placeholder="Buscar evaluaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all text-sm font-medium placeholder-gray-400"
            />
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Botones de vista */}
        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-lg">
          <button
            onClick={() => setViewMode("list")}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-all ${
              viewMode === "list"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Lista</span>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-all ${
              viewMode === "grid"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Tarjetas</span>
          </button>
        </div>
      </div>

      {/* Lista o Grid */}
      {filteredGrades.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredGrades.map((grade) => (
            <GradeCard
              key={grade._id}
              grade={grade}
              deleteGrade={deleteGrade}
              editGrade={editGrade}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-50 mb-4">
            <Search className="w-10 h-10 text-yellow-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {searchTerm
              ? "No se encontraron resultados"
              : "No hay evaluaciones registradas"}
          </h3>
          <p className="text-gray-600">
            {searchTerm
              ? "Intenta con otros términos de búsqueda"
              : "Comienza asignando notas a los proyectos"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ListGrades;
