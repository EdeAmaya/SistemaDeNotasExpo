import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const useDataStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [id, setId] = useState("");
    const [studentCode, setStudentCode] = useState("");
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [idLevel, setIdLevel] = useState("");
    const [idSection, setIdSection] = useState("");
    const [idSpecialty, setIdSpecialty] = useState("");
    const [projectId, setProjectId] = useState("");

    const API = "http://localhost:4000/api/students";

    // Obtener todos los estudiantes
    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await fetch(API, {
                credentials: 'include' // ← AGREGADO
            });
            if (!response.ok) {
                throw new Error("Error al obtener los estudiantes");
            }
            const data = await response.json();
            setStudents(data);
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al cargar los estudiantes");
        } finally {
            setLoading(false);
        }
    };

    // Verificar si un código de estudiante es único
    const checkStudentCode = async (code, excludeId = null) => {
        try {
            let url = `${API}/check-code/${code}`;
            if (excludeId) {
                url += `?excludeId=${excludeId}`;
            }

            const response = await fetch(url, {
                credentials: 'include' // ← AGREGADO
            });
            if (response.ok) {
                const result = await response.json();
                return result;
            }
            return { exists: false, message: 'Error al verificar código' };
        } catch (error) {
            console.error('Error verificando código:', error);
            return { exists: false, message: 'Error al verificar código' };
        }
    };

    // Guardar nuevo estudiante
    const saveStudent = async (e) => {
        e.preventDefault();

        if (!studentCode || !name || !lastName || !idLevel || !idSection) {
            toast.error("Por favor completa todos los campos obligatorios");
            return;
        }

        // Verificar código único antes de enviar
        const codeCheck = await checkStudentCode(studentCode);
        if (codeCheck.exists) {
            toast.error(codeCheck.message);
            return;
        }

        try {
            const newStudent = {
                studentCode: parseInt(studentCode),
                name: name.trim(),
                lastName: lastName.trim(),
                idLevel,
                idSection,
                idSpecialty: idSpecialty || null,
                projectId: projectId || null
            };

            const response = await fetch(API, {
                method: "POST",
                credentials: 'include', // ← AGREGADO
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newStudent),
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.error === "DUPLICATE_CODE") {
                    toast.error(result.message);
                } else {
                    throw new Error(result.message || "Error al registrar el estudiante");
                }
                return;
            }

            toast.success('Estudiante registrado exitosamente');
            await fetchStudents();
            clearForm();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al registrar el estudiante");
        }
    };

    // Eliminar estudiante
    const deleteStudent = async (studentId) => {
        try {
            const response = await fetch(`${API}/${studentId}`, {
                method: "DELETE",
                credentials: 'include', // ← AGREGADO
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Error al eliminar el estudiante");
            }

            toast.success('Estudiante eliminado exitosamente');
            await fetchStudents();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al eliminar el estudiante");
        }
    };

    // Preparar estudiante para edición
    const updateStudent = (student) => {
        setId(student._id);
        setStudentCode(student.studentCode.toString());
        setName(student.name);
        setLastName(student.lastName);
        setIdLevel(student.idLevel?._id || student.idLevel || "");
        setIdSection(student.idSection?._id || student.idSection || "");
        setIdSpecialty(student.idSpecialty?._id || student.idSpecialty || "");
        setProjectId(student.projectId?._id || student.projectId || "");
    };

    // Editar estudiante existente
    const handleEdit = async (e) => {
        e.preventDefault();

        if (!studentCode || !name || !lastName || !idLevel || !idSection) {
            toast.error("Por favor completa todos los campos obligatorios");
            return;
        }

        // Verificar código único antes de enviar (excluyendo el estudiante actual)
        const codeCheck = await checkStudentCode(studentCode, id);
        if (codeCheck.exists) {
            toast.error(codeCheck.message);
            return;
        }

        try {
            const editStudent = {
                studentCode: parseInt(studentCode),
                name: name.trim(),
                lastName: lastName.trim(),
                idLevel,
                idSection,
                idSpecialty: idSpecialty || null,
                projectId: projectId || null
            };

            const response = await fetch(`${API}/${id}`, {
                method: "PUT",
                credentials: 'include', // ← AGREGADO
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editStudent),
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.error === "DUPLICATE_CODE") {
                    toast.error(result.message);
                } else {
                    throw new Error(result.message || "Error al actualizar el estudiante");
                }
                return;
            }

            toast.success('Estudiante actualizado exitosamente');
            await fetchStudents();
            clearForm();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al actualizar el estudiante");
        }
    };

    // Limpiar formulario
    const clearForm = () => {
        setId("");
        setStudentCode("");
        setName("");
        setLastName("");
        setIdLevel("");
        setIdSection("");
        setIdSpecialty("");
        setProjectId("");
    };

    const refreshStudents = async () => {
        await fetchStudents();
    };

    const deleteAllStudents = async () => {
        try {
            const response = await fetch(`${API}/students/delete-all`, {
                method: "DELETE",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Error al eliminar todos los estudiantes");
            }

            toast.success(result.message);
            await fetchStudents();
            return true;
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al eliminar todos los estudiantes");
            return false;
        }
    };

    // Cargar estudiantes al montar el componente
    useEffect(() => {
        fetchStudents();
    }, []);

    return {
        // Estados
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

        // Setters
        setStudentCode,
        setName,
        setLastName,
        setIdLevel,
        setIdSection,
        setIdSpecialty,
        setProjectId,

        // Funciones
        fetchStudents,
        saveStudent,
        deleteStudent,
        updateStudent,
        handleEdit,
        clearForm,
        checkStudentCode,
        refreshStudents,
        deleteAllStudents
    };
};

export default useDataStudents;