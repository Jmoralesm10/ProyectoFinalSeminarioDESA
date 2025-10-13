// =====================================================
// Componente para mostrar permisos del usuario
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import './UserPermissions.css';

const UserPermissions = () => {
  const { user, isAdmin, adminPermissions, hasPermission, permissionsLoading } = useAuth();

  if (!user) {
    return null;
  }

  const allPermissions = [
    { key: 'gestionar_usuarios', label: 'Gestión de Usuarios', icon: '👥' },
    { key: 'gestionar_actividades', label: 'Gestión de Actividades', icon: '🎯' },
    { key: 'ver_estadisticas', label: 'Ver Estadísticas', icon: '📊' },
    { key: 'ver_reportes', label: 'Ver Reportes', icon: '📋' },
    { key: 'gestionar_asistencia', label: 'Gestión de Asistencia', icon: '📱' },
    { key: 'gestionar_administradores', label: 'Gestión de Administradores', icon: '🔐' },
    { key: 'gestionar_sistema', label: 'Gestión del Sistema', icon: '⚙️' },
    { key: 'gestionar_diplomas', label: 'Gestión de Diplomas', icon: '🏆' },
    { key: 'gestionar_pagos', label: 'Gestión de Pagos', icon: '💳' },
    { key: 'acceso_admin', label: 'Acceso de Administrador', icon: '🔑' }
  ];

  // Verificar si es super admin
  const isSuperAdmin = user?.permisos_especiales && Array.isArray(user.permisos_especiales) &&
    user.permisos_especiales.some(item => 
      typeof item === 'object' && item.rol_administrador === 'super_admin'
    );

  if (permissionsLoading) {
    return (
      <div className="user-permissions">
        <div className="permissions-loading">
          <div className="loading-spinner"></div>
          <p>Cargando permisos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-permissions">
      <div className="permissions-header">
        <h3>🔐 Permisos del Usuario</h3>
        <div className="user-info">
          <span className="user-name">{user.nombre_usuario} {user.apellido_usuario}</span>
          <span className={`user-role ${isAdmin ? 'admin' : 'user'}`}>
            {isSuperAdmin ? '👑 Super Administrador' : (isAdmin ? '👑 Administrador' : '👤 Usuario')}
          </span>
        </div>
      </div>

      {isAdmin ? (
        <div className="permissions-content">
          <div className="permissions-grid">
            {allPermissions.map((permission) => {
              // Definir qué permisos son solo para super admin
              const superAdminOnlyPermissions = [
                'gestionar_usuarios',
                'gestionar_administradores', 
                'gestionar_sistema',
                'gestionar_pagos'
              ];
              
              let hasThisPermission = false;
              let statusText = '';
              
              if (isSuperAdmin) {
                hasThisPermission = true;
                statusText = '👑 Super Admin';
              } else if (superAdminOnlyPermissions.includes(permission.key)) {
                hasThisPermission = false;
                statusText = '❌ Solo Super Admin';
              } else {
                hasThisPermission = hasPermission(permission.key);
                statusText = hasThisPermission ? '✅ Concedido' : '❌ Denegado';
              }
              
              return (
                <div 
                  key={permission.key} 
                  className={`permission-item ${hasThisPermission ? 'granted' : 'denied'}`}
                >
                  <div className="permission-icon">{permission.icon}</div>
                  <div className="permission-info">
                    <span className="permission-label">{permission.label}</span>
                    <span className={`permission-status ${hasThisPermission ? 'granted' : 'denied'}`}>
                      {statusText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="permissions-summary">
            <h4>Resumen de Permisos</h4>
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-number">
                  {isSuperAdmin ? allPermissions.length : allPermissions.filter(p => hasPermission(p.key)).length}
                </span>
                <span className="stat-label">
                  {isSuperAdmin ? 'Permisos Totales (Super Admin)' : 'Permisos Concedidos'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {isSuperAdmin ? 0 : allPermissions.filter(p => !hasPermission(p.key)).length}
                </span>
                <span className="stat-label">Permisos Denegados</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-permissions">
          <div className="no-permissions-icon">👤</div>
          <h4>Usuario Regular</h4>
          <p>Este usuario no tiene permisos de administrador.</p>
          <div className="user-type-info">
            <span className="user-type-badge">
              {user.tipo_usuario === 'interno' ? 'Estudiante Interno' : 'Estudiante Externo'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPermissions;
