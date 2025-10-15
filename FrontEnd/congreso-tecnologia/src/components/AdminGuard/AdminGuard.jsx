// =====================================================
// Componente para verificar permisos de administrador
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { isSuperAdmin } from '../../utils/adminUtils';

const AdminGuard = ({ children, fallback = null, requiredPermission = null }) => {
  const { user, isAuthenticated, isAdmin, hasPermission, permissionsLoading, adminPermissions } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAccess = () => {
      if (!isAuthenticated || !user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      try {
        if (!isAdmin) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        // Verificar si es super admin (acceso total)
        const isSuperAdminUser = isSuperAdmin(user, adminPermissions);

        if (isSuperAdminUser) {
          setHasAccess(true);
        } else if (requiredPermission) {
          // Si se requiere un permiso específico, verificarlo
          const hasSpecificPermission = hasPermission(requiredPermission);
          setHasAccess(hasSpecificPermission);
        } else {
          // Si no se requiere permiso específico, solo verificar que sea admin
          setHasAccess(isAdmin);
        }
      } catch (error) {
        console.error('Error verifying admin access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAccess();
  }, [isAuthenticated, user, isAdmin, hasPermission, requiredPermission, permissionsLoading]);

  if (loading || permissionsLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '2rem',
        color: '#1A365D'
      }}>
        Verificando permisos...
      </div>
    );
  }

  if (!hasAccess) {
    return fallback || (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div>
          <h3>🚫 Acceso Denegado</h3>
          <p>
            {requiredPermission 
              ? `Se requiere el permiso "${requiredPermission}" para acceder a esta funcionalidad.`
              : 'Se requieren permisos de administrador para acceder a esta funcionalidad.'
            }
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminGuard;
