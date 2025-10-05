import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const useDataProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [id, setId] = useState("");
    const [projectId, setProjectId] = useState("");
    const [projectName, setProjectName] = useState("");
    const [googleSitesLink, setGoogleSitesLink] = useState("");
    const [idLevel, setIdLevel] = useState("");
    const [idSection, setIdSection] = useState("");
    const [status, setStatus] = useState("Activo");
    const [teamNumber, setTeamNumber] = useState(1);
    const [assignedStudents, setAssignedStudents] = useState([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState("");

    const API = "https://stc-instituto-tecnico-ricaldone.onrender.com/api/projects";

    // Obtener todos los proyectos
    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await fetch(API, {
                credentials: 'include' // ← AGREGADO
            });
            if (!response.ok) {
                throw new Error("Error al obtener los proyectos");
            }
            const data = await response.json();
            setProjects(data);
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al cargar los proyectos");
        } finally {
            setLoading(false);
        }
    };

    // Verificar si un ID de proyecto es único
    const checkProjectId = async (projId, excludeId = null) => {
        try {
            const response = await fetch(API, {
                credentials: 'include' // ← AGREGADO
            });
            if (response.ok) {
                const allProjects = await response.json();
                
                // Si estamos editando, excluir el proyecto actual de la validación
                const filteredProjects = excludeId ? 
                    allProjects.filter(project => project._id !== excludeId) : 
                    allProjects;
                
                const existingProject = filteredProjects.find(
                    project => project.projectId.toLowerCase() === projId.toLowerCase()
                );
                
                if (existingProject) {
                    return {
                        exists: true,
                        message: `El ID ${projId} ya está asignado al proyecto: ${existingProject.projectName}`
                    };
                } else {
                    return {
                        exists: false,
                        message: 'ID disponible'
                    };
                }
            }
            return { exists: false, message: 'Error al verificar ID' };
        } catch (error) {
            console.error('Error verificando ID:', error);
            return { exists: false, message: 'Error al verificar ID' };
        }
    };

    // Guardar nuevo proyecto
    const saveProject = async (e) => {
        e.preventDefault();
        
        if (!projectId || !projectName || !idLevel || !teamNumber) {
            toast.error("Por favor completa todos los campos obligatorios");
            return;
        }

        // Verificar ID único antes de enviar
        const idCheck = await checkProjectId(projectId);
        if (idCheck.exists) {
            toast.error(idCheck.message);
            return;
        }

        try {
            const newProject = {
                projectId: projectId.trim(),
                projectName: projectName.trim(),
                googleSitesLink: googleSitesLink.trim() || null,
                idLevel,
                idSection: idSection || null,
                selectedSpecialty: selectedSpecialty || null,
                status,
                teamNumber: teamNumber,
                assignedStudents: assignedStudents || []
            };

            console.log('Enviando proyecto:', newProject);

            const response = await fetch(API, {
                method: "POST",
                credentials: 'include', // ← AGREGADO
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newProject),
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.error === "DUPLICATE_PROJECT_ID") {
                    toast.error(result.message);
                } else {
                    throw new Error(result.message || "Error al registrar el proyecto");
                }
                return;
            }

            toast.success('Proyecto registrado exitosamente');
            await fetchProjects();
            clearForm();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al registrar el proyecto");
        }
    };

    // Eliminar proyecto
    const deleteProject = async (projectId) => {
        try {
            const response = await fetch(`${API}/${projectId}`, {
                method: "DELETE",
                credentials: 'include', // ← AGREGADO
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Error al eliminar el proyecto");
            }

            toast.success('Proyecto eliminado exitosamente');
            await fetchProjects();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al eliminar el proyecto");
        }
    };

    // Preparar proyecto para edición
    const updateProject = (project) => {
        console.log('Cargando proyecto para editar:', project);
        
        setId(project._id);
        setProjectId(project.projectId);
        setProjectName(project.projectName);
        setGoogleSitesLink(project.googleSitesLink || "");
        setIdLevel(project.idLevel?._id || project.idLevel || "");
        setIdSection(project.idSection?._id || project.idSection || "");
        setStatus(project.status || "Activo");
        setTeamNumber(project.teamNumber || 1);
        setAssignedStudents(project.assignedStudents || []);
        
        // Cargar especialidad si existe
        if (project.selectedSpecialty) {
            setSelectedSpecialty(project.selectedSpecialty._id || project.selectedSpecialty || "");
        } else {
            setSelectedSpecialty("");
        }
    };

    // Editar proyecto existente
    const handleEdit = async (e) => {
        e.preventDefault();

        if (!projectId || !projectName || !idLevel || !teamNumber) {
            toast.error("Por favor completa todos los campos obligatorios");
            return;
        }

        // Verificar ID único antes de enviar (excluyendo el proyecto actual)
        const idCheck = await checkProjectId(projectId, id);
        if (idCheck.exists) {
            toast.error(idCheck.message);
            return;
        }

        try {
            const editProject = {
                projectId: projectId.trim(),
                projectName: projectName.trim(),
                googleSitesLink: googleSitesLink.trim() || null,
                idLevel,
                idSection: idSection || null,
                selectedSpecialty: selectedSpecialty || null,
                status,
                teamNumber: teamNumber,
                assignedStudents: assignedStudents || []
            };

            console.log('Editando proyecto:', editProject);

            const response = await fetch(`${API}/${id}`, {
                method: "PUT",
                credentials: 'include', // ← AGREGADO
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editProject),
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.error === "DUPLICATE_PROJECT_ID") {
                    toast.error(result.message);
                } else {
                    throw new Error(result.message || "Error al actualizar el proyecto");
                }
                return;
            }

            toast.success('Proyecto actualizado exitosamente');
            await fetchProjects();
            clearForm();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al actualizar el proyecto");
        }
    };

    // Limpiar formulario
    const clearForm = () => {
        setId("");
        setProjectId("");
        setProjectName("");
        setGoogleSitesLink("");
        setIdLevel("");
        setIdSection("");
        setStatus("Activo");
        setTeamNumber(1);
        setAssignedStudents([]);
        setSelectedSpecialty("");
    };

    // Cargar proyectos al montar el componente
    useEffect(() => {
        fetchProjects();
    }, []);

    return {
        // Estados
        projects,
        loading,
        id,
        projectId,
        projectName,
        googleSitesLink,
        idLevel,
        idSection,
        status,
        teamNumber,
        assignedStudents,
        selectedSpecialty,
        
        // Setters
        setProjectId,
        setProjectName,
        setGoogleSitesLink,
        setIdLevel,
        setIdSection,
        setStatus,
        setTeamNumber,
        setAssignedStudents,
        setSelectedSpecialty,
        
        // Funciones
        fetchProjects,
        saveProject,
        deleteProject,
        updateProject,
        handleEdit,
        clearForm,
        checkProjectId
    };
};

export default useDataProjects;