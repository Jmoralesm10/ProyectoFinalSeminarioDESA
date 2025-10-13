import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateActivityPage.css';

const CreateActivityPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados del formulario
  const [formData, setFormData] = useState({
    id_categoria: '',
    nombre_actividad: '',
    tipo_actividad: 'taller',
    fecha_inicio_actividad: '',
    fecha_fin_actividad: '',
    cupo_maximo_actividad: '',
    descripcion_actividad: '',
    fecha_limite_inscripcion: '',
    duracion_estimada_minutos: '',
    lugar_actividad: '',
    ponente_actividad: '',
    requisitos_actividad: '',
    nivel_requerido: '',
    edad_minima: '',
    edad_maxima: '',
    materiales_requeridos: '',
    costo_actividad: '',
    moneda_costo: 'GTQ',
    permite_inscripciones: true,
    requiere_aprobacion: false
  });

  // Cargar categorías al montar el componente
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        setError('No se pudo obtener el token de autenticación');
        return;
      }

      const response = await fetch('http://localhost:3001/api/activities/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data);
      } else {
        setError('Error al cargar las categorías: ' + result.message);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setError('Error al cargar las categorías');
    }
  };

  const getAuthToken = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email_usuario: 'jmoralesm45@miumg.edu.gt',
          password: 'Javier123.'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        return result.data.token;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener token:', error);
      return null;
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.id_categoria) {
      setError('Debe seleccionar una categoría');
      return false;
    }
    if (!formData.nombre_actividad.trim()) {
      setError('El nombre de la actividad es obligatorio');
      return false;
    }
    if (!formData.fecha_inicio_actividad) {
      setError('La fecha de inicio es obligatoria');
      return false;
    }
    if (!formData.fecha_fin_actividad) {
      setError('La fecha de fin es obligatoria');
      return false;
    }
    if (new Date(formData.fecha_fin_actividad) <= new Date(formData.fecha_inicio_actividad)) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio');
      return false;
    }
    if (!formData.cupo_maximo_actividad || formData.cupo_maximo_actividad <= 0) {
      setError('El cupo máximo debe ser mayor a 0');
      return false;
    }
    if (formData.nivel_requerido && !['basico', 'intermedio', 'avanzado'].includes(formData.nivel_requerido)) {
      setError('El nivel requerido debe ser básico, intermedio o avanzado');
      return false;
    }
    if (formData.edad_maxima && formData.edad_maxima < formData.edad_minima) {
      setError('La edad máxima debe ser mayor o igual a la edad mínima');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = await getAuthToken();
      if (!token) {
        setError('No se pudo obtener el token de autenticación');
        setLoading(false);
        return;
      }

      // Preparar datos para envío
      const activityData = {
        id_categoria: parseInt(formData.id_categoria),
        nombre_actividad: formData.nombre_actividad.trim(),
        tipo_actividad: formData.tipo_actividad,
        fecha_inicio_actividad: new Date(formData.fecha_inicio_actividad).toISOString(),
        fecha_fin_actividad: new Date(formData.fecha_fin_actividad).toISOString(),
        cupo_maximo_actividad: parseInt(formData.cupo_maximo_actividad),
        descripcion_actividad: formData.descripcion_actividad || undefined,
        fecha_limite_inscripcion: formData.fecha_limite_inscripcion ? new Date(formData.fecha_limite_inscripcion).toISOString() : undefined,
        duracion_estimada_minutos: formData.duracion_estimada_minutos ? parseInt(formData.duracion_estimada_minutos) : undefined,
        lugar_actividad: formData.lugar_actividad || undefined,
        ponente_actividad: formData.ponente_actividad || undefined,
        requisitos_actividad: formData.requisitos_actividad || undefined,
        nivel_requerido: formData.nivel_requerido || undefined,
        edad_minima: formData.edad_minima ? parseInt(formData.edad_minima) : undefined,
        edad_maxima: formData.edad_maxima ? parseInt(formData.edad_maxima) : undefined,
        materiales_requeridos: formData.materiales_requeridos || undefined,
        costo_actividad: formData.costo_actividad ? parseFloat(formData.costo_actividad) : undefined,
        moneda_costo: formData.moneda_costo,
        permite_inscripciones: formData.permite_inscripciones,
        requiere_aprobacion: formData.requiere_aprobacion
      };

      const response = await fetch('http://localhost:3001/api/activities', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activityData)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`¡Actividad "${result.data.nombre_actividad}" creada exitosamente! ID: ${result.data.id_actividad}`);
        // Limpiar formulario
        setFormData({
          id_categoria: '',
          nombre_actividad: '',
          tipo_actividad: 'taller',
          fecha_inicio_actividad: '',
          fecha_fin_actividad: '',
          cupo_maximo_actividad: '',
          descripcion_actividad: '',
          fecha_limite_inscripcion: '',
          duracion_estimada_minutos: '',
          lugar_actividad: '',
          ponente_actividad: '',
          requisitos_actividad: '',
          nivel_requerido: '',
          edad_minima: '',
          edad_maxima: '',
          materiales_requeridos: '',
          costo_actividad: '',
          moneda_costo: 'GTQ',
          permite_inscripciones: true,
          requiere_aprobacion: false
        });
      } else {
        setError('Error al crear la actividad: ' + result.message);
      }
    } catch (error) {
      console.error('Error al crear actividad:', error);
      setError('Error al crear la actividad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-activity-page">
      <div className="create-activity-container">
        <div className="create-activity-header">
          <h1>🎯 Crear Nueva Actividad</h1>
          <p>Complete el formulario para crear una nueva actividad del congreso</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">❌</span>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-activity-form">
          {/* Información Básica */}
          <div className="form-section">
            <h3>📋 Información Básica</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="id_categoria">Categoría *</label>
                <select
                  id="id_categoria"
                  name="id_categoria"
                  value={formData.id_categoria}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccione una categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nombre_categoria}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tipo_actividad">Tipo de Actividad *</label>
                <select
                  id="tipo_actividad"
                  name="tipo_actividad"
                  value={formData.tipo_actividad}
                  onChange={handleInputChange}
                  required
                >
                  <option value="taller">Taller</option>
                  <option value="competencia">Competencia</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="nombre_actividad">Nombre de la Actividad *</label>
              <input
                type="text"
                id="nombre_actividad"
                name="nombre_actividad"
                value={formData.nombre_actividad}
                onChange={handleInputChange}
                placeholder="Ej: Taller de Python Avanzado"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="descripcion_actividad">Descripción</label>
              <textarea
                id="descripcion_actividad"
                name="descripcion_actividad"
                value={formData.descripcion_actividad}
                onChange={handleInputChange}
                placeholder="Descripción detallada de la actividad"
                rows="3"
              />
            </div>
          </div>

          {/* Fechas y Horarios */}
          <div className="form-section">
            <h3>📅 Fechas y Horarios</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fecha_inicio_actividad">Fecha y Hora de Inicio *</label>
                <input
                  type="datetime-local"
                  id="fecha_inicio_actividad"
                  name="fecha_inicio_actividad"
                  value={formData.fecha_inicio_actividad}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="fecha_fin_actividad">Fecha y Hora de Fin *</label>
                <input
                  type="datetime-local"
                  id="fecha_fin_actividad"
                  name="fecha_fin_actividad"
                  value={formData.fecha_fin_actividad}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fecha_limite_inscripcion">Límite de Inscripción</label>
                <input
                  type="datetime-local"
                  id="fecha_limite_inscripcion"
                  name="fecha_limite_inscripcion"
                  value={formData.fecha_limite_inscripcion}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="duracion_estimada_minutos">Duración Estimada (minutos)</label>
                <input
                  type="number"
                  id="duracion_estimada_minutos"
                  name="duracion_estimada_minutos"
                  value={formData.duracion_estimada_minutos}
                  onChange={handleInputChange}
                  placeholder="180"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Cupos y Ubicación */}
          <div className="form-section">
            <h3>👥 Cupos y Ubicación</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cupo_maximo_actividad">Cupo Máximo *</label>
                <input
                  type="number"
                  id="cupo_maximo_actividad"
                  name="cupo_maximo_actividad"
                  value={formData.cupo_maximo_actividad}
                  onChange={handleInputChange}
                  placeholder="25"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lugar_actividad">Lugar</label>
                <input
                  type="text"
                  id="lugar_actividad"
                  name="lugar_actividad"
                  value={formData.lugar_actividad}
                  onChange={handleInputChange}
                  placeholder="Ej: Aula 101, Auditorio Principal"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="ponente_actividad">Ponente/Instructor</label>
              <input
                type="text"
                id="ponente_actividad"
                name="ponente_actividad"
                value={formData.ponente_actividad}
                onChange={handleInputChange}
                placeholder="Ej: Dr. Ana Martínez"
              />
            </div>
          </div>

          {/* Requisitos y Restricciones */}
          <div className="form-section">
            <h3>📝 Requisitos y Restricciones</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nivel_requerido">Nivel Requerido</label>
                <select
                  id="nivel_requerido"
                  name="nivel_requerido"
                  value={formData.nivel_requerido}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccione nivel</option>
                  <option value="basico">Básico</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edad_minima">Edad Mínima</label>
                <input
                  type="number"
                  id="edad_minima"
                  name="edad_minima"
                  value={formData.edad_minima}
                  onChange={handleInputChange}
                  placeholder="16"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edad_maxima">Edad Máxima</label>
                <input
                  type="number"
                  id="edad_maxima"
                  name="edad_maxima"
                  value={formData.edad_maxima}
                  onChange={handleInputChange}
                  placeholder="25"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="requisitos_actividad">Requisitos</label>
              <textarea
                id="requisitos_actividad"
                name="requisitos_actividad"
                value={formData.requisitos_actividad}
                onChange={handleInputChange}
                placeholder="Ej: Conocimientos básicos de Python"
                rows="2"
              />
            </div>

            <div className="form-group">
              <label htmlFor="materiales_requeridos">Materiales Requeridos</label>
              <textarea
                id="materiales_requeridos"
                name="materiales_requeridos"
                value={formData.materiales_requeridos}
                onChange={handleInputChange}
                placeholder="Ej: Laptop con Python instalado"
                rows="2"
              />
            </div>
          </div>

          {/* Costo y Configuración */}
          <div className="form-section">
            <h3>💰 Costo y Configuración</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="costo_actividad">Costo</label>
                <input
                  type="number"
                  id="costo_actividad"
                  name="costo_actividad"
                  value={formData.costo_actividad}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="moneda_costo">Moneda</label>
                <select
                  id="moneda_costo"
                  name="moneda_costo"
                  value={formData.moneda_costo}
                  onChange={handleInputChange}
                >
                  <option value="GTQ">GTQ (Quetzales)</option>
                  <option value="USD">USD (Dólares)</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="permite_inscripciones"
                    checked={formData.permite_inscripciones}
                    onChange={handleInputChange}
                  />
                  <span className="checkbox-text">Permitir inscripciones</span>
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="requiere_aprobacion"
                    checked={formData.requiere_aprobacion}
                    onChange={handleInputChange}
                  />
                  <span className="checkbox-text">Requiere aprobación</span>
                </label>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/gestion-actividades')}
              className="btn btn-secondary"
            >
              ← Volver a Gestión
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? '⏳ Creando...' : '✅ Crear Actividad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateActivityPage;
