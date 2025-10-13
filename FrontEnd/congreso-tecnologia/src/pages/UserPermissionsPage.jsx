// =====================================================
// Página de Permisos del Usuario
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import UserPermissions from '../components/UserPermissions/UserPermissions';
import AdminGuard from '../components/AdminGuard/AdminGuard';

const UserPermissionsPage = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#1A365D'
      }}>
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        textAlign: 'center'
      }}>
        <div>
          <h2>🔒 Acceso Restringido</h2>
          <p>Necesitas iniciar sesión para ver los permisos del usuario.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 1rem'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '15px',
          padding: '2rem',
          backdropFilter: 'blur(10px)',
          marginBottom: '2rem'
        }}>
          <h1 style={{ 
            color: 'white', 
            textAlign: 'center', 
            margin: '0 0 1rem 0',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            🔐 Información de Permisos
          </h1>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.9)', 
            textAlign: 'center', 
            margin: 0,
            fontSize: '1.1rem'
          }}>
            Visualiza y gestiona los permisos de tu cuenta
          </p>
        </div>

        <UserPermissions />
      </div>
    </div>
  );
};

export default UserPermissionsPage;
