// =====================================================
// Página de Perfil de Usuario
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    apellido_usuario: '',
    email_usuario: '',
    telefono_usuario: '',
    colegio_usuario: ''
  });
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      setFormData({
        nombre_usuario: user.nombre_usuario || '',
        apellido_usuario: user.apellido_usuario || '',
        email_usuario: user.email_usuario || '',
        telefono_usuario: user.telefono_usuario || '',
        colegio_usuario: user.colegio_usuario || ''
      });
    }
  }, [isAuthenticated, loading, navigate, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoadingUpdate(true);
    setUpdateMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://proyecto-final-seminario-desa-dmgi.vercel.app/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setUpdateMessage('Perfil actualizado exitosamente');
        setIsEditing(false);
        // Actualizar el usuario en el contexto
        window.location.reload(); // Recargar para actualizar los datos
      } else {
        setUpdateMessage(result.message || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateMessage('Error al actualizar el perfil');
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header del Perfil */}
        <div className="profile-header">
          <div className="profile-header-content">
            <div className="profile-avatar-section">
              <div className="profile-avatar-large">
                {user.nombre_usuario?.charAt(0)?.toUpperCase() || '👤'}
              </div>
              <div className="profile-basic-info">
                <h1 className="profile-name">
                  {user.nombre_usuario} {user.apellido_usuario}
                </h1>
                <p className="profile-email">{user.email_usuario}</p>
                <span className={`user-type-badge ${user.tipo_usuario === 'interno' ? 'interno' : 'externo'}`}>
                  {user.tipo_usuario === 'interno' ? 'Estudiante UMG' : 'Estudiante Externo'}
                </span>
              </div>
            </div>
            <div className="profile-actions-header">
              <button
                onClick={() => navigate('/')}
                className="action-button secondary"
              >
                🏠 Volver al Inicio
              </button>
              <button
                onClick={handleLogout}
                className="action-button logout"
              >
                🚪 Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        {/* Información del Perfil */}
        <div className="profile-content">
          <div className="profile-section">
            <div className="section-header">
              <h2>📋 Información Personal</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="edit-button"
              >
                {isEditing ? '❌ Cancelar' : '✏️ Editar'}
              </button>
            </div>

            {updateMessage && (
              <div className={`update-message ${updateMessage.includes('exitosamente') ? 'success' : 'error'}`}>
                {updateMessage}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="nombre_usuario">Nombre</label>
                  <input
                    type="text"
                    id="nombre_usuario"
                    name="nombre_usuario"
                    value={formData.nombre_usuario}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="apellido_usuario">Apellido</label>
                  <input
                    type="text"
                    id="apellido_usuario"
                    name="apellido_usuario"
                    value={formData.apellido_usuario}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email_usuario">Email</label>
                  <input
                    type="email"
                    id="email_usuario"
                    name="email_usuario"
                    value={formData.email_usuario}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="telefono_usuario">Teléfono</label>
                  <input
                    type="tel"
                    id="telefono_usuario"
                    name="telefono_usuario"
                    value={formData.telefono_usuario}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="form-input"
                    placeholder="Ingresa tu número de teléfono"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="colegio_usuario">Colegio/Institución</label>
                  <input
                    type="text"
                    id="colegio_usuario"
                    name="colegio_usuario"
                    value={formData.colegio_usuario}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="form-input"
                    placeholder="Nombre de tu colegio o institución"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={loadingUpdate}
                    className="action-button primary"
                  >
                    {loadingUpdate ? '⏳ Guardando...' : '💾 Guardar Cambios'}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Información de Estado */}
          <div className="profile-section">
            <div className="section-header">
              <h2>📊 Estado de la Cuenta</h2>
            </div>

            <div className="status-grid">
              <div className="status-item">
                <div className="status-label">Estado de la Cuenta</div>
                <div className={`status-value ${user.estado_usuario ? 'active' : 'inactive'}`}>
                  {user.estado_usuario ? '✅ Activo' : '❌ Inactivo'}
                </div>
              </div>

              <div className="status-item">
                <div className="status-label">Email Verificado</div>
                <div className={`status-value ${user.email_verificado_usuario ? 'verified' : 'pending'}`}>
                  {user.email_verificado_usuario ? '✅ Verificado' : '⏳ Pendiente'}
                </div>
              </div>

              <div className="status-item">
                <div className="status-label">Fecha de Inscripción</div>
                <div className="status-value">
                  📅 {new Date(user.fecha_inscripcion_usuario).toLocaleDateString('es-GT')}
                </div>
              </div>

              {user.ultimo_acceso_usuario && (
                <div className="status-item">
                  <div className="status-label">Último Acceso</div>
                  <div className="status-value">
                    🕒 {new Date(user.ultimo_acceso_usuario).toLocaleDateString('es-GT')}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información de Seguridad */}
          <div className="profile-section">
            <div className="section-header">
              <h2>🔐 Seguridad</h2>
            </div>

            <div className="security-actions">
              <button
                onClick={() => navigate('/cambiar-password')}
                className="action-button secondary"
              >
                🔑 Cambiar Contraseña
              </button>
              <button
                onClick={() => navigate('/verificar-email')}
                className="action-button secondary"
              >
                📧 Verificar Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
