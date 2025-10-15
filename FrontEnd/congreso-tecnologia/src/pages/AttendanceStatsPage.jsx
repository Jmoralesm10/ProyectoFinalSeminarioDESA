import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import StatsCard from '../components/AttendanceStats/StatsCard';
import AttendanceChart from '../components/AttendanceStats/AttendanceChart';
import PopularActivitiesChart from '../components/AttendanceStats/PopularActivitiesChart';
import AttendanceTable from '../components/AttendanceStats/AttendanceTable';
import './AttendanceStatsPage.css';

const AttendanceStatsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
    }
  }, [isAuthenticated, selectedPeriod]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      const response = await fetch('https://proyecto-final-seminario-desa-dmgi.vercel.app/api/attendance/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.message || 'Error al cargar estadísticas');
      }
    } catch (err) {
      setError('Error de conexión al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = () => {
    loadStats();
  };

  if (!isAuthenticated) {
    return (
      <div className="attendance-stats-page">
        <div className="auth-required">
          <div className="auth-required-content">
            <h2>🔒 Acceso Restringido</h2>
            <p>Necesitas iniciar sesión para ver las estadísticas de asistencia.</p>
            <Link to="/login" className="btn-primary">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Verificar si el usuario tiene permisos de administrador
  const isAdmin = user?.tipo_usuario === 'administrador' || user?.es_administrador;

  if (!isAdmin) {
    return (
      <div className="attendance-stats-page">
        <div className="auth-required">
          <div className="auth-required-content">
            <h2>🚫 Acceso Denegado</h2>
            <p>Se requieren permisos de administrador para ver las estadísticas de asistencia.</p>
            <p>Contacta al administrador del sistema si necesitas acceso.</p>
            <Link to="/" className="btn-primary">
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="attendance-stats-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="attendance-stats-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error al cargar estadísticas</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={refreshStats}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="attendance-stats-page">
        <div className="no-data-container">
          <div className="no-data-icon">📊</div>
          <h3>No hay datos disponibles</h3>
          <p>No se encontraron estadísticas de asistencia.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-stats-page">
      <div className="stats-container">
        {/* Header */}
        <header className="stats-header">
          <Link to="/admin-panel" className="back-button">
            <span>←</span>
            Volver al Panel Admin
          </Link>
          <div className="header-content">
            <h1>Estadísticas de Asistencia</h1>
            <p>Análisis detallado de la participación en el congreso</p>
          </div>
        </header>

        {/* Filtros de período */}
        <div className="stats-filters">
          <div className="period-selector">
            <label>Período:</label>
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="period-select"
            >
              <option value="today">Hoy</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mes</option>
              <option value="all">Todo el Período</option>
            </select>
          </div>
          <button className="btn-refresh" onClick={refreshStats} title="Actualizar estadísticas">
            🔄 Actualizar
          </button>
        </div>

        {/* Tarjetas de estadísticas principales */}
        <div className="stats-cards-grid">
          <StatsCard
            title="Total de Usuarios"
            value={stats.total_usuarios_registrados}
            icon="👥"
            color="#667eea"
            subtitle="Registrados en el sistema"
          />
          <StatsCard
            title="Asistencia General"
            value={stats.total_asistencia_general}
            icon="📅"
            color="#27ae60"
            subtitle={`${stats.porcentaje_asistencia_general}% de participación`}
          />
          <StatsCard
            title="Asistencia a Actividades"
            value={stats.total_asistencia_actividades}
            icon="🎯"
            color="#e74c3c"
            subtitle="Participaciones en actividades"
          />
          <StatsCard
            title="Tasa de Participación"
            value={`${stats.porcentaje_asistencia_general}%`}
            icon="📈"
            color="#f39c12"
            subtitle="Usuarios que han asistido"
          />
        </div>

        {/* Gráficos */}
        <div className="charts-section">
          <div className="chart-container">
            <h3>Distribución de Asistencia</h3>
            <AttendanceChart stats={stats} />
          </div>
          
          <div className="chart-container">
            <h3>Actividades Más Populares</h3>
            <PopularActivitiesChart activities={stats.actividades_mas_populares} />
          </div>
        </div>

        {/* Tabla de actividades */}
        <div className="table-section">
          <h3>Detalle de Actividades</h3>
          <AttendanceTable activities={stats.actividades_mas_populares} />
        </div>

        {/* Información adicional */}
        <div className="stats-info">
          <div className="info-card">
            <h4>📊 Información de las Estadísticas</h4>
            <ul>
              <li>Las estadísticas se actualizan en tiempo real</li>
              <li>Los datos incluyen todos los usuarios registrados</li>
              <li>La asistencia general se cuenta una vez por día por usuario</li>
              <li>Las actividades populares se ordenan por número de asistentes</li>
            </ul>
          </div>
          
          <div className="info-card">
            <h4>🔄 Última Actualización</h4>
            <p>{new Date().toLocaleString('es-GT')}</p>
            <button className="btn-secondary" onClick={refreshStats}>
              Actualizar Ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceStatsPage;
