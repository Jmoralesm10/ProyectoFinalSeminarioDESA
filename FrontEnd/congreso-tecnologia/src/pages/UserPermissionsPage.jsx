// =====================================================
// Página de Permisos del Usuario
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import UserPermissions from '../components/UserPermissions/UserPermissions';
import AdminGuard from '../components/AdminGuard/AdminGuard';
import './UserPermissionsPage.css';

const UserPermissionsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="user-permissions-loading">
        <div className="loading-spinner"></div>
        <p>Cargando permisos...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="access-restricted">
        <div className="access-restricted-content">
          <h2>🔒 Acceso Restringido</h2>
          <p>Necesitas iniciar sesión para ver los permisos del usuario.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-permissions-page">
      <div className="user-permissions-container">
        {/* Header de la Página */}
        <div className="user-permissions-header">
          <div className="header-content">
            <button
              onClick={() => navigate('/')}
              className="back-button"
            >
              🏠 Volver al Inicio
            </button>
            <div className="header-info">
              <h1>
                <span className="title-icon">🔐</span>
                Información de Permisos
              </h1>
              <p>Visualiza y gestiona los permisos de tu cuenta</p>
            </div>
          </div>
        </div>

        {/* Contenido de Permisos */}
        <div className="user-permissions-content">
          <UserPermissions />
        </div>
      </div>
    </div>
  );
};

export default UserPermissionsPage;
