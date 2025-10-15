// =====================================================
// Página de Gestión de Actividades
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminGuard from '../components/AdminGuard/AdminGuard';
import './ActivityManagementPage.css';

const ActivityManagementPage = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  
  // Estados para inscripciones y estadísticas
  const [inscriptions, setInscriptions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Funciones para abrir modales
  const openModal = (modalType, data = null) => {
    setActiveModal(modalType);
    setModalData(data);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  // Función para obtener el token de autenticación
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadInscriptionsAndStats();
  }, []);

  // Cargar inscripciones y estadísticas
  const loadInscriptionsAndStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      const headers = {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      };

      // Cargar inscripciones del usuario
      const inscriptionsResponse = await fetch('http://localhost:3001/api/activities/user/inscriptions', {
        method: 'GET',
        headers
      });

      if (inscriptionsResponse.ok) {
        const inscriptionsResult = await inscriptionsResponse.json();
        if (inscriptionsResult.success) {
          setInscriptions(inscriptionsResult.data || []);
        }
      }

      // Cargar todas las actividades para estadísticas
      const activitiesResponse = await fetch('http://localhost:3001/api/activities', {
        method: 'GET',
        headers
      });

      if (activitiesResponse.ok) {
        const activitiesResult = await activitiesResponse.json();
        if (activitiesResult.success) {
          setActivities(activitiesResult.data || []);
        }
      }

    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar inscripciones y estadísticas');
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const calculateStats = () => {
    const totalActivities = activities.length;
    const activeActivities = activities.filter(a => a.estado_actividad).length;
    const totalCapacity = activities.reduce((sum, a) => sum + (a.cupo_maximo_actividad || 0), 0);
    const totalAvailable = activities.reduce((sum, a) => sum + (a.cupo_disponible_actividad || 0), 0);
    const totalOccupied = totalCapacity - totalAvailable;
    const workshops = activities.filter(a => a.tipo_actividad === 'taller').length;
    const competitions = activities.filter(a => a.tipo_actividad === 'competencia').length;
    const userInscriptions = inscriptions.length;

    return {
      totalActivities,
      activeActivities,
      totalCapacity,
      totalAvailable,
      totalOccupied,
      workshops,
      competitions,
      userInscriptions,
      occupancyRate: totalCapacity > 0 ? ((totalOccupied / totalCapacity) * 100).toFixed(1) : 0
    };
  };

  // Configuración de funcionalidades de actividades
  const activityManagementFeatures = [
    {
      id: 'list-activities',
      title: 'Listar Actividades',
      description: 'Ver todas las actividades del congreso con filtros avanzados',
      icon: '📋',
      endpoint: 'GET /api/activities',
      permission: 'gestion_actividades',
      onClick: () => navigate('/listar-actividades'),
      status: 'completed'
    },
    {
      id: 'create-activity',
      title: 'Crear Actividad',
      description: 'Crear nuevas actividades (talleres y competencias)',
      icon: '➕',
      endpoint: 'POST /api/activities',
      permission: 'gestion_actividades',
      onClick: () => navigate('/crear-actividad'),
      status: 'completed'
    },
    {
      id: 'edit-activity',
      title: 'Editar Actividad',
      description: 'Modificar actividades existentes',
      icon: '✏️',
      endpoint: 'PUT /api/activities/:id',
      permission: 'gestion_actividades',
      onClick: () => navigate('/editar-actividad'),
      status: 'completed'
    },
  ];

  return (
    <AdminGuard>
      <div className="activity-management-page">
        <div className="activity-container">
          <header className="management-header">
            <Link to="/admin-panel" className="back-button">
              <span>←</span> Volver al Panel de Administración
            </Link>
            <h1>🎯 Gestión de Actividades</h1>
            <p>Administra actividades, talleres y competencias del congreso</p>
            <div className="management-info">
              <span className="management-badge">🎯 Administrador de Actividades</span>
              <span className="management-email">{user?.email_usuario}</span>
            </div>
          </header>

          <div className="management-features">
            <h2>🎯 Gestión de Actividades</h2>
            <div className="features-grid">
              {activityManagementFeatures.map((feature) => (
                hasPermission(feature.permission) && (
                  <button
                    key={feature.id}
                    className={`feature-btn ${feature.id === 'list-activities' ? 'primary' : 'secondary'}`}
                    onClick={feature.onClick}
                  >
                    <div className="feature-icon">{feature.icon}</div>
                    <div className="feature-content">
                      <h3>{feature.title}</h3>
                      <p>{feature.description}</p>
                    </div>
                  </button>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Tablas de Inscripciones y Estadísticas */}
        <div className="data-tables-section">
          <div className="tables-header">
            <h2>📊 Datos de Actividades</h2>
            <button 
              onClick={loadInscriptionsAndStats}
              className="refresh-button"
              disabled={loading}
            >
              {loading ? '🔄 Cargando...' : '🔄 Actualizar Datos'}
            </button>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="tables-grid">
            {/* Tabla de Inscripciones del Usuario */}
            <div className="table-container">
              <h3>👤 Mis Inscripciones</h3>
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Cargando inscripciones...</p>
                </div>
              ) : inscriptions.length > 0 ? (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Actividad</th>
                        <th>Tipo</th>
                        <th>Fecha</th>
                        <th>Lugar</th>
                        <th>Cupo</th>
                        <th>Ponente</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inscriptions.map((inscription) => (
                        <tr key={inscription.id_actividad}>
                          <td>
                            <div className="activity-name">
                              <strong>{inscription.nombre_actividad}</strong>
                              <span className="activity-category">{inscription.categoria_nombre}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`activity-type-badge ${inscription.tipo_actividad}`}>
                              {inscription.tipo_actividad === 'taller' ? '🔧 Taller' : '🏆 Competencia'}
                            </span>
                          </td>
                          <td>
                            <div className="date-info">
                              <div>{new Date(inscription.fecha_inicio_actividad).toLocaleDateString()}</div>
                              <div className="time-info">
                                {new Date(inscription.fecha_inicio_actividad).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                {new Date(inscription.fecha_fin_actividad).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            </div>
                          </td>
                          <td>{inscription.lugar_actividad}</td>
                          <td>
                            <div className="capacity-info">
                              <span className="capacity-used">{inscription.cupo_maximo_actividad - inscription.cupo_disponible_actividad}</span>
                              <span className="capacity-separator">/</span>
                              <span className="capacity-total">{inscription.cupo_maximo_actividad}</span>
                            </div>
                          </td>
                          <td>{inscription.ponente_actividad}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-data">
                  <p>No tienes inscripciones en actividades</p>
                </div>
              )}
            </div>

            {/* Estadísticas Generales */}
            <div className="table-container">
              <h3>📈 Estadísticas Generales</h3>
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Cargando estadísticas...</p>
                </div>
              ) : (
                <div className="stats-grid">
                  {(() => {
                    const stats = calculateStats();
                    return (
                      <>
                        <div className="stat-card">
                          <div className="stat-icon">📋</div>
                          <div className="stat-content">
                            <div className="stat-number">{stats.totalActivities}</div>
                            <div className="stat-label">Total Actividades</div>
                          </div>
                        </div>
                        
                        <div className="stat-card">
                          <div className="stat-icon">✅</div>
                          <div className="stat-content">
                            <div className="stat-number">{stats.activeActivities}</div>
                            <div className="stat-label">Actividades Activas</div>
                          </div>
                        </div>
                        
                        <div className="stat-card">
                          <div className="stat-icon">🔧</div>
                          <div className="stat-content">
                            <div className="stat-number">{stats.workshops}</div>
                            <div className="stat-label">Talleres</div>
                          </div>
                        </div>
                        
                        <div className="stat-card">
                          <div className="stat-icon">🏆</div>
                          <div className="stat-content">
                            <div className="stat-number">{stats.competitions}</div>
                            <div className="stat-label">Competencias</div>
                          </div>
                        </div>
                        
                        <div className="stat-card">
                          <div className="stat-icon">👥</div>
                          <div className="stat-content">
                            <div className="stat-number">{stats.totalCapacity}</div>
                            <div className="stat-label">Cupo Total</div>
                          </div>
                        </div>
                        
                        <div className="stat-card">
                          <div className="stat-icon">📊</div>
                          <div className="stat-content">
                            <div className="stat-number">{stats.occupancyRate}%</div>
                            <div className="stat-label">Ocupación</div>
                          </div>
                        </div>
                        
                        <div className="stat-card">
                          <div className="stat-icon">👤</div>
                          <div className="stat-content">
                            <div className="stat-number">{stats.userInscriptions}</div>
                            <div className="stat-label">Mis Inscripciones</div>
                          </div>
                        </div>
                        
                        <div className="stat-card">
                          <div className="stat-icon">🎯</div>
                          <div className="stat-content">
                            <div className="stat-number">{stats.totalOccupied}</div>
                            <div className="stat-label">Participantes</div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modales */}
        {activeModal && (
          <div className="modal-overlay">
            <div className="modal-content">
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
      </div>
    </AdminGuard>
  );
};

export default ActivityManagementPage;
