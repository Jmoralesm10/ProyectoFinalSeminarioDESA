// =====================================================
// Panel de Administración
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AdminGuard from '../AdminGuard/AdminGuard';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user, isAdmin, adminPermissions, hasPermission, permissionsLoading, getPermissions } = useAuth();
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    // Simular tiempo de carga para mostrar el estado
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const adminFeatures = [
    {
      id: 'usuarios',
      title: 'Gestión de Usuarios',
      description: 'Administrar usuarios del sistema',
      icon: '👥',
      permission: 'gestionar_usuarios',
      superAdminOnly: true
    },
    {
      id: 'actividades',
      title: 'Gestión de Actividades',
      description: 'Crear y administrar actividades del congreso',
      icon: '🎯',
      permission: 'gestionar_actividades',
      superAdminOnly: false
    },
    {
      id: 'estadisticas',
      title: 'Estadísticas',
      description: 'Ver estadísticas y reportes del sistema',
      icon: '📊',
      permission: 'ver_estadisticas',
      superAdminOnly: false
    },
    {
      id: 'reportes',
      title: 'Reportes',
      description: 'Generar reportes detallados',
      icon: '📋',
      permission: 'ver_reportes',
      superAdminOnly: false
    },
    {
      id: 'asistencia',
      title: 'Gestión de Asistencia',
      description: 'Administrar asistencias y códigos QR',
      icon: '📱',
      permission: 'gestionar_asistencia',
      superAdminOnly: false
    },
    {
      id: 'administradores',
      title: 'Gestión de Administradores',
      description: 'Administrar otros administradores del sistema',
      icon: '🔐',
      permission: 'gestionar_administradores',
      superAdminOnly: true
    },
    {
      id: 'sistema',
      title: 'Configuración del Sistema',
      description: 'Configuraciones generales del sistema',
      icon: '⚙️',
      permission: 'gestionar_sistema',
      superAdminOnly: true
    },
    {
      id: 'diplomas',
      title: 'Gestión de Diplomas',
      description: 'Generar y administrar diplomas',
      icon: '🏆',
      permission: 'gestionar_diplomas',
      superAdminOnly: false
    },
    {
      id: 'pagos',
      title: 'Gestión de Pagos',
      description: 'Administrar pagos y transacciones',
      icon: '💳',
      permission: 'gestionar_pagos',
      superAdminOnly: true
    }
  ];

  if (loading || permissionsLoading) {
    return (
      <div className="admin-panel">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="admin-panel">
        <div className="admin-header">
          <h1>🔧 Panel de Administración</h1>
          <p>Bienvenido, {user?.nombre_usuario} {user?.apellido_usuario}</p>
          <div className="admin-info">
            <span className="admin-badge">Super Administrador</span>
            <span className="admin-email">{user?.email_usuario}</span>
          </div>
        </div>

        <div className="admin-features">
          <h2>Funcionalidades Disponibles</h2>
          <div className="features-grid">
            {adminFeatures.map((feature) => {
              // Verificar si es super admin
              const isSuperAdmin = user?.permisos_especiales && Array.isArray(user.permisos_especiales) &&
                user.permisos_especiales.some(item => 
                  typeof item === 'object' && item.rol_administrador === 'super_admin'
                );
              
              // Lógica de permisos: Super admin tiene acceso a todo, admin normal solo a funcionalidades permitidas
              let hasFeaturePermission = false;
              let accessType = '';
              
              if (isSuperAdmin) {
                hasFeaturePermission = true;
                accessType = '👑 Super Admin';
              } else if (feature.superAdminOnly) {
                hasFeaturePermission = false;
                accessType = '❌ Solo Super Admin';
              } else {
                hasFeaturePermission = hasPermission(feature.permission);
                accessType = hasFeaturePermission ? '✅ Disponible' : '❌ No disponible';
              }
              
              return (
                <div 
                  key={feature.id} 
                  className={`feature-card ${hasFeaturePermission ? 'available' : 'unavailable'}`}
                >
                  <div className="feature-icon">{feature.icon}</div>
                  <div className="feature-content">
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                    <div className="feature-status">
                      <span className={hasFeaturePermission ? 'status-available' : 'status-unavailable'}>
                        {accessType}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="admin-actions">
          <h2>Acciones Rápidas</h2>
          <div className="actions-grid">
            {(() => {
              // Verificar si es super admin
              const isSuperAdmin = user?.permisos_especiales && Array.isArray(user.permisos_especiales) &&
                user.permisos_especiales.some(item => 
                  typeof item === 'object' && item.rol_administrador === 'super_admin'
                );
              
              return (
                <>
                  {/* Estadísticas - Disponible para admin normal */}
                  {(isSuperAdmin || hasPermission('ver_estadisticas')) && (
                    <button className="action-btn primary">
                      📊 Ver Estadísticas
                    </button>
                  )}
                  
                  {/* Gestión de Usuarios - Solo super admin */}
                  {isSuperAdmin && (
                    <button className="action-btn secondary">
                      👥 Gestionar Usuarios
                    </button>
                  )}
                  
                  {/* Gestión de Actividades - Disponible para admin normal */}
                  {(isSuperAdmin || hasPermission('gestionar_actividades')) && (
                    <button className="action-btn secondary">
                      🎯 Gestionar Actividades
                    </button>
                  )}
                  
                  {/* Gestión de Asistencia - Disponible para admin normal */}
                  {(isSuperAdmin || hasPermission('gestionar_asistencia')) && (
                    <button className="action-btn secondary">
                      📱 Tomar Asistencia
                    </button>
                  )}
                  
                  {/* Reportes - Disponible para admin normal */}
                  {(isSuperAdmin || hasPermission('ver_reportes')) && (
                    <button className="action-btn secondary">
                      📋 Generar Reportes
                    </button>
                  )}
                  
                  {/* Gestión de Diplomas - Disponible para admin normal */}
                  {(isSuperAdmin || hasPermission('gestionar_diplomas')) && (
                    <button className="action-btn secondary">
                      🏆 Gestionar Diplomas
                    </button>
                  )}
                  
                  {/* Configuración del Sistema - Solo super admin */}
                  {isSuperAdmin && (
                    <button className="action-btn secondary">
                      ⚙️ Configuración
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
};

export default AdminPanel;
