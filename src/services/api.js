// src/services/api.js
// Servicio centralizado para todas las llamadas a la API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://database-io03.onrender.com'
// Helper para manejar respuestas
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || `Error: ${response.status}`);
  }
  return response.json();
};

// Helper para obtener headers con token
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// ======================
// AUTENTICACIÓN
// ======================

export const authAPI = {
  // Login
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(response);
    
    // Guardar token en localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    return data;
  },

  // Registrar usuario
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Obtener perfil actual
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Actualizar perfil
  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  // Cambiar contraseña
  changePassword: async (currentPassword, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return handleResponse(response);
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
  },
};

// ======================
// PACIENTES
// ======================

export const pacientesAPI = {
  // Obtener todos los pacientes (con paginación y búsqueda)
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/pacientes?${queryString}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Obtener paciente por ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/pacientes/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Crear paciente
  create: async (pacienteData) => {
    const response = await fetch(`${API_BASE_URL}/api/pacientes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(pacienteData),
    });
    return handleResponse(response);
  },

  // Actualizar paciente
  update: async (id, pacienteData) => {
    const response = await fetch(`${API_BASE_URL}/api/pacientes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(pacienteData),
    });
    return handleResponse(response);
  },

  // Desactivar paciente
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/pacientes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Búsqueda rápida
  search: async (query) => {
    const response = await fetch(`${API_BASE_URL}/api/pacientes/search/${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// ======================
// PRUEBAS
// ======================

export const pruebasAPI = {
  // Obtener todas las pruebas
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/pruebas?${queryString}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Obtener prueba por ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/pruebas/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Obtener estructura del formulario
  getFormStructure: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/pruebas/${id}/form-structure`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Crear prueba
  create: async (pruebaData) => {
    const response = await fetch(`${API_BASE_URL}/api/pruebas`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(pruebaData),
    });
    return handleResponse(response);
  },

  // Actualizar prueba
  update: async (id, pruebaData) => {
    const response = await fetch(`${API_BASE_URL}/api/pruebas/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(pruebaData),
    });
    return handleResponse(response);
  },

  // Eliminar prueba
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/pruebas/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Agregar sub-prueba
  addSubPrueba: async (id, subPruebaData) => {
    const response = await fetch(`${API_BASE_URL}/api/pruebas/${id}/subpruebas`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(subPruebaData),
    });
    return handleResponse(response);
  },

  // Agregar campo adicional
  addCampoAdicional: async (id, campoData) => {
    const response = await fetch(`${API_BASE_URL}/api/pruebas/${id}/campos-adicionales`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(campoData),
    });
    return handleResponse(response);
  },
};

// ======================
// REPORTES
// ======================

export const reportesAPI = {
  // Obtener todos los reportes (con filtros)
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/reportes?${queryString}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Obtener reporte por ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/reportes/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Buscar por folio
  getByFolio: async (folio) => {
    const response = await fetch(`${API_BASE_URL}/api/reportes/folio/${folio}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Crear reporte
  create: async (reporteData) => {
    const response = await fetch(`${API_BASE_URL}/api/reportes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(reporteData),
    });
    return handleResponse(response);
  },

  // Actualizar reporte
  update: async (id, reporteData) => {
    const response = await fetch(`${API_BASE_URL}/api/reportes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(reporteData),
    });
    return handleResponse(response);
  },

  // Autorizar reporte
  authorize: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/reportes/${id}/autorizar`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Obtener reportes de un paciente
  getByPaciente: async (pacienteId) => {
    const response = await fetch(`${API_BASE_URL}/api/reportes/paciente/${pacienteId}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Obtener estadísticas
  getStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/reportes/stats?${queryString}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Eliminar reporte
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/reportes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// Helper para verificar si hay token
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Helper para obtener el token actual
export const getToken = () => {
  return localStorage.getItem('token');
};

export default {
  auth: authAPI,
  pacientes: pacientesAPI,
  pruebas: pruebasAPI,
  reportes: reportesAPI,
  isAuthenticated,
  getToken,
};