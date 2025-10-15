import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './GenerateDiplomasPage.css';

const GenerateDiplomasPage = () => {
  const navigate = useNavigate();
  const { getAuthToken, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [step, setStep] = useState(1); // 1: Seleccionar actividad, 2: Ingresar resultados, 3: Generar diplomas
  const [formData, setFormData] = useState({
    primer_lugar_email: '',
    segundo_lugar_email: '',
    tercer_lugar_email: '',
    puntuaciones: {
      primer_lugar: '',
      segundo_lugar: '',
      tercer_lugar: ''
    },
    descripciones_proyectos: {
      primer_lugar: '',
      segundo_lugar: '',
      tercer_lugar: ''
    },
    observaciones: ''
  });
  const [foundUsers, setFoundUsers] = useState({
    primer_lugar: null,
    segundo_lugar: null,
    tercer_lugar: null
  });

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('http://localhost:3001/api/activities', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setActivities(data.data || []);
    } catch (error) {
      console.error('Error cargando actividades:', error);
      setError('Error al cargar las actividades');
    }
  };

  const searchUserByEmail = async (email) => {
    if (!email) return null;
    
    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:3001/api/admin/users/search?termino_busqueda=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      // Buscar usuario que coincida exactamente con el email
      if (data.success && data.data && data.data.usuarios) {
        const user = data.data.usuarios.find(u => 
          u.email_usuario && u.email_usuario.toLowerCase() === email.toLowerCase()
        );
        return user || null;
      }
      return null;
    } catch (error) {
      console.error('Error buscando usuario:', error);
      return null;
    }
  };

  const handleActivitySelect = (activity) => {
    setSelectedActivity(activity);
    setStep(2);
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleEmailBlur = async (field, email) => {
    if (!email) {
      setFoundUsers(prev => ({
        ...prev,
        [field]: null
      }));
      return;
    }

    const user = await searchUserByEmail(email);
    setFoundUsers(prev => ({
      ...prev,
      [field]: user
    }));
  };

  const handleGenerateDiplomas = async () => {
    if (!selectedActivity) {
      setError('Por favor selecciona una actividad');
      return;
    }

    // Solo validar campos de ganadores para competencias
    if (selectedActivity.tipo_actividad === 'competencia') {
      if (!formData.primer_lugar_email) {
        setError('El email del primer lugar es obligatorio');
        return;
      }

      if (!foundUsers.primer_lugar) {
        setError('No se encontró el usuario del primer lugar con ese email');
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const token = getAuthToken();

      if (selectedActivity.tipo_actividad === 'competencia') {
        // Flujo para competencias: Registrar resultados + Generar diplomas
        // Paso 1: Registrar resultados de la competencia
        const resultadosData = {
          primer_lugar_usuario: foundUsers.primer_lugar.id_usuario,
          segundo_lugar_usuario: foundUsers.segundo_lugar?.id_usuario || undefined,
          tercer_lugar_usuario: foundUsers.tercer_lugar?.id_usuario || undefined,
          puntuaciones: {
            primer_lugar: formData.puntuaciones.primer_lugar ? parseFloat(formData.puntuaciones.primer_lugar) : undefined,
            segundo_lugar: formData.puntuaciones.segundo_lugar ? parseFloat(formData.puntuaciones.segundo_lugar) : undefined,
            tercer_lugar: formData.puntuaciones.tercer_lugar ? parseFloat(formData.puntuaciones.tercer_lugar) : undefined
          },
          descripciones_proyectos: {
            primer_lugar: formData.descripciones_proyectos.primer_lugar || undefined,
            segundo_lugar: formData.descripciones_proyectos.segundo_lugar || undefined,
            tercer_lugar: formData.descripciones_proyectos.tercer_lugar || undefined
          },
          observaciones: formData.observaciones || undefined
        };

        const resultadosResponse = await fetch(`http://localhost:3001/api/diplomas/competitions/${selectedActivity.id_actividad}/resultados`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(resultadosData)
        });

        if (!resultadosResponse.ok) {
          const errorData = await resultadosResponse.json();
          throw new Error(errorData.message || `Error registrando resultados: ${resultadosResponse.status}`);
        }

        // Paso 2: Generar diplomas de la actividad
        const diplomasData = {
          incluir_participacion: true,
          plantilla_participacion: 'default' // Usar plantilla por defecto
        };

        const diplomasResponse = await fetch(`http://localhost:3001/api/diplomas/activities/${selectedActivity.id_actividad}/generate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(diplomasData)
        });

        if (!diplomasResponse.ok) {
          const errorData = await diplomasResponse.json();
          throw new Error(errorData.message || `Error generando diplomas: ${diplomasResponse.status}`);
        }

        const diplomasResult = await diplomasResponse.json();
        setSuccess(diplomasResult.message || 'Diplomas de competencia generados exitosamente');
      } else {
        // Flujo para otras actividades: Solo generar diplomas de participación
        const diplomasData = {
          incluir_participacion: true,
          plantilla_participacion: 'default' // Usar plantilla por defecto
        };

        const diplomasResponse = await fetch(`http://localhost:3001/api/diplomas/activities/${selectedActivity.id_actividad}/generate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(diplomasData)
        });

        if (!diplomasResponse.ok) {
          const errorData = await diplomasResponse.json();
          throw new Error(errorData.message || `Error generando diplomas: ${diplomasResponse.status}`);
        }

        const diplomasResult = await diplomasResponse.json();
        setSuccess(diplomasResult.message || 'Diplomas de participación generados exitosamente');
      }

      setStep(3);

    } catch (error) {
      console.error('Error generando diplomas:', error);
      setError(error.message || 'Error al generar los diplomas');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedActivity(null);
    setStep(1);
    setFormData({
      primer_lugar_email: '',
      segundo_lugar_email: '',
      tercer_lugar_email: '',
      puntuaciones: {
        primer_lugar: '',
        segundo_lugar: '',
        tercer_lugar: ''
      },
      descripciones_proyectos: {
        primer_lugar: '',
        segundo_lugar: '',
        tercer_lugar: ''
      },
      observaciones: ''
    });
    setFoundUsers({
      primer_lugar: null,
      segundo_lugar: null,
      tercer_lugar: null
    });
    setError(null);
    setSuccess(null);
  };

  const getActivityIcon = (tipo) => {
    switch (tipo) {
      case 'taller': return '🔧';
      case 'competencia': return '🏆';
      case 'conferencia': return '🎤';
      case 'workshop': return '💻';
      default: return '📚';
    }
  };

  return (
    <div className="generate-diplomas-page">
      <div className="diploma-container">
        <div className="management-header">
          <Link to="/admin-panel" className="back-button">
            ← Volver al Panel Admin
          </Link>
          <h1>🎓 Generar Diplomas</h1>
          <p>Selecciona una actividad y registra los ganadores para generar diplomas automáticamente</p>
          <div className="management-info">
            <div className="management-badge">🎓 Generar Diplomas</div>
            <div className="management-email">{user?.email || 'Usuario'}</div>
          </div>
        </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          {success}
        </div>
      )}

      <div className="content-container">
        {/* Indicador de pasos */}
        <div className="steps-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-text">Seleccionar Actividad</span>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-text">Registrar Resultados</span>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-text">Generar Diplomas</span>
          </div>
        </div>

        {/* Paso 1: Selección de Actividad */}
        {step === 1 && (
          <div className="step-content">
            <h2>1. Seleccionar Actividad</h2>
            <p>Elige la actividad para la cual quieres generar diplomas</p>
            
            <div className="activities-grid">
              {activities.map((activity) => (
                <div
                  key={activity.id_actividad}
                  className="activity-card"
                  onClick={() => handleActivitySelect(activity)}
                >
                  <div className="activity-icon">{getActivityIcon(activity.tipo_actividad)}</div>
                  <div className="activity-info">
                    <h3>{activity.nombre_actividad}</h3>
                    <p>{activity.descripcion_actividad}</p>
                    <div className="activity-details">
                      <span className="detail-item">
                        📅 {new Date(activity.fecha_actividad).toLocaleDateString('es-GT')}
                      </span>
                      <span className="detail-item">
                        🕐 {new Date(activity.hora_inicio).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="detail-item">
                        📍 {activity.lugar_actividad}
                      </span>
                      <span className="detail-item">
                        🏷️ {activity.tipo_actividad}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paso 2: Registro de Resultados - Solo para Competencias */}
        {step === 2 && selectedActivity && selectedActivity.tipo_actividad === 'competencia' && (
          <div className="step-content">
            <div className="selected-activity-info">
              <h2>2. Registrar Resultados de Competencia</h2>
              <div className="activity-summary">
                <h3>{getActivityIcon(selectedActivity.tipo_actividad)} {selectedActivity.nombre_actividad}</h3>
                <p>{selectedActivity.descripcion_actividad}</p>
              </div>
            </div>

            <form className="results-form">
              {/* Primer Lugar */}
              <div className="place-section">
                <h3>🥇 Primer Lugar</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email del Usuario *</label>
                    <input
                      type="email"
                      value={formData.primer_lugar_email}
                      onChange={(e) => handleInputChange('primer_lugar_email', e.target.value)}
                      onBlur={(e) => handleEmailBlur('primer_lugar', e.target.value)}
                      placeholder="usuario@ejemplo.com"
                      required
                    />
                    {foundUsers.primer_lugar && (
                      <div className="user-found">
                        ✅ {foundUsers.primer_lugar.nombre_usuario} {foundUsers.primer_lugar.apellido_usuario}
                      </div>
                    )}
                    {formData.primer_lugar_email && !foundUsers.primer_lugar && (
                      <div className="user-not-found">
                        ❌ Usuario no encontrado
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Puntuación</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.puntuaciones.primer_lugar}
                      onChange={(e) => handleInputChange('puntuaciones.primer_lugar', e.target.value)}
                      placeholder="Ej: 95.5"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Descripción del Proyecto</label>
                  <textarea
                    value={formData.descripciones_proyectos.primer_lugar}
                    onChange={(e) => handleInputChange('descripciones_proyectos.primer_lugar', e.target.value)}
                    placeholder="Describe el proyecto ganador..."
                    rows="3"
                  />
                </div>
              </div>

              {/* Segundo Lugar */}
              <div className="place-section">
                <h3>🥈 Segundo Lugar</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email del Usuario</label>
                    <input
                      type="email"
                      value={formData.segundo_lugar_email}
                      onChange={(e) => handleInputChange('segundo_lugar_email', e.target.value)}
                      onBlur={(e) => handleEmailBlur('segundo_lugar', e.target.value)}
                      placeholder="usuario@ejemplo.com"
                    />
                    {foundUsers.segundo_lugar && (
                      <div className="user-found">
                        ✅ {foundUsers.segundo_lugar.nombre_usuario} {foundUsers.segundo_lugar.apellido_usuario}
                      </div>
                    )}
                    {formData.segundo_lugar_email && !foundUsers.segundo_lugar && (
                      <div className="user-not-found">
                        ❌ Usuario no encontrado
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Puntuación</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.puntuaciones.segundo_lugar}
                      onChange={(e) => handleInputChange('puntuaciones.segundo_lugar', e.target.value)}
                      placeholder="Ej: 88.0"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Descripción del Proyecto</label>
                  <textarea
                    value={formData.descripciones_proyectos.segundo_lugar}
                    onChange={(e) => handleInputChange('descripciones_proyectos.segundo_lugar', e.target.value)}
                    placeholder="Describe el proyecto..."
                    rows="3"
                  />
                </div>
              </div>

              {/* Tercer Lugar */}
              <div className="place-section">
                <h3>🥉 Tercer Lugar</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email del Usuario</label>
                    <input
                      type="email"
                      value={formData.tercer_lugar_email}
                      onChange={(e) => handleInputChange('tercer_lugar_email', e.target.value)}
                      onBlur={(e) => handleEmailBlur('tercer_lugar', e.target.value)}
                      placeholder="usuario@ejemplo.com"
                    />
                    {foundUsers.tercer_lugar && (
                      <div className="user-found">
                        ✅ {foundUsers.tercer_lugar.nombre_usuario} {foundUsers.tercer_lugar.apellido_usuario}
                      </div>
                    )}
                    {formData.tercer_lugar_email && !foundUsers.tercer_lugar && (
                      <div className="user-not-found">
                        ❌ Usuario no encontrado
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Puntuación</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.puntuaciones.tercer_lugar}
                      onChange={(e) => handleInputChange('puntuaciones.tercer_lugar', e.target.value)}
                      placeholder="Ej: 82.5"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Descripción del Proyecto</label>
                  <textarea
                    value={formData.descripciones_proyectos.tercer_lugar}
                    onChange={(e) => handleInputChange('descripciones_proyectos.tercer_lugar', e.target.value)}
                    placeholder="Describe el proyecto..."
                    rows="3"
                  />
                </div>
              </div>

              {/* Observaciones Generales */}
              <div className="form-group">
                <label>Observaciones Generales</label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => handleInputChange('observaciones', e.target.value)}
                  placeholder="Observaciones adicionales sobre la competencia..."
                  rows="4"
                />
              </div>

              {/* Botones */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setStep(1)}
                >
                  ← Volver
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleGenerateDiplomas}
                  disabled={loading}
                >
                  {loading ? 'Generando Diplomas...' : 'Generar Diplomas'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Paso 2: Para actividades que NO son competencias */}
        {step === 2 && selectedActivity && selectedActivity.tipo_actividad !== 'competencia' && (
          <div className="step-content">
            <div className="selected-activity-info">
              <h2>2. Generar Diplomas de Actividad</h2>
              <div className="activity-summary">
                <h3>{getActivityIcon(selectedActivity.tipo_actividad)} {selectedActivity.nombre_actividad}</h3>
                <p>{selectedActivity.descripcion_actividad}</p>
              </div>
            </div>

            <div className="activity-info">
              <div className="info-card">
                <h4>📋 Información de la Actividad</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Tipo:</strong> {selectedActivity.tipo_actividad}
                  </div>
                  <div className="info-item">
                    <strong>Categoría:</strong> {selectedActivity.categoria_actividad}
                  </div>
                  <div className="info-item">
                    <strong>Fecha:</strong> {selectedActivity.fecha_actividad ? new Date(selectedActivity.fecha_actividad).toLocaleDateString('es-GT') : 'N/A'}
                  </div>
                  <div className="info-item">
                    <strong>Lugar:</strong> {selectedActivity.lugar_actividad || 'N/A'}
                  </div>
                </div>
              </div>
              
              <div className="diploma-info">
                <h4>🎓 Diplomas a Generar</h4>
                <p>Se generarán diplomas de <strong>participación</strong> para todos los usuarios que asistieron a esta actividad.</p>
                <div className="diploma-features">
                  <div className="feature-item">
                    <span className="feature-icon">✅</span>
                    <span>Diplomas de participación automáticos</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📧</span>
                    <span>Envío automático por email</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📄</span>
                    <span>Formato PDF profesional</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setStep(1)}
              >
                ← Volver
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleGenerateDiplomas}
                disabled={loading}
              >
                {loading ? 'Generando Diplomas...' : 'Generar Diplomas de Participación'}
              </button>
            </div>
          </div>
        )}

        {/* Paso 3: Confirmación */}
        {step === 3 && (
          <div className="step-content">
            <div className="success-content">
              <div className="success-icon-large">🎉</div>
              <h2>¡Diplomas Generados Exitosamente!</h2>
              <p>Los diplomas han sido generados y enviados automáticamente por email a los ganadores.</p>
              
              <div className="generated-info">
                <h3>📋 Resumen de lo generado:</h3>
                <ul>
                  <li>✅ Resultados de competencia registrados</li>
                  <li>✅ Diplomas de competencia generados</li>
                  <li>✅ Diplomas de participación generados</li>
                  <li>✅ Emails enviados automáticamente</li>
                </ul>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={resetForm}
                >
                  Generar Más Diplomas
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => navigate('/admin-panel')}
                >
                  Volver al Panel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Generando diplomas...</p>
        </div>
      )}
      </div>
    </div>
  );
};

export default GenerateDiplomasPage;
