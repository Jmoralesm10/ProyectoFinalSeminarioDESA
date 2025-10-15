import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './ListAdminsModal.css';

const ListAdminsModal = ({ isOpen, onClose }) => {
  const { getAuthToken } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadAdmins();
    }
  }, [isOpen]);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      const response = await fetch('https://proyecto-final-seminario-desa-dmgi.vercel.app/api/admin/admins', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setAdmins(result.data || []);
      } else {
        setError(result.message || 'Error al cargar administradores');
      }
    } catch (err) {
      console.error('Error al cargar administradores:', err);
      setError('Error de conexión al cargar administradores');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (isActive) => {
    return isActive ? '✅ Activo' : '❌ Inactivo';
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      'super_admin': { text: '👑 Super Admin', class: 'badge-super-admin' },
      'admin': { text: '🔧 Admin', class: 'badge-admin' },
      'moderator': { text: '🛡️ Moderador', class: 'badge-moderator' }
    };
    
    const config = roleConfig[role] || { text: '👤 Usuario', class: 'badge-user' };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content list-admins-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👑 Lista de Administradores</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando administradores...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
              <button className="btn-secondary" onClick={loadAdmins}>
                🔄 Reintentar
              </button>
            </div>
          )}

          {!loading && !error && admins.length === 0 && (
            <div className="no-data">
              <div className="no-data-icon">👑</div>
              <h3>No hay administradores</h3>
              <p>No se encontraron administradores en el sistema.</p>
            </div>
          )}

          {!loading && !error && admins.length > 0 && (
            <div className="admins-list">
              <div className="admins-header">
                <h3>📊 Total de Administradores: {admins.length}</h3>
              </div>
              
              <div className="admins-grid">
                {admins.map((admin) => (
                  <div key={admin.id_usuario} className="admin-card">
                    <div className="admin-header">
                      <div className="admin-avatar">
                        {admin.nombre_usuario?.charAt(0)?.toUpperCase() || '👤'}
                      </div>
                      <div className="admin-info">
                        <h4>{admin.nombre_usuario} {admin.apellido_usuario}</h4>
                        <p className="admin-email">{admin.email_usuario}</p>
                        <div className="admin-badges">
                          {getRoleBadge(admin.rol_administrador)}
                          <span className={`badge ${admin.estado_administrador ? 'badge-active' : 'badge-inactive'}`}>
                            {getStatusBadge(admin.estado_administrador)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="admin-details">
                      <div className="detail-section">
                        <h5>📞 Información de Contacto</h5>
                        <div className="detail-item">
                          <span className="detail-label">Teléfono:</span>
                          <span className="detail-value">{admin.telefono_usuario || 'No especificado'}</span>
                        </div>
                      </div>

                      <div className="detail-section">
                        <h5>🔐 Permisos de Administrador</h5>
                        <div className="permissions-list">
                          {admin.permisos_administrador && admin.permisos_administrador.length > 0 ? (
                            admin.permisos_administrador.map((permiso, index) => (
                              <span key={index} className="permission-badge">
                                {permiso}
                              </span>
                            ))
                          ) : (
                            <span className="no-permissions">Sin permisos específicos</span>
                          )}
                        </div>
                      </div>

                      <div className="detail-section">
                        <h5>📅 Fechas Importantes</h5>
                        <div className="detail-item">
                          <span className="detail-label">Asignación:</span>
                          <span className="detail-value">{formatDate(admin.fecha_asignacion)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Última Actividad:</span>
                          <span className="detail-value">{formatDate(admin.fecha_ultima_actividad)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Último Acceso:</span>
                          <span className="detail-value">{formatDate(admin.ultimo_acceso)}</span>
                        </div>
                      </div>

                      {admin.observaciones && (
                        <div className="detail-section">
                          <h5>📝 Observaciones</h5>
                          <p className="observations">{admin.observaciones}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          <button className="btn-primary" onClick={loadAdmins} disabled={loading}>
            {loading ? '🔄 Cargando...' : '🔄 Actualizar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListAdminsModal;
