// =====================================================
// Página de Dashboard - Versión Mejorada
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './DashboardPage.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading, logout, getUserInscriptions } = useAuth();
  const [userInscriptions, setUserInscriptions] = useState([]);
  const [inscriptionsLoading, setInscriptionsLoading] = useState(false);
  
  // Nuevos estados para información adicional
  const [userStats, setUserStats] = useState({
    totalActivities: 0,
    completedActivities: 0,
    totalAttendance: 0,
    diplomasEarned: 0,
    pendingPayments: 0
  });
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [userDiplomas, setUserDiplomas] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [congressStats, setCongressStats] = useState({});
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, loading, navigate]);

  // Función para obtener el token de autenticación
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Función principal para cargar todos los datos del dashboard
  const loadDashboardData = async () => {
    setLoadingStats(true);
    try {
      await Promise.all([
        loadUserInscriptions(),
        loadUserStats(),
        loadAttendanceHistory(),
        loadUserDiplomas(),
        loadPaymentHistory(),
        loadCongressStats()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadUserInscriptions = async () => {
    setInscriptionsLoading(true);
    try {
      const inscriptions = await getUserInscriptions();
      setUserInscriptions(inscriptions);
    } catch (error) {
      console.error('Error loading user inscriptions:', error);
    } finally {
      setInscriptionsLoading(false);
    }
  };

  // Cargar estadísticas del usuario
  const loadUserStats = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Obtener estadísticas de asistencia
      const attendanceResponse = await fetch('https://proyecto-final-seminario-desa-dmgi.vercel.app/api/attendance/user', {
        headers
      });

      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json();
        if (attendanceData.success) {
          setAttendanceHistory(attendanceData.data || []);
          setUserStats(prev => ({
            ...prev,
            totalAttendance: attendanceData.data?.length || 0
          }));
        }
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  // Cargar historial de asistencia
  const loadAttendanceHistory = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch('https://proyecto-final-seminario-desa-dmgi.vercel.app/api/attendance/user', {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAttendanceHistory(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading attendance history:', error);
    }
  };

  // Cargar diplomas del usuario
  const loadUserDiplomas = async () => {
    try {
      const token = getAuthToken();
      if (!token || !user?.id_usuario) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`https://proyecto-final-seminario-desa-dmgi.vercel.app/api/diplomas/user/${user.id_usuario}`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserDiplomas(data.data || []);
          setUserStats(prev => ({
            ...prev,
            diplomasEarned: data.data?.length || 0
          }));
        }
      }
    } catch (error) {
      console.error('Error loading user diplomas:', error);
    }
  };

  // Cargar historial de pagos
  const loadPaymentHistory = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch('https://proyecto-final-seminario-desa-dmgi.vercel.app/api/payments/user', {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPaymentHistory(data.data || []);
          const pendingCount = data.data?.filter(payment => payment.estado_pago === 'pendiente').length || 0;
          setUserStats(prev => ({
            ...prev,
            pendingPayments: pendingCount
          }));
        }
      }
    } catch (error) {
      console.error('Error loading payment history:', error);
    }
  };

  // Cargar estadísticas del congreso
  const loadCongressStats = async () => {
    try {
      const response = await fetch('https://proyecto-final-seminario-desa-dmgi.vercel.app/api/public/stats');

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCongressStats(data.estadisticas || {});
        }
      }
    } catch (error) {
      console.error('Error loading congress stats:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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

  if (!user) {
    return null; // Se redirigirá al login
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header del Dashboard */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            <span className="dashboard-title-icon">🎉</span>
            ¡Bienvenido al Dashboard!
          </h1>
          <div className="header-home-action">
            <button
              onClick={() => navigate('/')}
              className="action-button home-button"
            >
              🏠 Volver al Inicio
            </button>
          </div>
        </div>

        {/* Estadísticas del Usuario */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-number">{userInscriptions.length}</span>
            <span className="stat-label">Actividades Inscritas</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{userStats.totalAttendance}</span>
            <span className="stat-label">Asistencias Registradas</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{userStats.diplomasEarned}</span>
            <span className="stat-label">Diplomas Obtenidos</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{userStats.pendingPayments}</span>
            <span className="stat-label">Pagos Pendientes</span>
          </div>
        </div>

        {/* Grid Principal de Información */}
        <div className="dashboard-grid">
          {/* Información Personal */}
          <div className="info-card">
            <div className="card-header">
              <span className="card-icon">👤</span>
              <h3 className="card-title">Información Personal</h3>
            </div>
            <div className="card-content">
              <div className="info-item">
                <span className="info-label">Nombre:</span>
                <span className="info-value">{user.nombre_usuario} {user.apellido_usuario}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{user.email_usuario}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Tipo de Usuario:</span>
                <span className={`user-type-badge ${user.tipo_usuario === 'interno' ? 'interno' : 'externo'}`}>
                  {user.tipo_usuario === 'interno' ? 'Estudiante UMG' : 'Estudiante Externo'}
                </span>
              </div>
              {user.telefono_usuario && (
                <div className="info-item">
                  <span className="info-label">Teléfono:</span>
                  <span className="info-value">{user.telefono_usuario}</span>
                </div>
              )}
              {user.colegio_usuario && (
                <div className="info-item">
                  <span className="info-label">Colegio:</span>
                  <span className="info-value">{user.colegio_usuario}</span>
                </div>
              )}
            </div>
          </div>

          {/* Estado de Inscripción */}
          <div className="info-card">
            <div className="card-header">
              <span className="card-icon">📋</span>
              <h3 className="card-title">Estado de Inscripción</h3>
            </div>
            <div className="card-content">
              <div className="info-item">
                <span className="info-label">Estado:</span>
                <span className={`status-badge ${user.estado_usuario ? 'active' : 'inactive'}`}>
                  {user.estado_usuario ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Email Verificado:</span>
                <span className={`status-badge ${user.email_verificado_usuario ? 'verified' : 'pending'}`}>
                  {user.email_verificado_usuario ? 'Sí' : 'No'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Fecha de Inscripción:</span>
                <span className="info-value">{new Date(user.fecha_inscripcion_usuario).toLocaleDateString('es-GT')}</span>
              </div>
              {user.ultimo_acceso_usuario && (
                <div className="info-item">
                  <span className="info-label">Último Acceso:</span>
                  <span className="info-value">{new Date(user.ultimo_acceso_usuario).toLocaleDateString('es-GT')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Progreso de Participación */}
          <div className="info-card">
            <div className="card-header">
              <span className="card-icon">📊</span>
              <h3 className="card-title">Progreso de Participación</h3>
            </div>
            <div className="card-content">
              <div className="progress-section">
                <div className="progress-item">
                  <div className="progress-header">
                    <span className="progress-label">Actividades Completadas</span>
                    <span className="progress-percentage">
                      {userInscriptions.length > 0 ? Math.round((userStats.totalAttendance / userInscriptions.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${userInscriptions.length > 0 ? Math.round((userStats.totalAttendance / userInscriptions.length) * 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div className="progress-item">
                  <div className="progress-header">
                    <span className="progress-label">Diplomas Obtenidos</span>
                    <span className="progress-percentage">
                      {userInscriptions.length > 0 ? Math.round((userStats.diplomasEarned / userInscriptions.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${userInscriptions.length > 0 ? Math.round((userStats.diplomasEarned / userInscriptions.length) * 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas del Congreso */}
          <div className="info-card">
            <div className="card-header">
              <span className="card-icon">🌐</span>
              <h3 className="card-title">Estadísticas del Congreso</h3>
            </div>
            <div className="card-content">
              <div className="info-item">
                <span className="info-label">Total Usuarios:</span>
                <span className="info-value">{congressStats.total_usuarios_registrados || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Actividades:</span>
                <span className="info-value">{congressStats.total_actividades || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Ponentes:</span>
                <span className="info-value">{congressStats.total_ponentes || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Días del Congreso:</span>
                <span className="info-value">{congressStats.total_dias_congreso || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Inscripciones */}
        <div className="inscriptions-section">
          <div className="inscriptions-header">
            <span className="card-icon">📋</span>
            <h3 className="card-title">Mis Inscripciones a Actividades</h3>
          </div>
          
          {inscriptionsLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Cargando inscripciones...</p>
            </div>
          ) : userInscriptions.length > 0 ? (
            <div className="inscriptions-list">
              {userInscriptions.map((inscription, index) => (
                <div key={index} className="inscription-item">
                  <div className="inscription-info">
                    <h4>{inscription.nombre_actividad}</h4>
                    <p className="inscription-date">
                      Fecha de inscripción: {new Date(inscription.fecha_inscripcion).toLocaleDateString('es-GT')}
                    </p>
                  </div>
                  <span className={`status-badge ${inscription.estado_inscripcion === 'confirmada' ? 'confirmed' : 'pending'}`}>
                    {inscription.estado_inscripcion}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="loading-container">
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📝</div>
              <p className="loading-text">Aún no te has inscrito a ninguna actividad</p>
              <div className="action-buttons">
                <button
                  onClick={() => navigate('/')}
                  className="action-button"
                >
                  Ver Actividades Disponibles
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sección de Diplomas */}
        {userDiplomas.length > 0 && (
          <div className="diplomas-section">
            <div className="diplomas-header">
              <span className="card-icon">🏆</span>
              <h3 className="card-title">Mis Diplomas</h3>
            </div>
            {userDiplomas.map((diploma, index) => (
              <div key={index} className="diploma-item">
                <div className="diploma-info">
                  <h4>{diploma.nombre_actividad || 'Diploma del Congreso'}</h4>
                  <p className="diploma-date">
                    Generado: {new Date(diploma.fecha_generacion).toLocaleDateString('es-GT')}
                  </p>
                </div>
                <button className="download-button">
                  📥 Descargar
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Sección de Bienvenida */}
        <div className="welcome-section">
          <h2 className="welcome-title">
            🎓 ¡Bienvenido al Congreso de Tecnología 2025!
          </h2>
          <p className="welcome-message">
            Tu inscripción ha sido confirmada exitosamente. 
            Mantente atento a futuras comunicaciones sobre el evento y aprovecha al máximo tu participación.
          </p>
          <div className="welcome-actions">
            <button
              onClick={() => navigate('/activities')}
              className="action-button"
            >
              📋 Ver Actividades
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
