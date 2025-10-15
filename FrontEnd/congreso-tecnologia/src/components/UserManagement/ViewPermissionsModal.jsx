import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './ViewPermissionsModal.css';

const ViewPermissionsModal = ({ isOpen, onClose }) => {
  const { getAuthToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('email');
  const [userPermissions, setUserPermissions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Por favor ingresa un término de búsqueda válido');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setUserPermissions(null);

      const token = getAuthToken();
      const response = await fetch(`http://localhost:3001/api/admin/users?busqueda=${encodeURIComponent(searchTerm.trim())}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success && result.data && result.data.usuarios && result.data.usuarios.length > 0) {
        const user = result.data.usuarios[0];
        
        // Obtener permisos específicos del usuario
        try {
          const permissionsResponse = await fetch(`http://localhost:3001/api/users/${user.id_usuario}/permissions`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          const permissionsResult = await permissionsResponse.json();
          
          if (permissionsResult.success) {
            setUserPermissions({
              ...user,
              permissions: permissionsResult.data.permisos
            });
          } else {
            setUserPermissions({
              ...user,
              permissions: null
            });
          }
        } catch (permError) {
          console.warn('Error al obtener permisos específicos:', permError);
          setUserPermissions({
            ...user,
            permissions: null
          });
        }
      } else {
        // Intentar con el endpoint de búsqueda alternativo
        try {
          const searchResponse = await fetch(`http://localhost:3001/api/admin/users/search?termino_busqueda=${encodeURIComponent(searchTerm.trim())}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          const searchResult = await searchResponse.json();
          
          if (searchResult.success && searchResult.data && searchResult.data.usuarios && searchResult.data.usuarios.length > 0) {
            const user = searchResult.data.usuarios[0];
            
            // Obtener permisos específicos del usuario
            try {
              const permissionsResponse = await fetch(`http://localhost:3001/api/users/${user.id_usuario}/permissions`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              const permissionsResult = await permissionsResponse.json();
              
              if (permissionsResult.success) {
                setUserPermissions({
                  ...user,
                  permissions: permissionsResult.data.permisos
                });
              } else {
                setUserPermissions({
                  ...user,
                  permissions: null
                });
              }
            } catch (permError) {
              console.warn('Error al obtener permisos específicos:', permError);
              setUserPermissions({
                ...user,
                permissions: null
              });
            }
          } else {
            setError(`No se encontró ningún usuario con ese ${searchType}`);
          }
        } catch (searchError) {
          console.warn('Error en búsqueda alternativa:', searchError);
          setError(`No se encontró ningún usuario con ese ${searchType}`);
        }
      }
    } catch (err) {
      console.error('Error al buscar usuario:', err);
      setError('Error de conexión al buscar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const resetSearch = () => {
    setUserPermissions(null);
    setSearchTerm('');
    setError(null);
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
      'moderator': { text: '🛡️ Moderador', class: 'badge-moderator' },
      'externo': { text: '👤 Usuario Externo', class: 'badge-external' },
      'interno': { text: '🏫 Usuario Interno', class: 'badge-internal' }
    };
    
    const config = roleConfig[role] || { text: '👤 Usuario', class: 'badge-user' };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getPermissionDescription = (permission) => {
    const descriptions = {
      'gestionar_usuarios': 'Gestionar usuarios del sistema',
      'gestionar_actividades': 'Gestionar actividades del congreso',
      'ver_reportes': 'Ver reportes y estadísticas',
      'gestionar_asistencia': 'Gestionar asistencia a actividades',
      'gestionar_diplomas': 'Gestionar diplomas y certificados',
      'gestionar_administradores': 'Gestionar otros administradores'
    };
    return descriptions[permission] || permission;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content view-permissions-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔐 Ver Permisos de Usuario</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Search Section */}
          <div className="search-section">
            <div className="search-form">
              <div className="form-group">
                <label htmlFor="search-type" className="form-label">
                  🔍 Tipo de Búsqueda
                </label>
                <select
                  id="search-type"
                  className="form-select"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  disabled={loading}
                >
                  <option value="email">📧 Por Email</option>
                  <option value="nombre">👤 Por Nombre</option>
                  <option value="apellido">👤 Por Apellido</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="search-term" className="form-label">
                  {searchType === 'email' ? '📧 Email del Usuario' : 
                   searchType === 'nombre' ? '👤 Nombre del Usuario' : 
                   '👤 Apellido del Usuario'}
                </label>
                <div className="search-input-group">
                  <input
                    type={searchType === 'email' ? 'email' : 'text'}
                    id="search-term"
                    className="form-input"
                    placeholder={searchType === 'email' ? 'ejemplo@email.com' : 
                               searchType === 'nombre' ? 'Nombre del usuario' : 
                               'Apellido del usuario'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                  <button
                    className="btn-primary search-button"
                    onClick={handleSearch}
                    disabled={loading || !searchTerm.trim()}
                  >
                    {loading ? '🔍 Buscando...' : '🔍 Buscar'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {/* User Permissions Results */}
          {userPermissions && (
            <div className="user-permissions">
              <div className="user-header">
                <div className="user-avatar">
                  {userPermissions.nombre_usuario?.charAt(0)?.toUpperCase() || '👤'}
                </div>
                <div className="user-info">
                  <h3>{userPermissions.nombre_usuario} {userPermissions.apellido_usuario}</h3>
                  <p className="user-email">{userPermissions.email_usuario}</p>
                  <div className="user-badges">
                    {getRoleBadge(userPermissions.tipo_usuario?.nombre_tipo_usuario)}
                    <span className={`badge ${userPermissions.estado_usuario ? 'badge-active' : 'badge-inactive'}`}>
                      {getStatusBadge(userPermissions.estado_usuario)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="permissions-content">
                {/* Basic Info */}
                <div className="info-section">
                  <h4>📋 Información Básica</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">ID Usuario:</span>
                      <span className="info-value">{userPermissions.id_usuario}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Teléfono:</span>
                      <span className="info-value">{userPermissions.telefono_usuario || 'No especificado'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Fecha de Inscripción:</span>
                      <span className="info-value">{formatDate(userPermissions.fecha_inscripcion)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Último Acceso:</span>
                      <span className="info-value">{formatDate(userPermissions.ultimo_acceso)}</span>
                    </div>
                  </div>
                </div>

                {/* Admin Info */}
                {userPermissions.es_administrador && (
                  <div className="info-section">
                    <h4>👑 Información de Administrador</h4>
                    <div className="admin-permissions">
                      {userPermissions.permissions ? (
                        <div className="permissions-grid">
                          <div className="permission-category">
                            <h5>🔐 Permisos del Sistema</h5>
                            <div className="permissions-list">
                              {Object.entries(userPermissions.permissions).map(([key, value]) => (
                                <div key={key} className="permission-item">
                                  <span className="permission-name">{getPermissionDescription(key)}</span>
                                  <span className={`permission-status ${value ? 'granted' : 'denied'}`}>
                                    {value ? '✅ Concedido' : '❌ Denegado'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="no-permissions">
                          <span className="no-permissions-icon">🔒</span>
                          <p>No se pudieron cargar los permisos específicos</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Special Permissions */}
                {userPermissions.permisos_especiales && Object.keys(userPermissions.permisos_especiales).length > 0 && (
                  <div className="info-section">
                    <h4>⭐ Permisos Especiales</h4>
                    <div className="special-permissions">
                      <pre className="permissions-json">
                        {JSON.stringify(userPermissions.permisos_especiales, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* No Admin Message */}
                {!userPermissions.es_administrador && (
                  <div className="no-admin-message">
                    <div className="no-admin-icon">👤</div>
                    <h4>Usuario Regular</h4>
                    <p>Este usuario no tiene permisos de administrador.</p>
                    <div className="user-type-info">
                      <strong>Tipo de Usuario:</strong> {userPermissions.tipo_usuario?.descripcion_tipo_usuario || 'No especificado'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Results */}
          {!loading && !error && !userPermissions && (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>Buscar Usuario</h3>
              <p>Ingresa el email de un usuario para ver sus permisos y información.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          {userPermissions && (
            <button className="btn-primary" onClick={resetSearch}>
              🔄 Nueva Búsqueda
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewPermissionsModal;
