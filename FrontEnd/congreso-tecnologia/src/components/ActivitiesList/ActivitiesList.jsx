// =====================================================
// Componente de Lista de Actividades
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import React, { useState, useEffect } from 'react';
import ActivityCard from '../ActivityCard/ActivityCard';
import { API_URLS } from '../../config/api';
import './ActivitiesList.css';

const ActivitiesList = ({ isAuthenticated, userInscriptions = [], user }) => {
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    tipo_actividad: '',
    id_categoria: '',
    solo_disponibles: true,
    solo_activas: true
  });

  // Cargar actividades y categorías
  useEffect(() => {
    loadActivities();
    loadCategories();
  }, [filters]);

  // Cargar actividades desde la API
  const loadActivities = async () => {
    try {
      setLoading(true);
      setError('');

      // Construir query parameters
      const queryParams = new URLSearchParams();
      if (filters.tipo_actividad) queryParams.append('tipo_actividad', filters.tipo_actividad);
      if (filters.id_categoria) queryParams.append('id_categoria', filters.id_categoria);
      if (filters.solo_disponibles) queryParams.append('solo_disponibles', 'true');
      if (filters.solo_activas) queryParams.append('solo_activas', 'true');
      queryParams.append('limite', '50');

      const url = `${API_URLS.ACTIVITIES}?${queryParams.toString()}`;
      console.log('🔍 Cargando actividades desde:', url);

      const response = await fetch(url);
      const result = await response.json();

      if (response.ok && result.success) {
        setActivities(result.data || []);
        setError(''); // Limpiar error si hay éxito
        console.log('✅ Actividades cargadas:', result.data?.length || 0);
      } else {
        // Si no hay actividades, no es un error, es un resultado válido
        setActivities([]);
        setError('');
        console.log('ℹ️ No se encontraron actividades con los filtros seleccionados');
      }
    } catch (error) {
      setError('Error de conexión al cargar actividades');
      console.error('❌ Error de conexión:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías desde la API
  const loadCategories = async () => {
    try {
      const response = await fetch(API_URLS.ACTIVITY_CATEGORIES);
      const result = await response.json();

      if (response.ok && result.success) {
        setCategories(result.data || []);
        console.log('✅ Categorías cargadas:', result.data?.length || 0);
      }
    } catch (error) {
      console.error('❌ Error cargando categorías:', error);
    }
  };

  // Manejar inscripción a actividad
  const handleEnroll = async (id_actividad) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      console.log('🔍 Frontend: Enviando inscripción');
      console.log('🔍 Frontend: id_actividad:', id_actividad, 'tipo:', typeof id_actividad);
      console.log('🔍 Frontend: token:', token ? 'presente' : 'ausente');
      
      const response = await fetch(`${API_URLS.ACTIVITIES}/${id_actividad}/inscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_actividad: parseInt(id_actividad) // Asegurar que sea número
        })
      });
      
      console.log('🔍 Frontend: Status de respuesta:', response.status);

      const result = await response.json();

      if (response.ok && result.success) {
        // Recargar actividades para actualizar cupos
        await loadActivities();
        
        // Mostrar mensaje de éxito
        alert('¡Inscripción exitosa! Te has inscrito a la actividad.');
      } else {
        throw new Error(result.message || 'Error al inscribirse');
      }
    } catch (error) {
      console.error('❌ Error al inscribirse:', error);
      alert(`Error al inscribirse: ${error.message}`);
    }
  };

  // Manejar cambio de filtros
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      tipo_actividad: '',
      id_categoria: '',
      solo_disponibles: true,
      solo_activas: true
    });
  };

  if (loading) {
    return (
      <div className="activities-list-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando actividades...</p>
        </div>
      </div>
    );
  }

  // Solo mostrar pantalla de error para errores de conexión reales
  if (error && error.includes('conexión')) {
    return (
      <div className="activities-list-container">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h3>Error al cargar actividades</h3>
          <p>{error}</p>
          <button onClick={loadActivities} className="retry-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="activities-list-container">
      {/* Filtros */}
      <div className="filters-section">
        <h2>Filtrar Actividades</h2>
        <div className="filters-grid">
          {/* Filtro por tipo */}
          <div className="filter-group">
            <label htmlFor="tipo-filter">Tipo de Actividad:</label>
            <select
              id="tipo-filter"
              value={filters.tipo_actividad}
              onChange={(e) => handleFilterChange('tipo_actividad', e.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value="taller">Talleres</option>
              <option value="competencia">Competencias</option>
            </select>
          </div>

          {/* Filtro por categoría */}
          <div className="filter-group">
            <label htmlFor="categoria-filter">Categoría:</label>
            <select
              id="categoria-filter"
              value={filters.id_categoria}
              onChange={(e) => handleFilterChange('id_categoria', e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category.id_categoria} value={category.id_categoria}>
                  {category.nombre_categoria}
                </option>
              ))}
            </select>
          </div>

          {/* Filtros de estado */}
          <div className="filter-group">
            <label>
              <input
                type="checkbox"
                checked={filters.solo_disponibles}
                onChange={(e) => handleFilterChange('solo_disponibles', e.target.checked)}
              />
              Solo disponibles
            </label>
          </div>

          <div className="filter-group">
            <label>
              <input
                type="checkbox"
                checked={filters.solo_activas}
                onChange={(e) => handleFilterChange('solo_activas', e.target.checked)}
              />
              Solo activas
            </label>
          </div>

          {/* Botón limpiar filtros */}
          <div className="filter-group">
            <button onClick={clearFilters} className="clear-filters-button">
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Lista de actividades */}
      <div className="activities-section">
        <div className="activities-header">
          <h2>Actividades Disponibles</h2>
          <p className="activities-count">
            {activities.length} actividad{activities.length !== 1 ? 'es' : ''} encontrada{activities.length !== 1 ? 's' : ''}
          </p>
        </div>

        {activities.length === 0 ? (
          <div className="no-activities">
            <div className="no-activities-icon">🔍</div>
            <h3>No se encontraron actividades</h3>
            <p>No hay actividades que coincidan con los filtros seleccionados.</p>
            <div className="no-activities-actions">
              <button onClick={clearFilters} className="clear-filters-button">
                Ver todas las actividades
              </button>
              <p className="filter-hint">
                💡 Prueba ajustando los filtros arriba para encontrar más actividades
              </p>
            </div>
          </div>
        ) : (
          <div className="activities-grid">
            {activities.map(activity => (
              <ActivityCard
                key={activity.id_actividad}
                activity={activity}
                isAuthenticated={isAuthenticated}
                onEnroll={handleEnroll}
                userInscriptions={userInscriptions}
                user={user}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitiesList;
