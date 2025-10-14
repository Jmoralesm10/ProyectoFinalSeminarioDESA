// =====================================================
// Componente de Tarjeta de Actividad
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import EnrollmentModal from '../EnrollmentModal/EnrollmentModal';
import './ActivityCard.css';

const ActivityCard = ({ activity, isAuthenticated, onEnroll, userInscriptions = [], user }) => {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  
  // Verificar si el usuario ya está inscrito en esta actividad
  const isEnrolled = userInscriptions.some(inscription => 
    inscription.id_actividad === activity.id_actividad && 
    inscription.estado_inscripcion === 'confirmada'
  );

  // Verificar si la actividad está disponible para inscripción
  const isAvailable = activity.cupo_disponible_actividad > 0 && activity.estado_actividad;

  // Manejar inscripción
  const handleEnroll = () => {
    if (!isAuthenticated) {
      // Redirigir al login si no está autenticado
      window.location.href = '/login';
      return;
    }

    if (isEnrolled) {
      return; // Ya está inscrito
    }

    // Abrir modal de confirmación
    setShowEnrollmentModal(true);
  };

  const handleConfirmEnrollment = async () => {
    setIsEnrolling(true);
    try {
      await onEnroll(activity.id_actividad);
      setShowEnrollmentModal(false);
    } catch (error) {
      console.error('Error al inscribirse:', error);
    } finally {
      setIsEnrolling(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Por definir';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener el color del tipo de actividad
  const getActivityTypeColor = (tipo) => {
    return tipo === 'taller' ? '#17a2b8' : '#28a745';
  };

  // Obtener el icono del tipo de actividad
  const getActivityTypeIcon = (tipo) => {
    return tipo === 'taller' ? '🔧' : '🏆';
  };

  return (
    <div className="activity-card">
      {/* Header de la tarjeta */}
      <div className="activity-card-header">
        <div className="activity-type-badge" style={{ backgroundColor: getActivityTypeColor(activity.tipo_actividad) }}>
          <span className="activity-type-icon">{getActivityTypeIcon(activity.tipo_actividad)}</span>
          <span className="activity-type-text">
            {activity.tipo_actividad === 'taller' ? 'Taller' : 'Competencia'}
          </span>
        </div>
        <div className="activity-status">
          {isEnrolled ? (
            <span className="status-badge enrolled">✅ Inscrito</span>
          ) : isAvailable ? (
            <span className="status-badge available">📝 Disponible</span>
          ) : (
            <span className="status-badge unavailable">❌ No disponible</span>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="activity-card-content">
        <h3 className="activity-title">{activity.nombre_actividad}</h3>
        
        {activity.descripcion_actividad && (
          <p className="activity-description">
            {activity.descripcion_actividad.length > 300 
              ? `${activity.descripcion_actividad.substring(0, 300)}...` 
              : activity.descripcion_actividad
            }
          </p>
        )}


        {/* Información de la actividad */}
        <div className="activity-info">
          {activity.ponente_actividad && (
            <div className="info-item">
              <span className="info-icon">👨‍🏫</span>
              <span className="info-text">{activity.ponente_actividad}</span>
            </div>
          )}
          
          {activity.lugar_actividad && (
            <div className="info-item">
              <span className="info-icon">📍</span>
              <span className="info-text">{activity.lugar_actividad}</span>
            </div>
          )}
          
          <div className="info-item">
            <span className="info-icon">📅</span>
            <span className="info-text">
              {formatDate(activity.fecha_inicio_actividad)}
            </span>
          </div>
          
          {activity.cupo_maximo_actividad && (
            <div className="info-item">
              <span className="info-icon">👥</span>
              <span className="info-text">
                {activity.cupo_disponible_actividad} / {activity.cupo_maximo_actividad} cupos
              </span>
            </div>
          )}
        </div>

        {/* Requisitos */}
        {activity.requisitos_actividad && (
          <div className="activity-requirements">
            <h4>Requisitos:</h4>
            <p>{activity.requisitos_actividad}</p>
          </div>
        )}
      </div>

      {/* Footer de la tarjeta */}
      <div className="activity-card-footer">
        {isAuthenticated ? (
          <button
            className={`enroll-button ${isEnrolled ? 'enrolled' : isAvailable ? 'available' : 'unavailable'}`}
            onClick={handleEnroll}
            disabled={isEnrolling || isEnrolled || !isAvailable}
          >
            {isEnrolling ? (
              <>
                <span className="spinner"></span>
                Inscribiendo...
              </>
            ) : isEnrolled ? (
              <>
                <span className="button-icon">✅</span>
                Ya inscrito
              </>
            ) : isAvailable ? (
              <>
                <span className="button-icon">📝</span>
                Inscribirse
              </>
            ) : (
              <>
                <span className="button-icon">❌</span>
                No disponible
              </>
            )}
          </button>
        ) : (
          <div className="auth-required">
            <p className="auth-message">
              <span className="auth-icon">🔒</span>
              Inicia sesión para inscribirte
            </p>
            <Link to="/login" className="login-link">
              Iniciar Sesión
            </Link>
          </div>
        )}
      </div>

      {/* Modal de Confirmación de Inscripción */}
      <EnrollmentModal
        activity={activity}
        isOpen={showEnrollmentModal}
        onClose={() => setShowEnrollmentModal(false)}
        onConfirm={handleConfirmEnrollment}
        user={user}
      />
    </div>
  );
};

export default ActivityCard;
