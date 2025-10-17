// =====================================================
// Página de Mis Actividades
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './MyActivitiesPage.css';

const MyActivitiesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading, getUserInscriptions } = useAuth();
  const [userInscriptions, setUserInscriptions] = useState([]);
  const [inscriptionsLoading, setInscriptionsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isAuthenticated) {
      loadUserInscriptions();
    }
  }, [isAuthenticated, loading, navigate]);

  const loadUserInscriptions = async () => {
    setInscriptionsLoading(true);
    setError('');
    try {
      const inscriptions = await getUserInscriptions();
      setUserInscriptions(inscriptions);
    } catch (error) {
      console.error('Error loading user inscriptions:', error);
      setError('Error al cargar las actividades. Por favor, intenta de nuevo.');
    } finally {
      setInscriptionsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-GT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha no disponible';
    }
  };

  const getActivityTypeIcon = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'conferencia':
        return '🎤';
      case 'taller':
        return '🛠️';
      case 'competencia':
        return '🏆';
      case 'workshop':
        return '💻';
      case 'charla':
        return '💬';
      default:
        return '📋';
    }
  };

  const getStatusBadgeClass = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'confirmada':
        return 'status-confirmed';
      case 'pendiente':
        return 'status-pending';
      case 'cancelada':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const getStatusText = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'confirmada':
        return 'Confirmada';
      case 'pendiente':
        return 'Pendiente';
      case 'cancelada':
        return 'Cancelada';
      default:
        return 'Pendiente';
    }
  };

  if (loading) {
    return (
      <div className="my-activities-loading">
        <div className="loading-spinner"></div>
        <p>Cargando actividades...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="my-activities-page">
      <div className="my-activities-container">
        {/* Header de la Página */}
        <div className="my-activities-header">
          <div className="header-content">
            <button
              onClick={() => navigate('/')}
              className="back-button"
            >
              🏠 Volver al Inicio
            </button>
            <div className="header-info">
              <h1 className="page-title">
                <span className="title-icon">🎯</span>
                Mis Actividades
              </h1>
              <p className="page-subtitle">
                Gestiona y visualiza todas tus inscripciones al Congreso de Tecnología 2025
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <div className="stat-number">{userInscriptions.length}</div>
                <div className="stat-label">Total Inscripciones</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-number">
                  {userInscriptions.filter(ins => ins.estado_inscripcion === 'confirmada').length}
                </div>
                <div className="stat-label">Confirmadas</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <div className="stat-number">
                  {userInscriptions.filter(ins => ins.estado_inscripcion === 'pendiente').length}
                </div>
                <div className="stat-label">Pendientes</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-content">
                <div className="stat-number">
                  {userInscriptions.filter(ins => ins.tipo_actividad === 'competencia').length}
                </div>
                <div className="stat-label">Competencias</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Actividades */}
        <div className="activities-section">
          <div className="section-header">
            <h2>📅 Mis Inscripciones</h2>
            <button
              onClick={loadUserInscriptions}
              className="refresh-button"
              disabled={inscriptionsLoading}
            >
              {inscriptionsLoading ? '⏳' : '🔄'} Actualizar
            </button>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {inscriptionsLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando actividades...</p>
            </div>
          ) : userInscriptions.length > 0 ? (
            <div className="activities-grid">
              {userInscriptions.map((inscription, index) => (
                <div key={index} className="activity-card">
                  <div className="activity-header">
                    <div className="activity-type">
                      <span className="type-icon">
                        {getActivityTypeIcon(inscription.tipo_actividad)}
                      </span>
                      <span className="type-text">
                        {inscription.tipo_actividad || 'Actividad'}
                      </span>
                    </div>
                    <div className={`status-badge ${getStatusBadgeClass(inscription.estado_inscripcion)}`}>
                      {getStatusText(inscription.estado_inscripcion)}
                    </div>
                  </div>

                  <div className="activity-content">
                    <h3 className="activity-title">
                      {inscription.nombre_actividad || 'Actividad sin nombre'}
                    </h3>
                    
                    {inscription.descripcion_actividad && (
                      <p className="activity-description">
                        {inscription.descripcion_actividad}
                      </p>
                    )}

                    <div className="activity-details">
                      {inscription.fecha_actividad && (
                        <div className="detail-item">
                          <span className="detail-icon">📅</span>
                          <span className="detail-text">
                            {formatDate(inscription.fecha_actividad)}
                          </span>
                        </div>
                      )}

                      {inscription.hora_actividad && (
                        <div className="detail-item">
                          <span className="detail-icon">🕒</span>
                          <span className="detail-text">
                            {inscription.hora_actividad}
                          </span>
                        </div>
                      )}

                      {inscription.lugar_actividad && (
                        <div className="detail-item">
                          <span className="detail-icon">📍</span>
                          <span className="detail-text">
                            {inscription.lugar_actividad}
                          </span>
                        </div>
                      )}

                      {inscription.ponente_actividad && (
                        <div className="detail-item">
                          <span className="detail-icon">👨‍🏫</span>
                          <span className="detail-text">
                            {inscription.ponente_actividad}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="activity-footer">
                      <div className="inscription-date">
                        <span className="date-label">Inscrito el:</span>
                        <span className="date-value">
                          {formatDate(inscription.fecha_inscripcion)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No tienes actividades inscritas</h3>
              <p>Explora las actividades disponibles y únete al Congreso de Tecnología 2025</p>
              <div className="empty-actions">
                <button
                  onClick={() => navigate('/')}
                  className="action-button primary"
                >
                  🎯 Ver Actividades Disponibles
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Información Adicional */}
        <div className="info-section">
          <div className="info-card">
            <div className="info-header">
              <span className="info-icon">ℹ️</span>
              <h3>Información Importante</h3>
            </div>
            <div className="info-content">
              <ul className="info-list">
                <li>📋 Mantén actualizada tu información de contacto</li>
                <li>⏰ Llega 15 minutos antes del inicio de cada actividad</li>
                <li>📱 Trae tu código QR para el registro de asistencia</li>
                <li>🏆 Las competencias requieren inscripción previa</li>
                <li>📧 Revisa tu email para actualizaciones importantes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyActivitiesPage;
