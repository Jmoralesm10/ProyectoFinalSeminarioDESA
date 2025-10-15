import React, { useState, useEffect } from 'react';
import './AttendanceHistory.css';

const AttendanceHistory = ({ userId }) => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      loadAttendanceHistory();
    }
  }, [userId]);

  const loadAttendanceHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      const response = await fetch(`https://proyecto-final-seminario-desa-dmgi.vercel.app/api/attendance/user?codigo_qr_usuario=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setAttendanceData(result.data);
      } else {
        setError(result.message || 'Error al cargar el historial de asistencia');
      }
    } catch (err) {
      setError('Error de conexión al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('es-GT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="attendance-history">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Cargando historial de asistencia...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="attendance-history">
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button className="btn-secondary" onClick={loadAttendanceHistory}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!attendanceData) {
    return (
      <div className="attendance-history">
        <div className="no-data">
          <div className="no-data-icon">📊</div>
          <p>No hay datos de asistencia disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-history">
      <div className="attendance-summary">
        <h3>Resumen de Asistencia</h3>
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-icon">📅</div>
            <div className="card-content">
              <h4>{attendanceData.asistencia_general?.length || 0}</h4>
              <p>Días de Asistencia General</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="card-icon">🎯</div>
            <div className="card-content">
              <h4>{attendanceData.asistencia_actividades?.length || 0}</h4>
              <p>Actividades Asistidas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Asistencia General */}
      {attendanceData.asistencia_general && attendanceData.asistencia_general.length > 0 && (
        <div className="attendance-section">
          <h4>Asistencia General al Congreso</h4>
          <div className="attendance-list">
            {attendanceData.asistencia_general.map((attendance, index) => (
              <div key={index} className="attendance-item">
                <div className="attendance-date">
                  <span className="date">{formatDate(attendance.fecha_asistencia)}</span>
                  <span className="time">{formatTime(attendance.hora_ingreso)}</span>
                </div>
                <div className="attendance-status success">
                  <span className="status-icon">✅</span>
                  <span>Asistencia Registrada</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Asistencia a Actividades */}
      {attendanceData.asistencia_actividades && attendanceData.asistencia_actividades.length > 0 && (
        <div className="attendance-section">
          <h4>Asistencia a Actividades</h4>
          <div className="attendance-list">
            {attendanceData.asistencia_actividades.map((attendance, index) => (
              <div key={index} className="attendance-item activity">
                <div className="attendance-info">
                  <div className="activity-name">{attendance.nombre_actividad}</div>
                  <div className="activity-type">{attendance.tipo_actividad}</div>
                  <div className="attendance-date">
                    <span className="date">{formatDate(attendance.fecha_asistencia)}</span>
                    <span className="time">{formatTime(attendance.fecha_asistencia)}</span>
                  </div>
                </div>
                <div className="attendance-status success">
                  <span className="status-icon">✅</span>
                  <span>Asistencia Registrada</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sin asistencia */}
      {(!attendanceData.asistencia_general || attendanceData.asistencia_general.length === 0) &&
       (!attendanceData.asistencia_actividades || attendanceData.asistencia_actividades.length === 0) && (
        <div className="no-attendance">
          <div className="no-attendance-icon">📝</div>
          <h4>Sin Registros de Asistencia</h4>
          <p>Este usuario no tiene registros de asistencia aún.</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;
