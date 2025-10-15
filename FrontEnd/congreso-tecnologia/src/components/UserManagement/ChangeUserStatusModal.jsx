// =====================================================
// Modal para Cambiar Estado de Usuario
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import React, { useState } from 'react';
import './ChangeUserStatusModal.css';

const ChangeUserStatusModal = ({ isOpen, onClose, onStatusChanged }) => {
  const [email, setEmail] = useState('');
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  // Limpiar estado cuando se abre/cierra el modal
  React.useEffect(() => {
    if (isOpen) {
      setEmail('');
      setUsuario(null);
      setError(null);
      setShowConfirmation(false);
      setChangingStatus(false);
    }
  }, [isOpen]);

  // Buscar usuario por email
  const buscarUsuario = async () => {
    if (!email.trim()) {
      setError('Por favor ingresa un email válido');
      return;
    }

    setLoading(true);
    setError(null);
    setUsuario(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://proyecto-final-seminario-desa-dmgi.vercel.app/api/admin/users/search?termino_busqueda=${encodeURIComponent(email)}&limite=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success && data.data.usuarios && data.data.usuarios.length > 0) {
        setUsuario(data.data.usuarios[0]);
        setError(null);
      } else {
        setError('No se encontró ningún usuario con ese email');
        setUsuario(null);
      }
    } catch (err) {
      console.error('Error al buscar usuario:', err);
      setError('Error al buscar el usuario. Intenta de nuevo.');
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado del usuario
  const cambiarEstado = async () => {
    if (!usuario) return;

    setChangingStatus(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const nuevoEstado = !usuario.estado_usuario;

      const response = await fetch(`https://proyecto-final-seminario-desa-dmgi.vercel.app/api/admin/users/${usuario.id_usuario}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          estado_usuario: nuevoEstado
        })
      });

      const data = await response.json();

      if (data.success) {
        // Actualizar el estado del usuario localmente
        setUsuario(prev => ({
          ...prev,
          estado_usuario: nuevoEstado
        }));
        
        // Notificar al componente padre
        if (onStatusChanged) {
          onStatusChanged(usuario.id_usuario, nuevoEstado);
        }
        
        setShowConfirmation(false);
        setError(null);
      } else {
        setError(data.message || 'Error al cambiar el estado del usuario');
      }
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setError('Error al cambiar el estado. Intenta de nuevo.');
    } finally {
      setChangingStatus(false);
    }
  };

  // Manejar tecla Enter en el input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      buscarUsuario();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>🔄 Cambiar Estado de Usuario</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {!showConfirmation ? (
            <>
              {/* Búsqueda de usuario */}
              <div className="change-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email del Usuario:</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="ejemplo@correo.com"
                      disabled={loading}
                      className="form-select"
                      style={{ flex: 1 }}
                    />
                    <button 
                      className="btn-primary" 
                      onClick={buscarUsuario}
                      disabled={loading || !email.trim()}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {loading ? '🔍' : '🔍 Buscar'}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="error-message">
                    ❌ {error}
                  </div>
                )}

                {/* Información del usuario encontrado */}
                {usuario && (
                  <div className="user-info">
                    <div className="user-avatar">
                      {usuario.nombre_usuario?.charAt(0)?.toUpperCase()}
                    </div>
                    <h3 className="user-name">{usuario.nombre_usuario} {usuario.apellido_usuario}</h3>
                    <p className="user-email">{usuario.email_usuario}</p>
                    <div className={`current-status ${usuario.estado_usuario ? 'activo' : 'inactivo'}`}>
                      {usuario.estado_usuario ? '✅ Activo' : '❌ Inactivo'}
                    </div>
                    
                    <button 
                      className="btn-primary"
                      onClick={() => setShowConfirmation(true)}
                      style={{ marginTop: '1rem' }}
                    >
                      🔄 Cambiar Estado
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Confirmación de cambio */}
              <div className="user-info">
                <h3>⚠️ Confirmar Cambio de Estado</h3>
                <div className="user-details">
                  <p><strong>Usuario:</strong> {usuario.nombre_usuario} {usuario.apellido_usuario}</p>
                  <p><strong>Email:</strong> {usuario.email_usuario}</p>
                  <p><strong>Estado Actual:</strong> {usuario.estado_usuario ? 'Activo' : 'Inactivo'}</p>
                  <p><strong>Nuevo Estado:</strong> {!usuario.estado_usuario ? 'Activo' : 'Inactivo'}</p>
                </div>
                
                <p>¿Estás seguro de que deseas cambiar el estado de este usuario?</p>

                {error && (
                  <div className="error-message">
                    ❌ {error}
                  </div>
                )}

                <div className="modal-footer" style={{ border: 'none', padding: '1rem 0 0 0', background: 'transparent' }}>
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowConfirmation(false)}
                    disabled={changingStatus}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={cambiarEstado}
                    disabled={changingStatus}
                  >
                    {changingStatus ? '🔄 Cambiando...' : '✅ Confirmar Cambio'}
                  </button>
                </div>
              </div>
            </>
          )}
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

export default ChangeUserStatusModal;
