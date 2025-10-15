import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminGuard from '../components/AdminGuard/AdminGuard';
import QRScanner from '../components/QRScanner/QRScanner';
import './AttendancePage.css';

const AttendancePage = () => {
  const { user } = useAuth();
  const [scannerActive, setScannerActive] = useState(false);
  const [attendanceType, setAttendanceType] = useState('general'); // 'general' o 'activity'
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Cargar actividades disponibles
  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/activities?limite=100');
      const result = await response.json();
      
      if (result.success) {
        setActivities(result.data || []);
      } else {
        setError('Error al cargar las actividades');
      }
    } catch (err) {
      setError('Error de conexión al cargar actividades');
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = async (qrCode) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);


      let endpoint, body;

      if (attendanceType === 'general') {
        // Asistencia general al congreso
        endpoint = 'http://localhost:3001/api/attendance/general';
        body = {
          codigo_qr_usuario: qrCode
        };
      } else {
        // Asistencia a actividad específica
        if (!selectedActivity) {
          setError('Por favor selecciona una actividad');
          setLoading(false);
          return;
        }

        endpoint = 'http://localhost:3001/api/attendance/activity';
        body = {
          codigo_qr_usuario: qrCode,
          id_actividad: selectedActivity.id_actividad
        };
      }


      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });


      const result = await response.json();

      if (result.success) {
        setResult({
          type: 'success',
          message: result.message,
          data: result.data
        });
      } else {
        setResult({
          type: 'error',
          message: result.message || 'Error desconocido del servidor'
        });
      }

      // Detener el escáner después del escaneo
      setScannerActive(false);

    } catch (err) {
      console.error('❌ Error en handleQRScan:', err);
      setError('Error de conexión al registrar asistencia: ' + err.message);
      setResult({
        type: 'error',
        message: 'Error de conexión al registrar asistencia'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScannerError = (error) => {
    console.error('Error del escáner:', error);
    setError('Error al acceder a la cámara: ' + error.message);
  };

  const startScanning = () => {
    if (attendanceType === 'activity' && !selectedActivity) {
      setError('Por favor selecciona una actividad antes de escanear');
      return;
    }
    
    setError(null);
    setResult(null);
    setScannerActive(true);
  };

  const stopScanning = () => {
    setScannerActive(false);
  };

  const resetForm = () => {
    setResult(null);
    setError(null);
    setScannerActive(false);
  };

  return (
    <AdminGuard>
      <div className="attendance-page">
      <div className="attendance-container">
        <header className="attendance-header">
          <Link to="/admin-panel" className="back-button">
            <span>←</span> Volver al Panel Admin
          </Link>
          <h1>📱 Registro de Asistencia</h1>
          <p>Escanea el código QR del usuario para registrar su asistencia</p>
          <div className="management-info">
            <span className="management-badge">📱 Tomar Asistencia</span>
            <span className="management-email">{user?.email_usuario}</span>
          </div>
        </header>

        {/* Selector de tipo de asistencia */}
        <div className="attendance-type-selector">
          <h3>Tipo de Asistencia</h3>
          <div className="type-options">
            <label className="type-option">
              <input
                type="radio"
                name="attendanceType"
                value="general"
                checked={attendanceType === 'general'}
                onChange={(e) => setAttendanceType(e.target.value)}
                disabled={scannerActive}
              />
              <span className="option-content">
                <strong>Asistencia General</strong>
                <small>Registro de llegada al congreso</small>
              </span>
            </label>
            
            <label className="type-option">
              <input
                type="radio"
                name="attendanceType"
                value="activity"
                checked={attendanceType === 'activity'}
                onChange={(e) => setAttendanceType(e.target.value)}
                disabled={scannerActive}
              />
              <span className="option-content">
                <strong>Asistencia a Actividad</strong>
                <small>Registro de participación en actividad específica</small>
              </span>
            </label>
          </div>
        </div>

        {/* Selector de actividad (solo si es asistencia a actividad) */}
        {attendanceType === 'activity' && (
          <div className="activity-selector">
            <h3>Seleccionar Actividad</h3>
            {loading ? (
              <p>Cargando actividades...</p>
            ) : (
              <select
                value={selectedActivity?.id_actividad || ''}
                onChange={(e) => {
                  const activityId = parseInt(e.target.value);
                  const activity = activities.find(a => a.id_actividad === activityId);
                  setSelectedActivity(activity || null);
                }}
                disabled={scannerActive}
                className="activity-select"
              >
                <option value="">Selecciona una actividad</option>
                {activities.map(activity => (
                  <option key={activity.id_actividad} value={activity.id_actividad}>
                    {activity.nombre_actividad} - {activity.tipo_actividad}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Controles del escáner */}
        <div className="scanner-controls">
          {!scannerActive ? (
            <button
              className="btn-primary btn-scan"
              onClick={startScanning}
              disabled={loading || (attendanceType === 'activity' && !selectedActivity)}
            >
              {loading ? 'Cargando...' : 'Iniciar Escáner'}
            </button>
          ) : (
            <button
              className="btn-secondary btn-stop"
              onClick={stopScanning}
            >
              Detener Escáner
            </button>
          )}
        </div>

        {/* Escáner QR */}
        {scannerActive && (
          <div className="scanner-section">
            <QRScanner
              onScan={handleQRScan}
              onError={handleScannerError}
              isActive={scannerActive}
            />
          </div>
        )}

        {/* Resultados */}
        {result && (
          <div className={`result-message ${result.type}`}>
            <div className="result-icon">
              {result.type === 'success' ? '✅' : '❌'}
            </div>
            <div className="result-content">
              <h4>{result.type === 'success' ? 'Asistencia Registrada' : 'Error'}</h4>
              <p>{result.message}</p>
              {result.data && (
                <div className="result-details">
                  {result.data.nombre_completo && (
                    <p><strong>Usuario:</strong> {result.data.nombre_completo}</p>
                  )}
                  {result.data.nombre_actividad && (
                    <p><strong>Actividad:</strong> {result.data.nombre_actividad}</p>
                  )}
                  {result.data.fecha_asistencia && (
                    <p><strong>Fecha:</strong> {new Date(result.data.fecha_asistencia).toLocaleDateString()}</p>
                  )}
                  {result.data.hora_ingreso && (
                    <p><strong>Hora:</strong> {new Date(result.data.hora_ingreso).toLocaleTimeString()}</p>
                  )}
                </div>
              )}
            </div>
            <button className="btn-secondary btn-reset" onClick={resetForm}>
              Nuevo Escaneo
            </button>
          </div>
        )}

        {/* Mensajes de error */}
        {error && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button className="btn-secondary" onClick={() => setError(null)}>
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
    </AdminGuard>
  );
};

export default AttendancePage;
