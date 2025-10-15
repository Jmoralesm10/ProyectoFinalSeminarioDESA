// =====================================================
// Página para Listar Usuarios
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminGuard from '../components/AdminGuard/AdminGuard';
import './ListUsersPage.css';

const ListUsersPage = () => {
  const { user, hasPermission } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    page: 1,
    limit: 20,
    search: '',
    tipo_usuario: '',
    estado: ''
  });
  const [paginacion, setPaginacion] = useState({
    total: 0,
    pagina_actual: 1,
    total_paginas: 1
  });
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [mostrarModalUsuario, setMostrarModalUsuario] = useState(false);

  // Cargar usuarios
  const cargarUsuarios = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      
      // Si hay término de búsqueda, usar endpoint de búsqueda
      if (filtros.search && filtros.search.trim()) {
        await cargarUsuariosConBusqueda(token);
      } else {
        await cargarUsuariosNormales(token);
      }
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios con búsqueda
  const cargarUsuariosConBusqueda = async (token) => {
    const params = new URLSearchParams();
    params.append('termino_busqueda', filtros.search);
    params.append('limite', filtros.limit);
    
    if (filtros.tipo_usuario) {
      params.append('tipo_usuario', filtros.tipo_usuario);
    }
    if (filtros.estado) {
      params.append('estado_usuario', filtros.estado);
    }

    console.log('🔍 Parámetros de búsqueda:', params.toString());

    const response = await fetch(`http://localhost:3001/api/admin/users/search?${params.toString()}`, {
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
    
    console.log('📊 Respuesta de búsqueda:', data);
    
    if (data.success) {
      const usuarios = data.data.usuarios || [];
      setUsuarios(usuarios);
      setPaginacion({
        total: data.data.total || usuarios.length,
        pagina_actual: 1,
        total_paginas: 1
      });
      
      // Mostrar mensaje si no hay resultados
      if (usuarios.length === 0) {
        setError(`No se encontraron usuarios que coincidan con "${filtros.search}"`);
      } else {
        setError(null);
      }
    } else {
      throw new Error(data.message || 'Error al buscar usuarios');
    }
  };

  // Cargar usuarios normales (sin búsqueda)
  const cargarUsuariosNormales = async (token) => {
    const params = new URLSearchParams();
    
    Object.keys(filtros).forEach(key => {
      if (filtros[key]) {
        params.append(key, filtros[key]);
      }
    });

    const response = await fetch(`http://localhost:3001/api/admin/users?${params.toString()}`, {
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
    
    if (data.success) {
      setUsuarios(data.data.usuarios);
      setPaginacion({
        total: parseInt(data.data.total),
        pagina_actual: data.data.pagina_actual,
        total_paginas: data.data.total_paginas
      });
    } else {
      throw new Error(data.message || 'Error al cargar usuarios');
    }
  };

  // Efecto para cargar usuarios al montar el componente
  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Efecto para recargar cuando cambian los filtros
  useEffect(() => {
    cargarUsuarios();
  }, [filtros]);

  // Manejar cambios en filtros
  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor,
      page: 1 // Resetear a página 1 cuando cambian los filtros
    }));
  };

  // Manejar paginación
  const handlePageChange = (nuevaPagina) => {
    setFiltros(prev => ({
      ...prev,
      page: nuevaPagina
    }));
  };

  // Ver usuario específico
  const verUsuarioEspecifico = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setMostrarModalUsuario(true);
  };

  // Cerrar modal de usuario
  const cerrarModalUsuario = () => {
    setMostrarModalUsuario(false);
    setUsuarioSeleccionado(null);
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener badge de estado
  const getEstadoBadge = (estado) => {
    return estado ? 
      <span className="badge badge-success">✅ Activo</span> : 
      <span className="badge badge-danger">❌ Inactivo</span>;
  };

  // Obtener badge de tipo de usuario
  const getTipoBadge = (tipo) => {
    const colores = {
      'externo': 'badge-primary',
      'interno': 'badge-info',
      'administrador': 'badge-warning'
    };
    return <span className={`badge ${colores[tipo] || 'badge-secondary'}`}>{tipo}</span>;
  };


  return (
    <AdminGuard>
      <div className="list-users-page">
        <div className="list-container">
          {/* Header */}
          <header className="management-header">
            <Link to="/gestion-usuarios" className="back-button">
              <span>←</span>
              Volver a Gestión de Usuarios
            </Link>
            <h1>👥 Listar Usuarios</h1>
            <p>Gestiona y visualiza todos los usuarios del sistema</p>
            <div className="management-info">
              <span className="management-badge">👑 Super Administrador</span>
              <span className="management-email">{user?.email_usuario}</span>
            </div>
          </header>

          {/* Filtros */}
          <div className="filters-section">
            <div className="filters-header">
              <h2>🔍 Filtros de Búsqueda</h2>
              <button 
                className="clear-filters-button"
                onClick={() => {
                  setFiltros({
                    page: 1,
                    limit: 20,
                    search: '',
                    tipo_usuario: '',
                    estado: ''
                  });
                }}
              >
                Limpiar Filtros
              </button>
            </div>
            <div className="filters-grid">
              <div className="filter-group">
                <label className="filter-label">Buscar:</label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Nombre, apellido o email..."
                  value={filtros.search}
                  onChange={(e) => handleFiltroChange('search', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">Tipo de Usuario:</label>
                <select
                  className="filter-select"
                  value={filtros.tipo_usuario}
                  onChange={(e) => handleFiltroChange('tipo_usuario', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="externo">Externo</option>
                  <option value="interno">Interno</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Estado:</label>
                <select
                  className="filter-select"
                  value={filtros.estado}
                  onChange={(e) => handleFiltroChange('estado', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>
            <div className="filter-actions">
              <button 
                className="search-button"
                onClick={cargarUsuarios}
                disabled={loading}
              >
                {loading ? '🔄' : '🔍'} {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>

          {/* Resultados */}
          <div className="users-section">
            <div className="users-header">
              <h2>
                {filtros.search ? 
                  `🔍 Resultados de búsqueda para "${filtros.search}"` : 
                  `📊 Resultados`
                }
              </h2>
              <div className="users-count">
                {filtros.search ? 
                  `${usuarios.length} resultado${usuarios.length !== 1 ? 's' : ''}` :
                  `${paginacion.total} usuarios encontrados`
                }
              </div>
            </div>

            {error && (
              <div className="error-message">
                ❌ {error}
              </div>
            )}

            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Cargando usuarios...</p>
              </div>
            ) : usuarios.length === 0 ? (
              <div className="no-results">
                <h3>
                  {filtros.search ? 
                    `No se encontraron usuarios que coincidan con "${filtros.search}"` : 
                    'No se encontraron usuarios con los criterios especificados'
                  }
                </h3>
                <p>
                  {filtros.search ? 
                    'Intenta con otros términos de búsqueda o ajusta los filtros.' : 
                    'No hay usuarios que coincidan con los filtros aplicados. Intenta cambiar los criterios de búsqueda.'
                  }
                </p>
              </div>
            ) : (
              <>
                {/* Tabla de usuarios */}
                <div className="table-wrapper">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th>Email Verificado</th>
                        <th>Actividades</th>
                        <th>Asistencias</th>
                        <th>Último Acceso</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map((usuario) => (
                        <tr key={usuario.id_usuario}>
                          <td>
                            <div className="user-info">
                              <div className="user-avatar">
                                {usuario.nombre_usuario?.charAt(0)?.toUpperCase()}
                              </div>
                              <div className="user-details">
                                <div className="user-name">
                                  {usuario.nombre_usuario} {usuario.apellido_usuario}
                                </div>
                                <div className="user-email">
                                  {usuario.email_usuario}
                                </div>
                                <div className="user-phone">
                                  📞 {usuario.telefono_usuario}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`user-type ${usuario.tipo_usuario?.nombre_tipo_usuario}`}>
                              {usuario.tipo_usuario?.nombre_tipo_usuario}
                            </span>
                          </td>
                          <td>
                            <span className={`user-status ${usuario.estado_usuario ? 'activo' : 'inactivo'}`}>
                              {usuario.estado_usuario ? '✅ Activo' : '❌ Inactivo'}
                            </span>
                          </td>
                          <td>
                            <span className={`email-verified ${usuario.email_verificado_usuario ? 'verificado' : 'pendiente'}`}>
                              {usuario.email_verificado_usuario ? '✅ Verificado' : '⏳ Pendiente'}
                            </span>
                          </td>
                          <td>
                            <span className="stat-number">{usuario.total_actividades_inscritas || 0}</span>
                          </td>
                          <td>
                            <span className="stat-number">{usuario.total_asistencias || 0}</span>
                          </td>
                          <td>
                            <div className="fecha-info">
                              {formatearFecha(usuario.ultimo_acceso_usuario)}
                            </div>
                          </td>
                          <td>
                            <button 
                              className="action-button"
                              onClick={() => verUsuarioEspecifico(usuario)}
                            >
                              👁️ Ver Detalle
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {paginacion.total_paginas > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(paginacion.pagina_actual - 1)}
                      disabled={paginacion.pagina_actual === 1}
                      className="pagination-button"
                    >
                      ← Anterior
                    </button>
                    
                    <span className="pagination-info">
                      Página {paginacion.pagina_actual} de {paginacion.total_paginas}
                    </span>
                    
                    <button
                      onClick={() => handlePageChange(paginacion.pagina_actual + 1)}
                      disabled={paginacion.pagina_actual === paginacion.total_paginas}
                      className="pagination-button"
                    >
                      Siguiente →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Usuario Específico */}
      {mostrarModalUsuario && usuarioSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModalUsuario}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👤 Detalles del Usuario</h2>
              <button className="close-button" onClick={cerrarModalUsuario}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="usuario-detalles">
                <div className="detalle-section">
                  <h3>📋 Información Personal</h3>
                  <div className="detalle-grid">
                    <div className="detalle-item">
                      <label>Nombre:</label>
                      <span>{usuarioSeleccionado.nombre_usuario} {usuarioSeleccionado.apellido_usuario}</span>
                    </div>
                    <div className="detalle-item">
                      <label>Email:</label>
                      <span>{usuarioSeleccionado.email_usuario}</span>
                    </div>
                    <div className="detalle-item">
                      <label>Teléfono:</label>
                      <span>{usuarioSeleccionado.telefono_usuario || 'N/A'}</span>
                    </div>
                    <div className="detalle-item">
                      <label>Colegio:</label>
                      <span>{usuarioSeleccionado.colegio_usuario || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="detalle-section">
                  <h3>🔐 Información de Cuenta</h3>
                  <div className="detalle-grid">
                    <div className="detalle-item">
                      <label>Tipo de Usuario:</label>
                      <span className={`badge badge-${usuarioSeleccionado.tipo_usuario?.nombre_tipo_usuario || 'default'}`}>
                        {usuarioSeleccionado.tipo_usuario?.nombre_tipo_usuario || 'N/A'}
                      </span>
                    </div>
                    <div className="detalle-item">
                      <label>Estado:</label>
                      <span className={`badge badge-${usuarioSeleccionado.estado_usuario ? 'success' : 'danger'}`}>
                        {usuarioSeleccionado.estado_usuario ? '✅ Activo' : '❌ Inactivo'}
                      </span>
                    </div>
                    <div className="detalle-item">
                      <label>Email Verificado:</label>
                      <span className={`badge badge-${usuarioSeleccionado.email_verificado_usuario ? 'success' : 'warning'}`}>
                        {usuarioSeleccionado.email_verificado_usuario ? '✅ Verificado' : '⏳ Pendiente'}
                      </span>
                    </div>
                    <div className="detalle-item">
                      <label>Fecha de Inscripción:</label>
                      <span>{formatearFecha(usuarioSeleccionado.fecha_inscripcion_usuario)}</span>
                    </div>
                    <div className="detalle-item">
                      <label>Último Acceso:</label>
                      <span>{formatearFecha(usuarioSeleccionado.ultimo_acceso_usuario)}</span>
                    </div>
                  </div>
                </div>

                {usuarioSeleccionado.es_administrador && (
                  <div className="detalle-section">
                    <h3>👑 Información de Administrador</h3>
                    <div className="detalle-grid">
                      <div className="detalle-item">
                        <label>Roles de Administrador:</label>
                        <div className="roles-container">
                          {usuarioSeleccionado.roles_administrador?.map((rol, index) => (
                            <span key={index} className="badge badge-admin">
                              {rol === 'super_admin' ? '👑 Super Admin' : `👑 ${rol}`}
                            </span>
                          )) || <span className="badge badge-default">N/A</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="detalle-section">
                  <h3>📊 Estadísticas</h3>
                  <div className="detalle-grid">
                    <div className="detalle-item">
                      <label>Actividades Inscritas:</label>
                      <span className="stat-number">{usuarioSeleccionado.total_actividades_inscritas || 0}</span>
                    </div>
                    <div className="detalle-item">
                      <label>Asistencias:</label>
                      <span className="stat-number">{usuarioSeleccionado.total_asistencias || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={cerrarModalUsuario}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminGuard>
  );
};

export default ListUsersPage;
