import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminGuard from '../components/AdminGuard/AdminGuard';
import './EditActivityPage.css';

const EditActivityPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState('select'); // 'select' o 'edit'
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    id_categoria: '',
    nombre_actividad: '',
    descripcion_actividad: '',
    tipo_actividad: 'taller',
    fecha_inicio_actividad: '',
    fecha_fin_actividad: '',
    fecha_limite_inscripcion: '',
    duracion_estimada_minutos: '',
    cupo_maximo_actividad: '',
    lugar_actividad: '',
    ponente_actividad: '',
    requisitos_actividad: '',
    nivel_requerido: 'basico',
    edad_minima: '',
    edad_maxima: '',
    materiales_requeridos: '',
    costo_actividad: '',
    moneda_costo: 'GTQ',
    permite_inscripciones: true,
    requiere_aprobacion: false,
    estado_actividad: true
  });

  const [categories, setCategories] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  // Función para obtener el token de autenticación
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Cargar actividades al montar el componente
  useEffect(() => {
    loadActivities();
    loadCategories();
  }, []);

  // Cargar actividades activas
  const loadActivities = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('https://proyecto-final-seminario-desa-dmgi.vercel.app/api/activities', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Filtrar solo actividades activas
        const activeActivities = result.data.filter(activity => activity.estado_actividad);
        setActivities(activeActivities);
      } else {
        throw new Error(result.message || 'Error al cargar actividades');
      }
    } catch (err) {
      console.error('Error al cargar actividades:', err);
      setError(`Error al cargar actividades: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías
  const loadCategories = async () => {
    try {
      const response = await fetch('https://proyecto-final-seminario-desa-dmgi.vercel.app/api/activities/categories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setCategories(result.data);
      }
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  };

  // Seleccionar actividad para editar
  const selectActivity = async (activity) => {
    try {
      setLoading(true);
      setError('');
      
      // Obtener datos completos de la actividad
      const response = await fetch(`https://proyecto-final-seminario-desa-dmgi.vercel.app/api/activities/${activity.id_actividad}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const activityData = result.data;
        
        // Formatear fechas para el input datetime-local
        const formatDateForInput = (dateString) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toISOString().slice(0, 16);
        };

        // Poblar el formulario con los datos actuales
        setFormData({
          id_categoria: activityData.id_categoria || '',
          nombre_actividad: activityData.nombre_actividad || '',
          descripcion_actividad: activityData.descripcion_actividad || '',
          tipo_actividad: activityData.tipo_actividad || 'taller',
          fecha_inicio_actividad: formatDateForInput(activityData.fecha_inicio_actividad),
          fecha_fin_actividad: formatDateForInput(activityData.fecha_fin_actividad),
          fecha_limite_inscripcion: formatDateForInput(activityData.fecha_limite_inscripcion),
          duracion_estimada_minutos: activityData.duracion_estimada_minutos || '',
          cupo_maximo_actividad: activityData.cupo_maximo_actividad || '',
          lugar_actividad: activityData.lugar_actividad || '',
          ponente_actividad: activityData.ponente_actividad || '',
          requisitos_actividad: activityData.requisitos_actividad || '',
          nivel_requerido: activityData.nivel_requerido || 'basico',
          edad_minima: activityData.edad_minima || '',
          edad_maxima: activityData.edad_maxima || '',
          materiales_requeridos: activityData.materiales_requeridos || '',
          costo_actividad: activityData.costo_actividad || '',
          moneda_costo: activityData.moneda_costo || 'GTQ',
          permite_inscripciones: activityData.permite_inscripciones !== undefined ? activityData.permite_inscripciones : true,
          requiere_aprobacion: activityData.requiere_aprobacion !== undefined ? activityData.requiere_aprobacion : false,
          estado_actividad: activityData.estado_actividad !== undefined ? activityData.estado_actividad : true
        });

        setSelectedActivity(activityData);
        setStep('edit');
      } else {
        throw new Error(result.message || 'Error al obtener datos de la actividad');
      }
    } catch (err) {
      console.error('Error al seleccionar actividad:', err);
      setError(`Error al cargar datos de la actividad: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpiar error de validación específico
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validaciones del formulario
  const validateForm = () => {
    const errors = {};

    if (!formData.nombre_actividad.trim()) {
      errors.nombre_actividad = 'El nombre de la actividad es obligatorio';
    }

    if (!formData.descripcion_actividad.trim()) {
      errors.descripcion_actividad = 'La descripción es obligatoria';
    }

    if (!formData.tipo_actividad) {
      errors.tipo_actividad = 'El tipo de actividad es obligatorio';
    }

    if (!formData.fecha_inicio_actividad) {
      errors.fecha_inicio_actividad = 'La fecha de inicio es obligatoria';
    }

    if (!formData.fecha_fin_actividad) {
      errors.fecha_fin_actividad = 'La fecha de fin es obligatoria';
    }

    if (formData.fecha_inicio_actividad && formData.fecha_fin_actividad) {
      const fechaInicio = new Date(formData.fecha_inicio_actividad);
      const fechaFin = new Date(formData.fecha_fin_actividad);
      
      if (fechaFin <= fechaInicio) {
        errors.fecha_fin_actividad = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    if (!formData.cupo_maximo_actividad || formData.cupo_maximo_actividad <= 0) {
      errors.cupo_maximo_actividad = 'El cupo máximo debe ser mayor a 0';
    }

    if (!formData.lugar_actividad.trim()) {
      errors.lugar_actividad = 'El lugar es obligatorio';
    }

    if (!formData.ponente_actividad.trim()) {
      errors.ponente_actividad = 'El ponente es obligatorio';
    }

    if (formData.edad_minima && formData.edad_maxima) {
      if (parseInt(formData.edad_maxima) < parseInt(formData.edad_minima)) {
        errors.edad_maxima = 'La edad máxima debe ser mayor o igual a la edad mínima';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Preparar datos para envío
      const activityData = {
        id_categoria: formData.id_categoria ? parseInt(formData.id_categoria) : null,
        nombre_actividad: formData.nombre_actividad.trim(),
        descripcion_actividad: formData.descripcion_actividad.trim(),
        tipo_actividad: formData.tipo_actividad,
        fecha_inicio_actividad: formData.fecha_inicio_actividad,
        fecha_fin_actividad: formData.fecha_fin_actividad,
        fecha_limite_inscripcion: formData.fecha_limite_inscripcion || null,
        duracion_estimada_minutos: formData.duracion_estimada_minutos ? parseInt(formData.duracion_estimada_minutos) : null,
        cupo_maximo_actividad: parseInt(formData.cupo_maximo_actividad),
        lugar_actividad: formData.lugar_actividad.trim(),
        ponente_actividad: formData.ponente_actividad.trim(),
        requisitos_actividad: formData.requisitos_actividad.trim() || null,
        nivel_requerido: formData.nivel_requerido,
        edad_minima: formData.edad_minima ? parseInt(formData.edad_minima) : null,
        edad_maxima: formData.edad_maxima ? parseInt(formData.edad_maxima) : null,
        materiales_requeridos: formData.materiales_requeridos.trim() || null,
        costo_actividad: formData.costo_actividad ? parseFloat(formData.costo_actividad) : null,
        moneda_costo: formData.moneda_costo,
        permite_inscripciones: formData.permite_inscripciones,
        requiere_aprobacion: formData.requiere_aprobacion,
        estado_actividad: formData.estado_actividad
      };

      const response = await fetch(`https://proyecto-final-seminario-desa-dmgi.vercel.app/api/activities/${selectedActivity.id_actividad}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(activityData)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('¡Actividad actualizada exitosamente!');
        setTimeout(() => {
          navigate('/gestion-actividades');
        }, 2000);
      } else {
        throw new Error(result.message || 'Error al actualizar la actividad');
      }
    } catch (err) {
      console.error('Error al actualizar actividad:', err);
      setError(`Error al actualizar la actividad: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Volver a la selección
  const backToSelection = () => {
    setStep('select');
    setSelectedActivity(null);
    setFormData({
      id_categoria: '',
      nombre_actividad: '',
      descripcion_actividad: '',
      tipo_actividad: 'taller',
      fecha_inicio_actividad: '',
      fecha_fin_actividad: '',
      fecha_limite_inscripcion: '',
      duracion_estimada_minutos: '',
      cupo_maximo_actividad: '',
      lugar_actividad: '',
      ponente_actividad: '',
      requisitos_actividad: '',
      nivel_requerido: 'basico',
      edad_minima: '',
      edad_maxima: '',
      materiales_requeridos: '',
      costo_actividad: '',
      moneda_costo: 'GTQ',
      permite_inscripciones: true,
      requiere_aprobacion: false,
      estado_actividad: true
    });
    setValidationErrors({});
    setError('');
    setSuccess('');
  };

  // Renderizar paso de selección
  const renderSelectionStep = () => (
    <div className="edit-activity-container">
      <div className="edit-activity-header">
        <Link to="/gestion-actividades" className="back-button">
          <span>←</span> Volver a Gestión de Actividades
        </Link>
        <h1>✏️ Editar Actividad</h1>
        <p>Selecciona la actividad que deseas editar</p>
        <div className="management-info">
          <span className="management-badge">✏️ Editar Actividad</span>
          <span className="management-email">{user?.email_usuario}</span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando actividades...</p>
        </div>
      ) : (
        <div className="activities-grid">
          {activities.length === 0 ? (
            <div className="no-activities">
              <p>No hay actividades activas disponibles para editar</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id_actividad} className="activity-card">
                <div className="activity-header">
                  <h3>{activity.nombre_actividad}</h3>
                  <span className={`activity-type ${activity.tipo_actividad}`}>
                    {activity.tipo_actividad === 'taller' ? '🔧 Taller' : '🏆 Competencia'}
                  </span>
                </div>
                
                <div className="activity-details">
                  <p><strong>📅 Fecha:</strong> {new Date(activity.fecha_inicio_actividad).toLocaleDateString()}</p>
                  <p><strong>📍 Lugar:</strong> {activity.lugar_actividad}</p>
                  <p><strong>👥 Cupo:</strong> {activity.cupo_maximo_actividad} personas</p>
                  <p><strong>👨‍🏫 Ponente:</strong> {activity.ponente_actividad}</p>
                </div>

                <div className="activity-actions">
                  <button 
                    onClick={() => selectActivity(activity)}
                    className="edit-button"
                    disabled={loading}
                  >
                    ✏️ Editar Actividad
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="edit-activity-actions">
        <button 
          onClick={() => navigate('/gestion-actividades')}
          className="back-button"
        >
          ← Volver a Gestión de Actividades
        </button>
      </div>
    </div>
  );

  // Renderizar paso de edición
  const renderEditStep = () => (
    <div className="edit-activity-container">
      <div className="edit-activity-header">
        <Link to="/gestion-actividades" className="back-button">
          <span>←</span> Volver a Gestión de Actividades
        </Link>
        <h1>✏️ Editando: {selectedActivity?.nombre_actividad}</h1>
        <p>Modifica los datos de la actividad</p>
        <div className="management-info">
          <span className="management-badge">✏️ Editar Actividad</span>
          <span className="management-email">{user?.email || 'Usuario'}</span>
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

      <form onSubmit={handleSubmit} className="edit-activity-form">
        <div className="form-section">
          <h3>📋 Información Básica</h3>
          
          <div className="form-group">
            <label htmlFor="nombre_actividad" className="form-label">Nombre de la Actividad *</label>
            <input
              type="text"
              id="nombre_actividad"
              name="nombre_actividad"
              value={formData.nombre_actividad}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.nombre_actividad ? 'error' : ''}`}
              placeholder="Ej: Taller de Python Avanzado"
            />
            {validationErrors.nombre_actividad && (
              <span className="field-error">{validationErrors.nombre_actividad}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="descripcion_actividad" className="form-label">Descripción *</label>
            <textarea
              id="descripcion_actividad"
              name="descripcion_actividad"
              value={formData.descripcion_actividad}
              onChange={handleInputChange}
              className={`form-textarea ${validationErrors.descripcion_actividad ? 'error' : ''}`}
              placeholder="Describe detalladamente la actividad..."
              rows="4"
            />
            {validationErrors.descripcion_actividad && (
              <span className="field-error">{validationErrors.descripcion_actividad}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tipo_actividad" className="form-label">Tipo de Actividad *</label>
              <select
                id="tipo_actividad"
                name="tipo_actividad"
                value={formData.tipo_actividad}
                onChange={handleInputChange}
                className={`form-select ${validationErrors.tipo_actividad ? 'error' : ''}`}
              >
                <option value="taller">🔧 Taller</option>
                <option value="competencia">🏆 Competencia</option>
              </select>
              {validationErrors.tipo_actividad && (
                <span className="field-error">{validationErrors.tipo_actividad}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="id_categoria" className="form-label">Categoría</label>
              <select
                id="id_categoria"
                name="id_categoria"
                value={formData.id_categoria}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(category => (
                  <option key={category.id_categoria} value={category.id_categoria}>
                    {category.nombre_categoria}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>📅 Fechas y Horarios</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fecha_inicio_actividad" className="form-label">Fecha y Hora de Inicio *</label>
              <input
                type="datetime-local"
                id="fecha_inicio_actividad"
                name="fecha_inicio_actividad"
                value={formData.fecha_inicio_actividad}
                onChange={handleInputChange}
                className={`form-input ${validationErrors.fecha_inicio_actividad ? 'error' : ''}`}
              />
              {validationErrors.fecha_inicio_actividad && (
                <span className="field-error">{validationErrors.fecha_inicio_actividad}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="fecha_fin_actividad" className="form-label">Fecha y Hora de Fin *</label>
              <input
                type="datetime-local"
                id="fecha_fin_actividad"
                name="fecha_fin_actividad"
                value={formData.fecha_fin_actividad}
                onChange={handleInputChange}
                className={`form-input ${validationErrors.fecha_fin_actividad ? 'error' : ''}`}
              />
              {validationErrors.fecha_fin_actividad && (
                <span className="field-error">{validationErrors.fecha_fin_actividad}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fecha_limite_inscripcion" className="form-label">Fecha Límite de Inscripción</label>
              <input
                type="datetime-local"
                id="fecha_limite_inscripcion"
                name="fecha_limite_inscripcion"
                value={formData.fecha_limite_inscripcion}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="duracion_estimada_minutos" className="form-label">Duración Estimada (minutos)</label>
              <input
                type="number"
                id="duracion_estimada_minutos"
                name="duracion_estimada_minutos"
                value={formData.duracion_estimada_minutos}
                onChange={handleInputChange}
                className="form-input"
                min="1"
                placeholder="120"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>📍 Ubicación y Capacidad</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="lugar_actividad" className="form-label">Lugar *</label>
              <input
                type="text"
                id="lugar_actividad"
                name="lugar_actividad"
                value={formData.lugar_actividad}
                onChange={handleInputChange}
                className={`form-input ${validationErrors.lugar_actividad ? 'error' : ''}`}
                placeholder="Ej: Aula 101, Auditorio Principal"
              />
              {validationErrors.lugar_actividad && (
                <span className="field-error">{validationErrors.lugar_actividad}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="cupo_maximo_actividad" className="form-label">Cupo Máximo *</label>
              <input
                type="number"
                id="cupo_maximo_actividad"
                name="cupo_maximo_actividad"
                value={formData.cupo_maximo_actividad}
                onChange={handleInputChange}
                className={`form-input ${validationErrors.cupo_maximo_actividad ? 'error' : ''}`}
                min="1"
                placeholder="30"
              />
              {validationErrors.cupo_maximo_actividad && (
                <span className="field-error">{validationErrors.cupo_maximo_actividad}</span>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>👨‍🏫 Ponente y Requisitos</h3>
          
          <div className="form-group">
            <label htmlFor="ponente_actividad" className="form-label">Ponente *</label>
            <input
              type="text"
              id="ponente_actividad"
              name="ponente_actividad"
              value={formData.ponente_actividad}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.ponente_actividad ? 'error' : ''}`}
              placeholder="Ej: Dr. Juan Pérez"
            />
            {validationErrors.ponente_actividad && (
              <span className="field-error">{validationErrors.ponente_actividad}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="requisitos_actividad" className="form-label">Requisitos</label>
            <textarea
              id="requisitos_actividad"
              name="requisitos_actividad"
              value={formData.requisitos_actividad}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Describe los requisitos previos..."
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nivel_requerido" className="form-label">Nivel Requerido</label>
              <select
                id="nivel_requerido"
                name="nivel_requerido"
                value={formData.nivel_requerido}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="basico">Básico</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="materiales_requeridos" className="form-label">Materiales Requeridos</label>
              <textarea
                id="materiales_requeridos"
                name="materiales_requeridos"
                value={formData.materiales_requeridos}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Lista los materiales necesarios..."
                rows="2"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>👥 Demografía y Costos</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edad_minima" className="form-label">Edad Mínima</label>
              <input
                type="number"
                id="edad_minima"
                name="edad_minima"
                value={formData.edad_minima}
                onChange={handleInputChange}
                className="form-input"
                min="1"
                max="100"
                placeholder="18"
              />
            </div>

            <div className="form-group">
              <label htmlFor="edad_maxima" className="form-label">Edad Máxima</label>
              <input
                type="number"
                id="edad_maxima"
                name="edad_maxima"
                value={formData.edad_maxima}
                onChange={handleInputChange}
                className={`form-input ${validationErrors.edad_maxima ? 'error' : ''}`}
                min="1"
                max="100"
                placeholder="65"
              />
              {validationErrors.edad_maxima && (
                <span className="field-error">{validationErrors.edad_maxima}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="costo_actividad" className="form-label">Costo de la Actividad</label>
              <input
                type="number"
                id="costo_actividad"
                name="costo_actividad"
                value={formData.costo_actividad}
                onChange={handleInputChange}
                className="form-input"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="moneda_costo" className="form-label">Moneda</label>
              <select
                id="moneda_costo"
                name="moneda_costo"
                value={formData.moneda_costo}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="GTQ">GTQ - Quetzal</option>
                <option value="USD">USD - Dólar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>⚙️ Configuración</h3>
          
          <div className="form-row">
            <div className="form-group">
              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="permite_inscripciones"
                  name="permite_inscripciones"
                  checked={formData.permite_inscripciones}
                  onChange={handleInputChange}
                />
                <label htmlFor="permite_inscripciones">Permite Inscripciones</label>
              </div>
            </div>

            <div className="form-group">
              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="requiere_aprobacion"
                  name="requiere_aprobacion"
                  checked={formData.requiere_aprobacion}
                  onChange={handleInputChange}
                />
                <label htmlFor="requiere_aprobacion">Requiere Aprobación</label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="estado_actividad"
                name="estado_actividad"
                checked={formData.estado_actividad}
                onChange={handleInputChange}
              />
              <label htmlFor="estado_actividad">Actividad Activa</label>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={backToSelection}
            className="back-button"
            disabled={loading}
          >
            ← Volver a Selección
          </button>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="button-spinner"></div>
                Actualizando...
              </>
            ) : (
              '💾 Actualizar Actividad'
            )}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <AdminGuard>
      {step === 'select' ? renderSelectionStep() : renderEditStep()}
    </AdminGuard>
  );
};

export default EditActivityPage;
