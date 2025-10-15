// =====================================================
// Página de Listar Actividades
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminGuard from '../components/AdminGuard/AdminGuard';
import './ListActivitiesPage.css';

const API_BASE_URL = 'https://proyecto-final-seminario-desa-dmgi.vercel.app';

const ListActivitiesPage = () => {
  const { getAuthToken, user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    tipo_actividad: '',
    id_categoria: '',
    solo_disponibles: true,
    solo_activas: true,
    limite: 20,
    offset: 0
  });
  const [totalActividades, setTotalActividades] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Cargar categorías al montar el componente
  useEffect(() => {
    cargarCategorias();
  }, []);

  // Cargar actividades cuando cambien los filtros
  useEffect(() => {
    cargarActividades();
  }, [filtros]);

  const cargarCategorias = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/activities/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      } else {
        console.error('Error al cargar categorías:', data.message);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const cargarActividades = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      const params = new URLSearchParams();
      if (filtros.tipo_actividad) params.append('tipo_actividad', filtros.tipo_actividad);
      if (filtros.id_categoria) params.append('id_categoria', filtros.id_categoria);
      if (filtros.solo_disponibles !== null) params.append('solo_disponibles', filtros.solo_disponibles);
      if (filtros.solo_activas !== null) params.append('solo_activas', filtros.solo_activas);
      params.append('limite', filtros.limite);
      params.append('offset', filtros.offset);

      const response = await fetch(`${API_BASE_URL}/api/activities?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (data.success) {
        setActivities(data.data);
        setTotalActividades(data.total || data.data.length);
      } else {
        setError(data.message || 'Error al cargar actividades');
        setActivities([]);
      }
    } catch (error) {
      console.error('Error al cargar actividades:', error);
      setError('Error de conexión al cargar actividades');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor,
      offset: 0 // Resetear paginación al cambiar filtros
    }));
    setPaginaActual(1);
  };

  const limpiarFiltros = () => {
    setFiltros({
      tipo_actividad: '',
      id_categoria: '',
      solo_disponibles: true,
      solo_activas: true,
      limite: 20,
      offset: 0
    });
    setPaginaActual(1);
  };

  const cambiarPagina = (nuevaPagina) => {
    const nuevoOffset = (nuevaPagina - 1) * filtros.limite;
    setFiltros(prev => ({ ...prev, offset: nuevoOffset }));
    setPaginaActual(nuevaPagina);
  };

  const verDetalleActividad = (actividad) => {
    setSelectedActivity(actividad);
    setShowDetailsModal(true);
  };

  const cerrarModal = () => {
    setShowDetailsModal(false);
    setSelectedActivity(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount, currency) => {
    if (!amount || amount === '0.00') return 'Gratis';
    return `${amount} ${currency}`;
  };

  const getTipoBadge = (tipo) => {
    return tipo === 'taller' ? '📚 Taller' : '🏆 Competencia';
  };

  const getEstadoBadge = (actividad) => {
    if (!actividad.estado_actividad) return '❌ Inactiva';
    if (!actividad.permite_inscripciones) return '🔒 Sin inscripciones';
    if (actividad.cupo_disponible_actividad === 0) return '🈵 Sin cupo';
    return '✅ Disponible';
  };

  const totalPaginas = Math.ceil(totalActividades / filtros.limite);

  return (
    <AdminGuard>
      <div className="list-activities-page">
        <div className="list-container">
          <header className="management-header">
            <Link to="/gestion-actividades" className="back-button">
              <span>←</span> Volver a Gestión de Actividades
            </Link>
            <h1>📋 Lista de Actividades</h1>
            <p>Explora y gestiona todas las actividades del congreso</p>
            <div className="management-info">
              <span className="management-badge">📋 Lista de Actividades</span>
              <span className="management-email">{user?.email_usuario}</span>
            </div>
          </header>
        </div>

        {/* Filtros */}
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Tipo de Actividad:</label>
              <select
                value={filtros.tipo_actividad}
                onChange={(e) => handleFilterChange('tipo_actividad', e.target.value)}
              >
                <option value="">Todos los tipos</option>
                <option value="taller">📚 Talleres</option>
                <option value="competencia">🏆 Competencias</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Categoría:</label>
              <select
                value={filtros.id_categoria}
                onChange={(e) => handleFilterChange('id_categoria', e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categories.map(categoria => (
                  <option key={categoria.id_categoria} value={categoria.id_categoria}>
                    {categoria.nombre_categoria}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Estado:</label>
              <select
                value={filtros.solo_activas ? 'activas' : 'todas'}
                onChange={(e) => handleFilterChange('solo_activas', e.target.value === 'activas')}
              >
                <option value="activas">✅ Solo activas</option>
                <option value="todas">📋 Todas</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Disponibilidad:</label>
              <select
                value={filtros.solo_disponibles ? 'disponibles' : 'todas'}
                onChange={(e) => handleFilterChange('solo_disponibles', e.target.value === 'disponibles')}
              >
                <option value="disponibles">🎯 Solo disponibles</option>
                <option value="todas">📋 Todas</option>
              </select>
            </div>
          </div>

          <div className="filters-actions">
            <button className="btn-secondary" onClick={limpiarFiltros}>
              🗑️ Limpiar Filtros
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="results-section">
          <div className="results-header">
            <h2>
              {loading ? 'Cargando...' : 
               error ? 'Error al cargar actividades' :
               `${totalActividades} actividades encontradas`}
            </h2>
          </div>

          {error && (
            <div className="error-message">
              <p>❌ {error}</p>
              <button className="btn-primary" onClick={cargarActividades}>
                🔄 Reintentar
              </button>
            </div>
          )}

          {!loading && !error && activities.length === 0 && (
            <div className="no-results">
              <div className="no-results-icon">📋</div>
              <h3>No se encontraron actividades</h3>
              <p>No hay actividades que coincidan con los filtros seleccionados.</p>
              <button className="btn-primary" onClick={limpiarFiltros}>
                🗑️ Limpiar Filtros
              </button>
            </div>
          )}

          {!loading && !error && activities.length > 0 && (
            <>
              <div className="activities-grid">
                {activities.map(actividad => (
                  <div key={actividad.id_actividad} className="activity-card">
                    <div className="activity-header">
                      <div className="activity-type">
                        {getTipoBadge(actividad.tipo_actividad)}
                      </div>
                      <div className="activity-status">
                        {getEstadoBadge(actividad)}
                      </div>
                    </div>

                    <div className="activity-content">
                      <h3 className="activity-title">{actividad.nombre_actividad}</h3>
                      <p className="activity-description">{actividad.descripcion_actividad}</p>
                      
                      <div className="activity-details">
                        <div className="detail-item">
                          <span className="detail-label">📅 Fecha:</span>
                          <span className="detail-value">{formatDate(actividad.fecha_inicio_actividad)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">⏱️ Duración:</span>
                          <span className="detail-value">{actividad.duracion_estimada_minutos} min</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">📍 Lugar:</span>
                          <span className="detail-value">{actividad.lugar_actividad || 'Por definir'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">👨‍🏫 Ponente:</span>
                          <span className="detail-value">{actividad.ponente_actividad || 'Por definir'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">👥 Cupos:</span>
                          <span className="detail-value">
                            {actividad.cupo_disponible_actividad}/{actividad.cupo_maximo_actividad}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">💰 Costo:</span>
                          <span className="detail-value">
                            {formatCurrency(actividad.costo_actividad, actividad.moneda_costo)}
                          </span>
                        </div>
                      </div>

                      <div className="activity-category">
                        <span className="category-badge">
                          📂 {actividad.categoria_nombre}
                        </span>
                      </div>
                    </div>

                    <div className="activity-actions">
                      <button 
                        className="btn-primary"
                        onClick={() => verDetalleActividad(actividad)}
                      >
                        👁️ Ver Detalle
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {totalPaginas > 1 && (
                <div className="pagination">
                  <button 
                    className="btn-secondary"
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                  >
                    ← Anterior
                  </button>
                  
                  <span className="pagination-info">
                    Página {paginaActual} de {totalPaginas}
                  </span>
                  
                  <button 
                    className="btn-secondary"
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal de Detalles */}
        {showDetailsModal && selectedActivity && (
          <div className="modal-overlay" onClick={cerrarModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Detalle de Actividad</h2>
                <button className="close-button" onClick={cerrarModal}>✕</button>
              </div>
              <div className="modal-body">
                <div className="activity-detail">
                  <div className="detail-section">
                    <h3>{selectedActivity.nombre_actividad}</h3>
                    <div className="detail-badges">
                      <span className="badge badge-type">
                        {getTipoBadge(selectedActivity.tipo_actividad)}
                      </span>
                      <span className="badge badge-status">
                        {getEstadoBadge(selectedActivity)}
                      </span>
                      <span className="badge badge-category">
                        📂 {selectedActivity.categoria_nombre}
                      </span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>📝 Descripción</h4>
                    <p>{selectedActivity.descripcion_actividad}</p>
                  </div>

                  <div className="detail-grid">
                    <div className="detail-item">
                      <strong>📅 Fecha de Inicio:</strong>
                      <span>{formatDate(selectedActivity.fecha_inicio_actividad)}</span>
                    </div>
                    <div className="detail-item">
                      <strong>📅 Fecha de Fin:</strong>
                      <span>{formatDate(selectedActivity.fecha_fin_actividad)}</span>
                    </div>
                    <div className="detail-item">
                      <strong>⏱️ Duración:</strong>
                      <span>{selectedActivity.duracion_estimada_minutos} minutos</span>
                    </div>
                    <div className="detail-item">
                      <strong>📍 Lugar:</strong>
                      <span>{selectedActivity.lugar_actividad || 'Por definir'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>👨‍🏫 Ponente:</strong>
                      <span>{selectedActivity.ponente_actividad || 'Por definir'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>👥 Cupos:</strong>
                      <span>
                        {selectedActivity.cupo_disponible_actividad} disponibles de {selectedActivity.cupo_maximo_actividad} totales
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>💰 Costo:</strong>
                      <span>{formatCurrency(selectedActivity.costo_actividad, selectedActivity.moneda_costo)}</span>
                    </div>
                    <div className="detail-item">
                      <strong>📋 Nivel Requerido:</strong>
                      <span>{selectedActivity.nivel_requerido || 'No especificado'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>🎂 Edad:</strong>
                      <span>
                        {selectedActivity.edad_minima}-{selectedActivity.edad_maxima} años
                      </span>
                    </div>
                  </div>

                  {selectedActivity.requisitos_actividad && (
                    <div className="detail-section">
                      <h4>📋 Requisitos</h4>
                      <p>{selectedActivity.requisitos_actividad}</p>
                    </div>
                  )}

                  {selectedActivity.materiales_requeridos && (
                    <div className="detail-section">
                      <h4>🔧 Materiales Requeridos</h4>
                      <p>{selectedActivity.materiales_requeridos}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-primary" onClick={cerrarModal}>
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

export default ListActivitiesPage;
