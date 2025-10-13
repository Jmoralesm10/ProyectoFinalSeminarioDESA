// =====================================================
// Página de Gestión de Usuarios
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminGuard from '../components/AdminGuard/AdminGuard';
import ListUsersModal from '../components/UserManagement/ListUsersModal';
import ChangeUserStatusModal from '../components/UserManagement/ChangeUserStatusModal';
import UserHistoryModal from '../components/UserManagement/UserHistoryModal';
import './UserManagementPage.css';

const UserManagementPage = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);

  // Funciones para abrir modales
  const openModal = (modalType, data = null) => {
    setActiveModal(modalType);
    setModalData(data);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  // Configuración de funcionalidades
  const userManagementFeatures = [
    {
      id: 'manage-users',
      title: 'Gestión Completa de Usuarios',
      description: 'Listar, buscar y ver detalles de todos los usuarios del sistema con filtros avanzados',
      icon: '👥',
      endpoint: 'GET /api/admin/users + GET /api/admin/users/search + Modal de detalles',
      permission: 'gestionar_usuarios',
      onClick: () => navigate('/listar-usuarios'),
      status: 'completed'
    },
    {
      id: 'change-status',
      title: 'Cambiar Estado',
      description: 'Activar o desactivar usuarios',
      icon: '🔄',
      endpoint: 'PUT /api/admin/users/:id/status',
      permission: 'gestionar_usuarios',
      onClick: () => openModal('changeStatus')
    },
    {
      id: 'user-history',
      title: 'Historial Usuario',
      description: 'Ver historial completo de un usuario',
      icon: '📋',
      endpoint: 'GET /api/admin/users/:id/history',
      permission: 'gestionar_usuarios',
      onClick: () => openModal('userHistory')
    }
  ];

  const adminManagementFeatures = [
    {
      id: 'list-admins',
      title: 'Listar Administradores',
      description: 'Ver todos los administradores del sistema',
      icon: '👑',
      endpoint: 'GET /api/admin/admins',
      permission: 'gestionar_usuarios',
      onClick: () => openModal('listAdmins')
    },
    {
      id: 'view-permissions',
      title: 'Ver Permisos',
      description: 'Ver permisos de un usuario específico',
      icon: '🔐',
      endpoint: 'GET /api/admin/permissions/:userId',
      permission: 'gestionar_usuarios',
      onClick: () => openModal('viewPermissions')
    },
    {
      id: 'promote-admin',
      title: 'Promover a Admin',
      description: 'Promover usuario a administrador',
      icon: '⬆️',
      endpoint: 'POST /api/admin/promote/:userId',
      permission: 'gestionar_usuarios',
      onClick: () => openModal('promoteAdmin')
    },
    {
      id: 'demote-admin',
      title: 'Quitar Admin',
      description: 'Quitar permisos de administrador',
      icon: '⬇️',
      endpoint: 'POST /api/admin/demote/:userId',
      permission: 'gestionar_usuarios',
      onClick: () => openModal('demoteAdmin')
    },
    {
      id: 'update-permissions',
      title: 'Actualizar Permisos',
      description: 'Modificar permisos de administrador',
      icon: '⚙️',
      endpoint: 'PUT /api/admin/admins/:userId/permissions',
      permission: 'gestionar_administradores',
      onClick: () => openModal('updatePermissions')
    }
  ];

  const statisticsFeatures = [
    {
      id: 'system-stats',
      title: 'Ver Estadísticas',
      description: 'Estadísticas generales del sistema',
      icon: '📊',
      endpoint: 'GET /api/admin/stats',
      permission: 'ver_estadisticas',
      onClick: () => openModal('systemStats')
    }
  ];

  // Función para renderizar botones de funcionalidades
  const renderFeatureButtons = (features, sectionTitle) => (
    <div className="features-section">
      <h2 className="section-title">{sectionTitle}</h2>
      <div className="features-grid">
        {features.map((feature) => {
          const hasAccess = hasPermission(feature.permission);
          
          return (
            <button
              key={feature.id}
              className={`feature-button ${!hasAccess ? 'disabled' : ''}`}
              onClick={hasAccess ? feature.onClick : undefined}
              disabled={!hasAccess}
              title={hasAccess ? feature.description : 'Sin permisos'}
            >
              <div className="feature-icon">{feature.icon}</div>
              <div className="feature-content">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className="endpoint-info">{feature.endpoint}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <AdminGuard>
      <div className="user-management-page">
        <div className="management-container">
          {/* Header */}
          <header className="management-header">
            <Link to="/admin-panel" className="back-button">
              <span>←</span>
              Volver al Panel Admin
            </Link>
            <div className="header-content">
              <h1>🔧 Gestión de Usuarios</h1>
              <p>Administra usuarios, administradores y permisos del sistema</p>
              <div className="user-info">
                <span className="user-badge">👑 Super Administrador</span>
                <span className="user-email">{user?.email_usuario}</span>
              </div>
            </div>
          </header>

          {/* Funcionalidades de Gestión de Usuarios */}
          {renderFeatureButtons(userManagementFeatures, '👥 Gestión de Usuarios')}

          {/* Funcionalidades de Gestión de Administradores */}
          {renderFeatureButtons(adminManagementFeatures, '👑 Gestión de Administradores')}

          {/* Funcionalidades de Estadísticas */}
          {renderFeatureButtons(statisticsFeatures, '📊 Estadísticas')}

          {/* Modales */}
          <ListUsersModal 
            isOpen={activeModal === 'listUsers'} 
            onClose={closeModal} 
          />
          
          {activeModal && activeModal !== 'listUsers' && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>🚧 Funcionalidad en Desarrollo</h2>
                  <button className="close-button" onClick={closeModal}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="development-info">
                    <div className="info-icon">🔨</div>
                    <h3>Modal: {activeModal}</h3>
                    <p>Esta funcionalidad está siendo desarrollada.</p>
                    <div className="endpoint-details">
                      <strong>Endpoint:</strong> {modalData?.endpoint || 'N/A'}
                    </div>
                    <div className="data-preview">
                      <strong>Datos:</strong> {JSON.stringify(modalData, null, 2)}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn-primary" onClick={closeModal}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Cambio de Estado */}
          <ChangeUserStatusModal
            isOpen={activeModal === 'changeStatus'}
            onClose={closeModal}
            onStatusChanged={(userId, newStatus) => {
              console.log(`Estado del usuario ${userId} cambiado a: ${newStatus ? 'Activo' : 'Inactivo'}`);
              // Aquí podrías actualizar el estado global o notificar a otros componentes
            }}
          />

          {/* Modal de Historial de Usuario */}
          <UserHistoryModal
            isOpen={activeModal === 'userHistory'}
            onClose={closeModal}
          />
        </div>
      </div>
    </AdminGuard>
  );
};

export default UserManagementPage;