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
          <div className="tab-content">
            <h4>Actividades Inscritas</h4>
            {userHistory.actividades_inscritas && userHistory.actividades_inscritas.length > 0 ? (
              <div className="history-list">
                {userHistory.actividades_inscritas.map((actividad, index) => (
                  <div key={index} className="history-item">
                    <div className="item-header">
                      <span className="item-title">{actividad.nombre_actividad || 'Actividad'}</span>
                      <span className="item-date">{formatDate(actividad.fecha_inscripcion)}</span>
                    </div>
                    <div className="item-details">
                      <p><strong>Estado:</strong> {actividad.estado_inscripcion || 'N/A'}</p>
                      <p><strong>Descripción:</strong> {actividad.descripcion_actividad || 'Sin descripción'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No hay actividades inscritas registradas.</p>
              </div>
            )}
          </div>
        );

      case 'asistencias':
        return (
          <div className="tab-content">
            <h4>Registro de Asistencias</h4>
            {userHistory.asistencias && userHistory.asistencias.length > 0 ? (
              <div className="history-list">
                {userHistory.asistencias.map((asistencia, index) => (
                  <div key={index} className="history-item">
                    <div className="item-header">
                      <span className="item-title">{asistencia.nombre_actividad || 'Asistencia'}</span>
                      <span className="item-date">{formatDate(asistencia.fecha_asistencia)}</span>
                    </div>
                    <div className="item-details">
                      <p><strong>Estado:</strong> 
                        <span className={`badge badge-${asistencia.presente ? 'success' : 'danger'}`}>
                          {asistencia.presente ? '✅ Presente' : '❌ Ausente'}
                        </span>
                      </p>
                      <p><strong>Hora de registro:</strong> {formatDate(asistencia.fecha_registro)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No hay registros de asistencia.</p>
              </div>
            )}
          </div>
        );

      case 'administracion':
        return (
          <div className="tab-content">
            <h4>Historial Administrativo</h4>
            {userHistory.historial_admin && userHistory.historial_admin.length > 0 ? (
              <div className="history-list">
                {userHistory.historial_admin.map((admin, index) => (
                  <div key={index} className="history-item">
                    <div className="item-header">
                      <span className="item-title">{admin.accion || 'Acción administrativa'}</span>
                      <span className="item-date">{formatDate(admin.fecha_accion)}</span>
                    </div>
                    <div className="item-details">
                      <p><strong>Rol:</strong> {admin.rol_administrador || 'N/A'}</p>
                      <p><strong>Descripción:</strong> {admin.descripcion || 'Sin descripción'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No hay historial administrativo registrado.</p>
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
      <div className="modal-content user-history-modal">
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
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar Usuario'}
            </button>
          </form>

          {error && <div className="error-message">{error}</div>}

          {foundUser && (
            <div className="user-details-card">
              <h3>Usuario Encontrado:</h3>
              <div className="user-info">
                <p><strong>Nombre:</strong> {foundUser.nombre_usuario} {foundUser.apellido_usuario}</p>
                <p><strong>Email:</strong> {foundUser.email_usuario}</p>
                <p>
                  <strong>Estado:</strong> 
                  <span className={`badge badge-${foundUser.estado_usuario ? 'success' : 'danger'}`}>
                    {foundUser.estado_usuario ? '✅ Activo' : '❌ Inactivo'}
                  </span>
                </p>
                <p><strong>Tipo:</strong> {foundUser.tipo_usuario?.nombre_tipo_usuario || foundUser.tipo_usuario || 'N/A'}</p>
              </div>
            </div>
          )}

          {userHistory && (
            <div className="history-section">
              <div className="tabs">
                <button 
                  className={`tab-button ${activeTab === 'actividades' ? 'active' : ''}`}
                  onClick={() => setActiveTab('actividades')}
                >
                  📚 Actividades
                </button>
                <button 
                  className={`tab-button ${activeTab === 'asistencias' ? 'active' : ''}`}
                  onClick={() => setActiveTab('asistencias')}
                >
                  ✅ Asistencias
                </button>
                <button 
                  className={`tab-button ${activeTab === 'administracion' ? 'active' : ''}`}
                  onClick={() => setActiveTab('administracion')}
                >
                  👨‍💼 Administración
                </button>
              </div>
              
              {renderTabContent()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHistoryModal;
