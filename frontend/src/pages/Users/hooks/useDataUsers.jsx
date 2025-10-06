import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const useDataUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    
    // Campos académicos (opcionales - solo para Docentes)
    const [idLevel, setIdLevel] = useState("");
    const [idSection, setIdSection] = useState("");
    const [idSpecialty, setIdSpecialty] = useState("");

    const API = "https://stc-instituto-tecnico-ricaldone.onrender.com/api/users";

    // Obtener todos los usuarios
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(API, {
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error("Error al obtener los usuarios");
            }
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al cargar los usuarios");
        } finally {
            setLoading(false);
        }
    };

    // Guardar nuevo usuario
    const saveUser = async (e) => {
        e.preventDefault();
        
        if (!name || !lastName || !email || !password || !role) {
            toast.error("Por favor completa todos los campos obligatorios");
            return;
        }

        try {
            const newUser = {
                name,
                lastName,
                email,
                password,
                role,
                isVerified
            };

            // Agregar campos académicos solo si el rol es Docente y tienen valor
            if (role === 'Docente') {
                if (idLevel) newUser.idLevel = idLevel;
                if (idSection) newUser.idSection = idSection;
                if (idSpecialty) newUser.idSpecialty = idSpecialty;
            }

            const response = await fetch(API, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newUser),
            });

            if (!response.ok) {
                throw new Error("Error al registrar el usuario");
            }

            toast.success('Usuario registrado exitosamente');
            await fetchUsers();
            clearForm();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al registrar el usuario");
        }
    };

    // Eliminar usuario
    const deleteUser = async (userId) => {
        try {
            const response = await fetch(`${API}/${userId}`, {
                method: "DELETE",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Error al eliminar el usuario");
            }

            toast.success('Usuario eliminado exitosamente');
            await fetchUsers();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al eliminar el usuario");
        }
    };

    // Preparar usuario para edición
    const updateUser = (user) => {
        setId(user._id);
        setName(user.name);
        setLastName(user.lastName);
        setEmail(user.email);
        setPassword(""); // Por seguridad no cargar la contraseña
        setRole(user.role);
        setIsVerified(user.isVerified);
        
        // Cargar campos académicos si existen
        setIdLevel(user.idLevel || "");
        setIdSection(user.idSection || "");
        setIdSpecialty(user.idSpecialty || "");
    };

    // Editar usuario existente
    const handleEdit = async (e) => {
        e.preventDefault();

        if (!name || !lastName || !email || !role) {
            toast.error("Por favor completa todos los campos obligatorios");
            return;
        }

        try {
            const editUser = {
                name,
                lastName,
                email,
                role,
                isVerified
            };

            // Solo incluir password si se proporcionó una nueva
            if (password) {
                editUser.password = password;
            }

            // Agregar campos académicos solo si el rol es Docente
            if (role === 'Docente') {
                editUser.idLevel = idLevel || null;
                editUser.idSection = idSection || null;
                editUser.idSpecialty = idSpecialty || null;
            }

            const response = await fetch(`${API}/${id}`, {
                method: "PUT",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editUser),
            });

            if (!response.ok) {
                throw new Error("Error al actualizar el usuario");
            }

            toast.success('Usuario actualizado exitosamente');
            await fetchUsers();
            clearForm();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al actualizar el usuario");
        }
    };

    // Limpiar formulario
    const clearForm = () => {
        setId("");
        setName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setRole("");
        setIsVerified(false);
        setIdLevel("");
        setIdSection("");
        setIdSpecialty("");
    };

    // Cargar usuarios al montar el componente
    useEffect(() => {
        fetchUsers();
    }, []);

    return {
        // Estados
        users,
        loading,
        id,
        name,
        lastName,
        email,
        password,
        role,
        isVerified,
        idLevel,
        idSection,
        idSpecialty,
        
        // Setters
        setName,
        setLastName,
        setEmail,
        setPassword,
        setRole,
        setIsVerified,
        setIdLevel,
        setIdSection,
        setIdSpecialty,
        
        // Funciones
        fetchUsers,
        saveUser,
        deleteUser,
        updateUser,
        handleEdit,
        clearForm
    };
};

export default useDataUsers;