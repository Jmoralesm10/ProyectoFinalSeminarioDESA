// =====================================================
// Modal para Listar Usuarios
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import React, { useState, useEffect } from 'react';
import './ListUsersModal.css';

const ListUsersModal = ({ isOpen, onClose }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    page: 1,
    limit: 10,
    search: '',
    tipo_usuario: '',
    estado: '',
    rol_administrador: ''
  });
  const [paginacion, setPaginacion] = useState({
    total: 0,
    pagina_actual: 1,
    total_paginas: 1
  });

  // Cargar usuarios
  const cargarUsuarios = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams();
      
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) {
          params.append(key, filtros[key]);
        }
      });

      const response = await fetch(`https://proyecto-final-seminario-desa-dmgi.vercel.app/api/admin/users?${params.toString()}`, {
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
        console.log('📊 Datos recibidos de la API:', data);
        console.log('👥 Usuarios:', data.data.usuarios);
        console.log('📈 Paginación:', data.data);
        
        setUsuarios(data.data.usuarios);
        setPaginacion({
          total: parseInt(data.data.total),
          pagina_actual: data.data.pagina_actual,
          total_paginas: data.data.total_paginas
        });
      } else {
        throw new Error(data.message || 'Error al cargar usuarios');
      }
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar usuarios cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      cargarUsuarios();
    }
  }, [isOpen]);

  // Efecto para recargar cuando cambian los filtros
  useEffect(() => {
    if (isOpen) {
      cargarUsuarios();
    }
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
      <span className="badge badge-success">Activo</span> : 
      <span className="badge badge-danger">Inactivo</span>;
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

  // Obtener badge de rol administrador
  const getRolAdminBadge = (roles) => {
    if (!roles || roles.length === 0) return null;
    
    return roles.map((rol, index) => (
      <span key={index} className="badge badge-admin">
        {rol === 'super_admin' ? '👑 Super Admin' : `👑 ${rol}`}
      </span>
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content list-users-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👥 Listar Usuarios</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Test de visibilidad */}
          <div style={{background: 'red', color: 'white', padding: '1rem', textAlign: 'center', fontSize: '1.2rem'}}>
            🚨 TEST: ESTE TEXTO DEBE SER VISIBLE SI EL MODAL FUNCIONA
          </div>
          
          {/* Filtros */}
          <div className="filtros-section">
            <h3>🔍 Filtros de Búsqueda</h3>
            <div className="filtros-grid">
              <div className="filtro-group">
                <label>Buscar:</label>
                <input
                  type="text"
                  placeholder="Nombre, apellido o email..."
                  value={filtros.search}
                  onChange={(e) => handleFiltroChange('search', e.target.value)}
                />
              </div>

              <div className="filtro-group">
                <label>Tipo de Usuario:</label>
                <select
                  value={filtros.tipo_usuario}
                  onChange={(e) => handleFiltroChange('tipo_usuario', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="externo">Externo</option>
                  <option value="interno">Interno</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>

              <div className="filtro-group">
                <label>Estado:</label>
                <select
                  value={filtros.estado}
                  onChange={(e) => handleFiltroChange('estado', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>

              <div className="filtro-group">
                <label>Rol Admin:</label>
                <select
                  value={filtros.rol_administrador}
                  onChange={(e) => handleFiltroChange('rol_administrador', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="moderador">Moderador</option>
                </select>
              </div>

              <div className="filtro-group">
                <label>Registros por página:</label>
                <select
                  value={filtros.limit}
                  onChange={(e) => handleFiltroChange('limit', parseInt(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="resultados-section">
            <div className="resultados-header">
              <h3>📊 Resultados ({paginacion.total} usuarios encontrados)</h3>
              <button 
                className="btn-refresh" 
                onClick={cargarUsuarios}
                disabled={loading}
              >
                {loading ? '🔄' : '🔄'} Actualizar
              </button>
            </div>

            {error && (
              <div className="error-message">
                ❌ {error}
              </div>
            )}

            {/* Debug info SIEMPRE visible */}
            <div style={{padding: '1rem', background: '#f0f9ff', margin: '1rem', borderRadius: '6px', fontSize: '0.9rem', border: '2px solid blue'}}>
              <strong>🔍 Debug Info:</strong><br/>
              Usuarios en estado: {usuarios.length}<br/>
              Loading: {loading.toString()}<br/>
              Error: {error || 'Ninguno'}<br/>
              Paginación total: {paginacion.total}<br/>
              <strong>Estado de renderizado:</strong> {loading ? 'CARGANDO' : 'MOSTRANDO DATOS'}
            </div>

            {loading ? (
              <div className="loading-message">
                🔄 Cargando usuarios...
              </div>
            ) : (
              <div style={{border: '3px solid green', padding: '1rem', margin: '1rem'}}>
                <div style={{background: 'orange', padding: '0.5rem', marginBottom: '1rem'}}>
                  ✅ ESTADO: NO ESTÁ CARGANDO - DEBERÍA MOSTRAR TABLA
                </div>
                
                {usuarios.length === 0 ? (
                  <div style={{background: 'red', color: 'white', padding: '1rem'}}>
                    ❌ NO HAY USUARIOS EN EL ARRAY
                  </div>
                ) : (
                  <div style={{background: 'lightgreen', padding: '1rem'}}>
                    ✅ HAY {usuarios.length} USUARIOS - RENDERIZANDO TABLA
                    <div style={{background: 'yellow', padding: '0.5rem', marginTop: '1rem'}}>
                      🔍 DEBUG: Renderizando tabla con {usuarios.length} usuarios
                    </div>
                    <div style={{overflowX: 'auto', marginTop: '1rem'}}>
                      <table style={{width: '100%', border: '2px solid black', fontSize: '0.9rem', minWidth: '1200px'}}>
                      <thead>
                        <tr style={{background: '#667eea', color: 'white'}}>
                          <th style={{padding: '0.5rem', minWidth: '200px'}}>Usuario</th>
                          <th style={{padding: '0.5rem', minWidth: '100px'}}>Tipo</th>
                          <th style={{padding: '0.5rem', minWidth: '80px'}}>Estado</th>
                          <th style={{padding: '0.5rem', minWidth: '120px'}}>Email Verificado</th>
                          <th style={{padding: '0.5rem', minWidth: '120px'}}>Rol Admin</th>
                          <th style={{padding: '0.5rem', minWidth: '80px'}}>Actividades</th>
                          <th style={{padding: '0.5rem', minWidth: '80px'}}>Asistencias</th>
                          <th style={{padding: '0.5rem', minWidth: '120px'}}>Último Acceso</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuarios.map((usuario, index) => (
                        <tr key={usuario.id_usuario} style={{border: '1px solid blue'}}>
                          <td style={{background: 'lightblue', padding: '0.3rem', fontSize: '0.8rem'}}>
                            <div>
                              <div style={{background: 'lightgreen', padding: '0.1rem', fontSize: '0.7rem'}}>
                                DEBUG: Usuario {index + 1} - {usuario.nombre_usuario}
                              </div>
                              <div style={{fontWeight: 'bold'}}>
                                {usuario.nombre_usuario} {usuario.apellido_usuario}
                              </div>
                              <div style={{fontSize: '0.7rem', color: '#666'}}>
                                {usuario.email_usuario}
                              </div>
                              <div style={{fontSize: '0.7rem'}}>
                                📞 {usuario.telefono_usuario}
                              </div>
                            </div>
                          </td>
                          <td style={{background: 'lightyellow', padding: '0.3rem', fontSize: '0.8rem', textAlign: 'center'}}>
                            {usuario.tipo_usuario?.nombre_tipo_usuario || 'N/A'}
                          </td>
                          <td style={{background: 'lightyellow', padding: '0.3rem', fontSize: '0.8rem', textAlign: 'center'}}>
                            {usuario.estado_usuario ? '✅ Activo' : '❌ Inactivo'}
                          </td>
                          <td style={{background: 'lightyellow', padding: '0.3rem', fontSize: '0.8rem', textAlign: 'center'}}>
                            {usuario.email_verificado_usuario ? '✅' : '⏳'}
                          </td>
                          <td style={{background: 'lightyellow', padding: '0.3rem', fontSize: '0.8rem', textAlign: 'center'}}>
                            {usuario.roles_administrador?.join(', ') || 'N/A'}
                          </td>
                          <td style={{background: 'lightyellow', padding: '0.3rem', fontSize: '0.8rem', textAlign: 'center'}}>
                            {usuario.total_actividades_inscritas}
                          </td>
                          <td style={{background: 'lightyellow', padding: '0.3rem', fontSize: '0.8rem', textAlign: 'center'}}>
                            {usuario.total_asistencias}
                          </td>
                          <td style={{background: 'lightyellow', padding: '0.3rem', fontSize: '0.7rem', textAlign: 'center'}}>
                            {usuario.ultimo_acceso_usuario ? new Date(usuario.ultimo_acceso_usuario).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                        ))}
                      </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListUsersModal;
