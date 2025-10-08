import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle, XCircle, Loader2, Users, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

const BulkStudentUpload = ({ onUploadComplete, levels, sections, specialties, projects }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState(null);
    const [errors, setErrors] = useState([]);
    const [dragActive, setDragActive] = useState(false);

    const downloadTemplate = () => {
        const templateData = [
            {
                'Código': 20200001,
                'Nombre': 'Juan',
                'Apellido': 'Pérez',
                'Nivel': 'Octavo',
                'Sección': 'A',
                'Especialidad': '',
                'Proyecto': ''
            },
            {
                'Código': 20200002,
                'Nombre': 'María',
                'Apellido': 'González',
                'Nivel': '2° Bachillerato',
                'Sección': '2A',
                'Especialidad': 'Administrativo Contable',
                'Proyecto': ''
            }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Estudiantes');

        const colWidths = [
            { wch: 12 },
            { wch: 20 },
            { wch: 20 },
            { wch: 25 },
            { wch: 12 },
            { wch: 30 },
            { wch: 30 }
        ];
        ws['!cols'] = colWidths;

        XLSX.writeFile(wb, 'plantilla_estudiantes.xlsx');
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange({ target: { files: e.dataTransfer.files } });
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const validTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel'
            ];

            if (!validTypes.includes(selectedFile.type)) {
                alert('Por favor selecciona un archivo Excel válido (.xlsx o .xls)');
                return;
            }

            setFile(selectedFile);
            setResults(null);
            setErrors([]);
        }
    };

    const findByName = (array, name, field = 'name') => {
        if (!name || name.trim() === '') return null;

        const normalized = name.toLowerCase().trim();
        return array.find(item => {
            const itemName = (item[field] || item.levelName || item.sectionName || item.specialtyName || item.projectName || '').toLowerCase().trim();
            return itemName === normalized || itemName.includes(normalized) || normalized.includes(itemName);
        });
    };

    const processExcelFile = async () => {
        if (!file) {
            alert('Por favor selecciona un archivo');
            return;
        }

        setUploading(true);
        setErrors([]);
        setResults(null);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length === 0) {
                throw new Error('El archivo está vacío');
            }

            const studentsToUpload = [];
            const processingErrors = [];

            for (let i = 0; i < jsonData.length; i++) {
                const row = jsonData[i];
                const rowNum = i + 2;
                const rowErrors = [];

                const codigo = row['Código'] || row['Codigo'] || row['código'] || row['codigo'];
                const nombre = row['Nombre'] || row['nombre'];
                const apellido = row['Apellido'] || row['apellido'];
                const nivelName = row['Nivel'] || row['nivel'];
                const seccionName = row['Sección'] || row['Seccion'] || row['sección'] || row['seccion'];
                const especialidadName = row['Especialidad'] || row['especialidad'];
                const proyectoName = row['Proyecto'] || row['proyecto'];

                if (!codigo) rowErrors.push('Código requerido');
                if (!nombre) rowErrors.push('Nombre requerido');
                if (!apellido) rowErrors.push('Apellido requerido');
                if (!nivelName) rowErrors.push('Nivel requerido');
                if (!seccionName) rowErrors.push('Sección requerida');

                const nivel = findByName(levels, nivelName, 'levelName');
                if (nivelName && !nivel) {
                    rowErrors.push(`Nivel "${nivelName}" no encontrado`);
                }

                const seccion = findByName(sections, seccionName, 'sectionName');
                if (seccionName && !seccion) {
                    rowErrors.push(`Sección "${seccionName}" no encontrada`);
                }

                let especialidad = null;
                if (especialidadName && especialidadName.trim() !== '') {
                    especialidad = findByName(specialties, especialidadName, 'name');
                    if (!especialidad) {
                        rowErrors.push(`Especialidad "${especialidadName}" no encontrada`);
                    }
                }

                let proyecto = null;
                if (proyectoName && proyectoName.trim() !== '') {
                    proyecto = findByName(projects, proyectoName, 'projectName');
                    if (!proyecto) {
                        rowErrors.push(`Proyecto "${proyectoName}" no encontrado`);
                    }
                }

                if (rowErrors.length > 0) {
                    processingErrors.push({
                        row: rowNum,
                        student: `${nombre || ''} ${apellido || ''}`.trim() || `Código ${codigo}`,
                        errors: rowErrors
                    });
                } else {
                    studentsToUpload.push({
                        studentCode: parseInt(codigo),
                        name: nombre.trim(),
                        lastName: apellido.trim(),
                        idLevel: nivel._id,
                        idSection: seccion._id,
                        idSpecialty: especialidad ? especialidad._id : null,
                        projectId: proyecto ? proyecto._id : null
                    });
                }
            }

            if (processingErrors.length > 0) {
                setErrors(processingErrors);
                setUploading(false);
                return;
            }

            const response = await fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/students/students/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ students: studentsToUpload })
            });

            const result = await response.json();

            if (response.ok) {
                setResults(result);
                if (result.success > 0 && onUploadComplete) {
                    onUploadComplete();
                }
            } else {
                throw new Error(result.message || 'Error al procesar estudiantes');
            }

        } catch (error) {
            console.error('Error procesando archivo:', error);
            setErrors([{ row: 0, student: 'General', errors: [error.message] }]);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg">
                        <Upload className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Carga Masiva de Estudiantes</h2>
                        <p className="text-sm text-gray-500">Sube un archivo Excel con múltiples estudiantes</p>
                    </div>
                </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg mb-6">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-700">
                        <p className="font-bold text-gray-900 mb-2">Instrucciones:</p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Descarga la plantilla de Excel haciendo clic en el botón de abajo</li>
                            <li>Completa los datos de los estudiantes en la plantilla</li>
                            <li>Los nombres de Nivel, Sección, Especialidad y Proyecto deben coincidir exactamente</li>
                            <li>La Especialidad solo es obligatoria para estudiantes de Bachillerato</li>
                            <li>Sube el archivo completado usando el área de carga</li>
                        </ol>
                    </div>
                </div>
            </div>

            <button
                onClick={downloadTemplate}
                style={{ cursor: 'pointer' }}
                className="w-full mb-6 py-3 px-6 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
                <Download className="w-5 h-5" />
                <span>Descargar Plantilla de Excel</span>
            </button>

            <div
                className={`border-4 border-dashed rounded-2xl p-8 transition-all duration-300 ${dragActive
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="excel-upload"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <label htmlFor="excel-upload" className="cursor-pointer block text-center">
                    <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-bold text-gray-700 mb-2">
                        {file ? file.name : 'Arrastra tu archivo Excel aquí'}
                    </p>
                    <p className="text-sm text-gray-500">
                        o haz clic para seleccionar un archivo (.xlsx, .xls)
                    </p>
                </label>
            </div>

            {file && (
                <div className="mt-6">
                    <button
                        onClick={processExcelFile}
                        disabled={uploading}
                        className={`w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 ${uploading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800'
                            }`}
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Procesando estudiantes...</span>
                            </>
                        ) : (
                            <>
                                <Users className="w-5 h-5" />
                                <span>Cargar Estudiantes</span>
                            </>
                        )}
                    </button>
                </div>
            )}

            {errors.length > 0 && (
                <div className="mt-6 bg-red-50 border-l-4 border-red-500 rounded-r-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <XCircle className="w-6 h-6 text-red-600" />
                        <h3 className="text-lg font-bold text-red-900">Errores encontrados</h3>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {errors.map((error, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-4 border border-red-200">
                                <p className="font-bold text-gray-900 mb-2">
                                    Fila {error.row}: {error.student}
                                </p>
                                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                                    {error.errors.map((err, errIdx) => (
                                        <li key={errIdx}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {results && (
                <div className="mt-6 bg-green-50 border-l-4 border-green-500 rounded-r-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <h3 className="text-lg font-bold text-green-900">Resultados de la carga</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-white rounded-lg p-4 text-center border border-green-200">
                            <div className="text-3xl font-black text-green-600 mb-1">{results.success}</div>
                            <div className="text-sm font-semibold text-gray-600">Exitosos</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border border-red-200">
                            <div className="text-3xl font-black text-red-600 mb-1">{results.failed}</div>
                            <div className="text-sm font-semibold text-gray-600">Fallidos</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                            <div className="text-3xl font-black text-gray-600 mb-1">{results.total}</div>
                            <div className="text-sm font-semibold text-gray-600">Total</div>
                        </div>
                    </div>

                    {results.errors && results.errors.length > 0 && (
                        <div className="mt-4">
                            <p className="font-bold text-gray-900 mb-2">Detalles de errores:</p>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {results.errors.map((error, idx) => (
                                    <div key={idx} className="bg-white rounded p-3 border border-red-200 text-sm">
                                        <p className="font-medium text-gray-900">{error.student}</p>
                                        <p className="text-red-600">{error.error}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BulkStudentUpload;