// =====================================================
// Página de Dashboard
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Verificar si hay token de autenticación
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('userData');

    if (!token || !user) {
      // Si no hay token o datos de usuario, redirigir al login
      navigate('/login');
      return;
    }

    try {
      setUserData(JSON.parse(user));
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    // Limpiar datos de autenticación
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    navigate('/');
  };

  if (!userData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#1A365D'
      }}>
        Cargando...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1A365D 0%, #2C5282 50%, #3182CE 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '2px solid #e9ecef'
        }}>
          <h1 style={{
            color: '#1A365D',
            fontSize: '2.5rem',
            margin: 0,
            fontWeight: '700'
          }}>
            🎉 ¡Bienvenido al Dashboard!
          </h1>
          <button
            onClick={handleLogout}
            style={{
              background: '#D92027',
              color: 'white',
              border: 'none',
              padding: '0.8rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#B81D22';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#D92027';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Cerrar Sesión
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Información del Usuario */}
          <div style={{
            background: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{
              color: '#1A365D',
              marginTop: 0,
              marginBottom: '1rem',
              fontSize: '1.3rem'
            }}>
              👤 Información Personal
            </h3>
            <div style={{ lineHeight: '1.8' }}>
              <p><strong>Nombre:</strong> {userData.nombre_usuario} {userData.apellido_usuario}</p>
              <p><strong>Email:</strong> {userData.email_usuario}</p>
              <p><strong>Tipo de Usuario:</strong> 
                <span style={{
                  background: userData.tipo_usuario === 'interno' ? '#28a745' : '#17a2b8',
                  color: 'white',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  marginLeft: '0.5rem',
                  fontSize: '0.9rem'
                }}>
                  {userData.tipo_usuario === 'interno' ? 'Estudiante UMG' : 'Estudiante Externo'}
                </span>
              </p>
              {userData.telefono_usuario && (
                <p><strong>Teléfono:</strong> {userData.telefono_usuario}</p>
              )}
              {userData.colegio_usuario && (
                <p><strong>Colegio:</strong> {userData.colegio_usuario}</p>
              )}
            </div>
          </div>

          {/* Estado de la Inscripción */}
          <div style={{
            background: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{
              color: '#1A365D',
              marginTop: 0,
              marginBottom: '1rem',
              fontSize: '1.3rem'
            }}>
              📋 Estado de Inscripción
            </h3>
            <div style={{ lineHeight: '1.8' }}>
              <p><strong>Estado:</strong> 
                <span style={{
                  background: userData.estado_usuario ? '#28a745' : '#dc3545',
                  color: 'white',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  marginLeft: '0.5rem',
                  fontSize: '0.9rem'
                }}>
                  {userData.estado_usuario ? 'Activo' : 'Inactivo'}
                </span>
              </p>
              <p><strong>Email Verificado:</strong> 
                <span style={{
                  background: userData.email_verificado_usuario ? '#28a745' : '#ffc107',
                  color: userData.email_verificado_usuario ? 'white' : '#212529',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  marginLeft: '0.5rem',
                  fontSize: '0.9rem'
                }}>
                  {userData.email_verificado_usuario ? 'Sí' : 'No'}
                </span>
              </p>
              <p><strong>Fecha de Inscripción:</strong> {new Date(userData.fecha_inscripcion_usuario).toLocaleDateString('es-GT')}</p>
            </div>
          </div>
        </div>

        {/* Mensaje de bienvenida */}
        <div style={{
          background: 'linear-gradient(135deg, #1A365D 0%, #2C5282 100%)',
          color: 'white',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>
            🎓 ¡Bienvenido al Congreso de Tecnología 2025!
          </h2>
          <p style={{ fontSize: '1.1rem', margin: 0, opacity: 0.9 }}>
            Tu inscripción ha sido confirmada exitosamente. 
            Mantente atento a futuras comunicaciones sobre el evento.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
