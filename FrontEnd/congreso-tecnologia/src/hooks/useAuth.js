// =====================================================
// Hook personalizado para manejo de autenticación
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { useState, useEffect } from 'react';
import { isSuperAdmin } from '../utils/adminUtils';
import { getApiUrl } from '../config/api';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPermissions, setAdminPermissions] = useState({});
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');


      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        // Verificar si es administrador
        await checkAdminStatus(parsedUser, token);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
        setAdminPermissions({});
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setAdminPermissions({});
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData, token) => {
    try {
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      
      // Verificar si es administrador después del login
      await checkAdminStatus(userData, token);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setAdminPermissions({});
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Función para verificar el estado de administrador
  const checkAdminStatus = async (userData, token) => {
    if (!userData || !token) {
      return;
    }

    try {
      setPermissionsLoading(true);
      
      // Verificación local rápida
      const isLocalAdmin = userData?.tipo_usuario?.nombre_tipo_usuario === 'administrador' || userData?.es_administrador === true;
      
      if (isLocalAdmin) {
        // Si es admin local, verificar permisos completos con la API
        const hasPermissions = await checkAdminPermissions(userData, token);
        setIsAdmin(hasPermissions);
      } else {
        setIsAdmin(false);
        setAdminPermissions({});
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setAdminPermissions({});
    } finally {
      setPermissionsLoading(false);
    }
  };

  const getUserInscriptions = async () => {
    if (!isAuthenticated) {
      return [];
    }

    try {
      const token = getAuthToken();
      if (!token) {
        return [];
      }

      const response = await fetch(getApiUrl('/api/activities/user/inscriptions'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        return result.success ? result.data || [] : [];
      }
    } catch (error) {
      console.error('Error fetching user inscriptions:', error);
    }

    return [];
  };

  const checkAdminPermissions = async (userData = null, token = null) => {
    const currentUser = userData || user;
    const currentToken = token || getAuthToken();
    
    if (!currentUser || !currentToken) {
      return false;
    }

    try {
      const apiUrl = getApiUrl(`/api/users/${currentUser.id_usuario}/permissions`);
      
      // Verificar si el usuario es administrador usando la API
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data && result.data.permisos) {
          const permissions = result.data.permisos;
          setAdminPermissions(permissions);
          
          // Verificar si tiene permisos de administrador
          const hasAdminAccess = permissions.acceso_admin === true || 
                                permissions.gestionar_usuarios === true || 
                                permissions.ver_estadisticas === true ||
                                permissions.gestionar_actividades === true ||
                                permissions.ver_reportes === true;
          
          return hasAdminAccess;
        } else {
          return false;
        }
      } else if (response.status === 403) {
        // Usuario no tiene permisos para acceder a este endpoint
        console.warn('Usuario no tiene permisos para acceder al endpoint de permisos');
        return false;
      } else {
        // Otro error HTTP
        console.error('Error HTTP al verificar permisos:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error checking admin permissions:', error);
    }

    // Fallback: procesar permisos desde permisos_especiales
    
    if (currentUser?.permisos_especiales && Array.isArray(currentUser.permisos_especiales)) {
      const localPermissions = {};
      
      // Procesar cada permiso en el array
      currentUser.permisos_especiales.forEach((permiso, index) => {
        
        if (typeof permiso === 'string') {
          localPermissions[permiso] = true;
        } else if (typeof permiso === 'object' && permiso !== null) {
          // Si es un objeto, agregar sus propiedades
          Object.keys(permiso).forEach(key => {
            localPermissions[key] = permiso[key];
          });
        }
      });
      
      setAdminPermissions(localPermissions);
      
      // Verificar si tiene permisos de administrador
      const hasAdminAccess = localPermissions.acceso_admin === true || 
                            localPermissions.gestionar_usuarios === true || 
                            localPermissions.ver_estadisticas === true ||
                            localPermissions.gestionar_actividades === true ||
                            localPermissions.ver_reportes === true ||
                            localPermissions.gestionar_asistencia === true ||
                            localPermissions.gestionar_diplomas === true;
      
      
      return hasAdminAccess;
    }

    // Último fallback: verificar campos básicos del usuario
    const fallbackResult = currentUser?.tipo_usuario?.nombre_tipo_usuario === 'administrador' || currentUser?.es_administrador === true;
    return fallbackResult;
  };

  // Función para verificar si tiene un permiso específico
  const hasPermission = (permission) => {
    if (!isAdmin) return false;
    
    // Super admin tiene acceso a todo
    if (isSuperAdmin(user, adminPermissions)) {
      return true;
    }
    
    // Verificar permisos desde adminPermissions (ya procesados)
    if (adminPermissions && adminPermissions[permission] === true) {
      return true;
    }
    
    // Mapeo de permisos del frontend a la base de datos
    const permissionMapping = {
      'gestionar_actividades': 'gestion_actividades',
      'ver_estadisticas': 'ver_estadisticas',
      'gestionar_asistencia': 'gestionar_asistencia',
      'gestionar_diplomas': 'gestionar_diplomas',
      'ver_reportes': 'ver_reportes',
      'gestionar_usuarios': 'gestionar_usuarios',
      'gestionar_administradores': 'gestionar_administradores',
      'gestionar_sistema': 'gestionar_sistema',
      'gestionar_pagos': 'gestionar_pagos'
    };
    
    // Verificar con mapeo
    const mappedPermission = permissionMapping[permission];
    if (mappedPermission && adminPermissions && adminPermissions[mappedPermission] === true) {
      return true;
    }
    
    // Fallback: verificar permisos desde permisos_especiales locales
    if (user?.permisos_especiales && Array.isArray(user.permisos_especiales)) {
      
      const hasLocalPermission = user.permisos_especiales.some((permiso, index) => {
        
        if (typeof permiso === 'string') {
          const matches = permiso === permission || permiso === mappedPermission;
          return matches;
        } else if (typeof permiso === 'object' && permiso !== null) {
          const hasProperty = permiso[permission] === true || permiso[mappedPermission] === true;
          return hasProperty;
        }
        return false;
      });
      
      
      if (hasLocalPermission) {
        return true;
      }
    }
    
    return false;
  };

  // Función para obtener todos los permisos
  const getPermissions = () => {
    // Si hay permisos de la API, usarlos
    if (adminPermissions && Object.keys(adminPermissions).length > 0) {
      return adminPermissions;
    }
    
    // Fallback: procesar permisos locales
    if (user?.permisos_especiales && Array.isArray(user.permisos_especiales)) {
      const localPermissions = {};
      
      user.permisos_especiales.forEach((permiso, index) => {
        if (typeof permiso === 'string') {
          localPermissions[permiso] = true;
        } else if (typeof permiso === 'object' && permiso !== null) {
          Object.keys(permiso).forEach(key => {
            localPermissions[key] = permiso[key];
          });
        }
      });
      
      return localPermissions;
    }
    
    return {};
  };

  // Función para verificar si es administrador (estado actual)
  const isUserAdmin = () => {
    return isAdmin;
  };

  // Función para verificar si es super administrador
  const isUserSuperAdmin = () => {
    return isSuperAdmin(user, adminPermissions);
  };

  return {
    isAuthenticated,
    user,
    loading,
    isAdmin,
    adminPermissions,
    permissionsLoading,
    login,
    logout,
    getAuthToken,
    getUserInscriptions,
    checkAuthStatus,
    checkAdminPermissions,
    hasPermission,
    getPermissions,
    isUserAdmin,
    isUserSuperAdmin
  };
};
