// =====================================================
// Panel de Administración
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AdminGuard from '../AdminGuard/AdminGuard';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user, isAdmin, adminPermissions, hasPermission, permissionsLoading, getPermissions } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    // Simular tiempo de carga para mostrar el estado
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Funciones de navegación para acciones rápidas
  const handleNavigateToStats = () => {
    navigate('/estadisticas');
  };

  const handleNavigateToAttendance = () => {
    navigate('/asistencia');
  };

  const handleNavigateToUsers = () => {
    navigate('/gestion-usuarios');
  };

  const handleNavigateToActivities = () => {
    navigate('/gestion-actividades');
  };

  const handleNavigateToReports = () => {
    navigate('/generar-reportes');
  };

  const handleNavigateToDiplomas = () => {
    // TODO: Implementar página de gestión de diplomas
    console.log('Navegar a gestión de diplomas');
  };

  // Definir las funcionalidades disponibles como botones principales
  const adminFeatures = [
    {
      id: 'estadisticas',
      title: 'Ver Estadísticas',
      description: 'Ver estadísticas y reportes del sistema',
      icon: '📊',
      permission: 'ver_estadisticas',
      superAdminOnly: false,
      onClick: handleNavigateToStats,
      color: 'primary'
    },
    {
      id: 'usuarios',
      title: 'Gestionar Usuarios',
      description: 'Administrar usuarios del sistema',
      icon: '👥',
      permission: 'gestionar_usuarios',
      superAdminOnly: true,
      onClick: handleNavigateToUsers,
      color: 'secondary'
    },
    {
      id: 'actividades',
      title: 'Gestionar Actividades',
      description: 'Crear y administrar actividades del congreso',
      icon: '🎯',
      permission: 'gestionar_actividades',
      superAdminOnly: false,
      onClick: handleNavigateToActivities,
      color: 'secondary'
    },
    {
      id: 'asistencia',
      title: 'Tomar Asistencia',
      description: 'Administrar asistencias y códigos QR',
      icon: '📱',
      permission: 'gestionar_asistencia',
      superAdminOnly: false,
      onClick: handleNavigateToAttendance,
      color: 'secondary'
    },
    {
      id: 'reportes',
      title: 'Generar Reportes',
      description: 'Generar reportes detallados',
      icon: '📋',
      permission: 'ver_reportes',
      superAdminOnly: false,
      onClick: handleNavigateToReports,
      color: 'secondary'
    },
    {
      id: 'diplomas',
      title: 'Gestionar Diplomas',
      description: 'Generar y administrar diplomas',
      icon: '🏆',
      permission: 'gestionar_diplomas',
      superAdminOnly: false,
      onClick: handleNavigateToDiplomas,
      color: 'secondary'
    },
    {
      id: 'administradores',
      title: 'Gestionar Administradores',
      description: 'Administrar otros administradores del sistema',
      icon: '🔐',
      permission: 'gestionar_administradores',
      superAdminOnly: true,
      onClick: () => console.log('Navegar a gestión de administradores'),
      color: 'secondary'
    },
    {
      id: 'sistema',
      title: 'Configuración del Sistema',
      description: 'Configuraciones generales del sistema',
      icon: '⚙️',
      permission: 'gestionar_sistema',
      superAdminOnly: true,
      onClick: () => console.log('Navegar a configuración del sistema'),
      color: 'secondary'
    },
    {
      id: 'pagos',
      title: 'Gestionar Pagos',
      description: 'Administrar pagos y transacciones',
      icon: '💳',
      permission: 'gestionar_pagos',
      superAdminOnly: true,
      onClick: () => console.log('Navegar a gestión de pagos'),
      color: 'secondary'
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
        <div className="admin-container">
          <div className="admin-header">
            <Link to="/" className="back-button">
              <span>←</span>
              Volver al Inicio
            </Link>
            <h1>🔧 Panel de Administración</h1>
            <p>Bienvenido, {user?.nombre_usuario} {user?.apellido_usuario}</p>
            <div className="admin-info">
              <span className="admin-badge">Administrador</span>
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
              
              if (!hasFeaturePermission) {
                return null; // No mostrar funcionalidades sin permisos
              }
              
              return (
                <button 
                  key={feature.id} 
                  className={`feature-btn ${feature.color}`}
                  onClick={feature.onClick}
                >
                  <div className="feature-icon">{feature.icon}</div>
                  <div className="feature-content">
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </button>
              );
            })}
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
};

export default AdminPanel;
