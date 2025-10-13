// =====================================================
// Utilidades para Administradores
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

/**
 * Verifica si un usuario es super administrador
 * @param {Object} user - Objeto usuario
 * @returns {boolean} - true si es super admin, false en caso contrario
 */
export const isSuperAdmin = (user) => {
  if (!user || !user.permisos_especiales || !Array.isArray(user.permisos_especiales)) {
    return false;
  }
  
  return user.permisos_especiales.some(item => 
    typeof item === 'object' && item.rol_administrador === 'super_admin'
  );
};

/**
 * Verifica si un usuario tiene un permiso específico
 * @param {Object} user - Objeto usuario
 * @param {string} permission - Nombre del permiso
 * @param {Function} hasPermission - Función para verificar permisos normales
 * @returns {boolean} - true si tiene el permiso, false en caso contrario
 */
export const hasPermissionOrSuperAdmin = (user, permission, hasPermission) => {
  return isSuperAdmin(user) || hasPermission(permission);
};

/**
 * Verifica si un permiso está disponible para administradores normales
 * @param {string} permission - Nombre del permiso
 * @returns {boolean} - true si está disponible para admin normal, false si es solo super admin
 */
export const isPermissionAvailableForAdmin = (permission) => {
  const superAdminOnlyPermissions = [
    'gestionar_usuarios',
    'gestionar_administradores', 
    'gestionar_sistema',
    'gestionar_pagos'
  ];
  
  return !superAdminOnlyPermissions.includes(permission);
};

/**
 * Verifica si un usuario puede acceder a una funcionalidad específica
 * @param {Object} user - Objeto usuario
 * @param {string} permission - Nombre del permiso
 * @param {Function} hasPermission - Función para verificar permisos normales
 * @returns {Object} - { hasAccess: boolean, accessType: string }
 */
export const checkFeatureAccess = (user, permission, hasPermission) => {
  if (isSuperAdmin(user)) {
    return { hasAccess: true, accessType: '👑 Super Admin' };
  }
  
  if (!isPermissionAvailableForAdmin(permission)) {
    return { hasAccess: false, accessType: '❌ Solo Super Admin' };
  }
  
  const hasNormalPermission = hasPermission(permission);
  return { 
    hasAccess: hasNormalPermission, 
    accessType: hasNormalPermission ? '✅ Disponible' : '❌ No disponible' 
  };
};

/**
 * Obtiene el rol de usuario formateado
 * @param {Object} user - Objeto usuario
 * @param {boolean} isAdmin - Si es administrador
 * @returns {string} - Rol formateado
 */
export const getUserRole = (user, isAdmin) => {
  if (isSuperAdmin(user)) return '👑 Super Administrador';
  if (isAdmin) return '👑 Administrador';
  return user?.tipo_usuario === 'interno' ? 'Estudiante Interno' : 'Estudiante Externo';
};

/**
 * Obtiene el estado de permiso formateado
 * @param {Object} user - Objeto usuario
 * @param {boolean} hasPermission - Si tiene el permiso específico
 * @returns {string} - Estado formateado
 */
export const getPermissionStatus = (user, hasPermission) => {
  if (isSuperAdmin(user)) return '👑 Super Admin';
  if (hasPermission) return '✅ Concedido';
  return '❌ Denegado';
};
