import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../src/hooks/useAuth';
import './UserHistoryModal.css';

const API_BASE_URL = 'http://localhost:3001';

const UserHistoryModal = ({ isOpen, onClose }) => {
  const { getAuthToken } = useAuth();
  const [searchEmail, setSearchEmail] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [userHistory, setUserHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('actividades');

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setSearchEmail('');
      setFoundUser(null);
      setUserHistory(null);
      setLoading(false);
      setError(null);
      setActiveTab('actividades');
    }
  }, [isOpen]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFoundUser(null);
    setUserHistory(null);

    if (!searchEmail) {
      setError('Por favor, ingrese un correo electrónico.');
      setLoading(false);
      return;
    }

    try {
      // Buscar usuario por email
      const searchResponse = await axios.get(`${API_BASE_URL}/api/admin/users/search`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        params: {
          termino_busqueda: searchEmail,
          limite: 1
        }
      });

      if (searchResponse.data.success && searchResponse.data.data.usuarios.length > 0) {
        const user = searchResponse.data.data.usuarios[0];
        setFoundUser(user);
        
        // Obtener historial del usuario
        await loadUserHistory(user.id_usuario);
      } else {
        setError('No se encontró ningún usuario con ese correo electrónico.');
      }
    } catch (err) {
      console.error('Error al buscar usuario:', err);
      setError(err.response?.data?.message || 'Error al buscar usuario.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserHistory = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/admin/users/${userId}/history`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        params: {
          limite: 100 // Obtener más registros para el historial
        }
      });

      if (response.data.success) {
        setUserHistory(response.data.data);
      } else {
        setError('No se pudo obtener el historial del usuario.');
      }
    } catch (err) {
      console.error('Error al obtener historial:', err);
      setError(err.response?.data?.message || 'Error al obtener el historial del usuario.');
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

  const renderTabContent = () => {
    if (!userHistory) return null;

    switch (activeTab) {
      case 'actividades':
        return (
          <div>
            {userHistory.actividades_inscritas && userHistory.actividades_inscritas.length > 0 ? (
              <div className="history-list">
                {userHistory.actividades_inscritas.map((actividad, index) => (
                  <div key={index} className="history-item">
                    <div className="history-item-header">
                      <div className="history-activity">
                        <div className="history-activity-name">{actividad.nombre_actividad || 'Actividad'}</div>
                        <span className="history-activity-type taller">Taller</span>
                      </div>
                      <span className="history-detail-value">{formatDate(actividad.fecha_inscripcion)}</span>
                    </div>
                    <div className="history-details">
                      <div className="history-detail">
                        <span className="history-detail-label">Estado</span>
                        <span className="history-detail-value">{actividad.estado_inscripcion || 'N/A'}</span>
                      </div>
                      <div className="history-detail">
                        <span className="history-detail-label">Descripción</span>
                        <span className="history-detail-value">{actividad.descripcion_actividad || 'Sin descripción'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data-container">
                <div className="no-data-icon">📚</div>
                <div className="no-data-title">Sin Actividades</div>
                <div className="no-data-message">No hay actividades inscritas registradas.</div>
              </div>
            )}
          </div>
        );

      case 'asistencias':
        return (
          <div>
            {userHistory.asistencias && userHistory.asistencias.length > 0 ? (
              <div className="history-list">
                {userHistory.asistencias.map((asistencia, index) => (
                  <div key={index} className="history-item">
                    <div className="history-item-header">
                      <div className="history-activity">
                        <div className="history-activity-name">{asistencia.nombre_actividad || 'Asistencia'}</div>
                        <span className={`history-activity-type ${asistencia.presente ? 'competencia' : 'taller'}`}>
                          {asistencia.presente ? 'Presente' : 'Ausente'}
                        </span>
                      </div>
                      <span className="history-detail-value">{formatDate(asistencia.fecha_asistencia)}</span>
                    </div>
                    <div className="history-details">
                      <div className="history-detail">
                        <span className="history-detail-label">Estado</span>
                        <span className={`history-detail-value ${asistencia.presente ? 'text-success' : 'text-danger'}`}>
                          {asistencia.presente ? '✅ Presente' : '❌ Ausente'}
                        </span>
                      </div>
                      <div className="history-detail">
                        <span className="history-detail-label">Hora de registro</span>
                        <span className="history-detail-value">{formatDate(asistencia.fecha_registro)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data-container">
                <div className="no-data-icon">✅</div>
                <div className="no-data-title">Sin Asistencias</div>
                <div className="no-data-message">No hay registros de asistencia.</div>
              </div>
            )}
          </div>
        );

      case 'administracion':
        return (
          <div>
            {userHistory.historial_admin && userHistory.historial_admin.length > 0 ? (
              <div className="history-list">
                {userHistory.historial_admin.map((admin, index) => (
                  <div key={index} className="history-item">
                    <div className="history-item-header">
                      <div className="history-activity">
                        <div className="history-activity-name">{admin.accion || 'Acción administrativa'}</div>
                        <span className="history-activity-type taller">Admin</span>
                      </div>
                      <span className="history-detail-value">{formatDate(admin.fecha_accion)}</span>
                    </div>
                    <div className="history-details">
                      <div className="history-detail">
                        <span className="history-detail-label">Rol</span>
                        <span className="history-detail-value">{admin.rol_administrador || 'N/A'}</span>
                      </div>
                      <div className="history-detail">
                        <span className="history-detail-label">Descripción</span>
                        <span className="history-detail-value">{admin.descripcion || 'Sin descripción'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data-container">
                <div className="no-data-icon">👨‍💼</div>
                <div className="no-data-title">Sin Historial Admin</div>
                <div className="no-data-message">No hay historial administrativo registrado.</div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Historial de Usuario</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="email"
              placeholder="Buscar por correo electrónico..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '0.9rem',
                marginBottom: '1rem'
              }}
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar Usuario'}
            </button>
          </form>

          {error && <div className="error-message">{error}</div>}

          {foundUser && (
            <div className="user-info">
              <h3>Usuario Encontrado:</h3>
              <div className="user-details">
                <div className="user-detail">
                  <span className="user-detail-label">Nombre</span>
                  <span className="user-detail-value">{foundUser.nombre_usuario} {foundUser.apellido_usuario}</span>
                </div>
                <div className="user-detail">
                  <span className="user-detail-label">Email</span>
                  <span className="user-detail-value">{foundUser.email_usuario}</span>
                </div>
                <div className="user-detail">
                  <span className="user-detail-label">Estado</span>
                  <span className={`user-detail-value ${foundUser.estado_usuario ? 'text-success' : 'text-danger'}`}>
                    {foundUser.estado_usuario ? '✅ Activo' : '❌ Inactivo'}
                  </span>
                </div>
                <div className="user-detail">
                  <span className="user-detail-label">Tipo</span>
                  <span className="user-detail-value">{foundUser.tipo_usuario?.nombre_tipo_usuario || foundUser.tipo_usuario || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {userHistory && (
            <div className="history-section">
              <div className="history-header">
                <h3>Historial del Usuario</h3>
                <div className="history-count">
                  {activeTab === 'actividades' && userHistory.actividades_inscritas?.length || 0}
                  {activeTab === 'asistencias' && userHistory.asistencias?.length || 0}
                  {activeTab === 'administracion' && userHistory.historial_admin?.length || 0}
                </div>
              </div>
              
              <div className="tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button 
                  className={`btn-primary ${activeTab === 'actividades' ? 'active' : ''}`}
                  onClick={() => setActiveTab('actividades')}
                  style={{ 
                    background: activeTab === 'actividades' ? '#D92027' : '#1A365D',
                    fontSize: '0.8rem',
                    padding: '0.5rem 1rem'
                  }}
                >
                  📚 Actividades
                </button>
                <button 
                  className={`btn-primary ${activeTab === 'asistencias' ? 'active' : ''}`}
                  onClick={() => setActiveTab('asistencias')}
                  style={{ 
                    background: activeTab === 'asistencias' ? '#D92027' : '#1A365D',
                    fontSize: '0.8rem',
                    padding: '0.5rem 1rem'
                  }}
                >
                  ✅ Asistencias
                </button>
                <button 
                  className={`btn-primary ${activeTab === 'administracion' ? 'active' : ''}`}
                  onClick={() => setActiveTab('administracion')}
                  style={{ 
                    background: activeTab === 'administracion' ? '#D92027' : '#1A365D',
                    fontSize: '0.8rem',
                    padding: '0.5rem 1rem'
                  }}
                >
                  👨‍💼 Administración
                </button>
              </div>
              
              {renderTabContent()}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserHistoryModal;
