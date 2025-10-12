// =====================================================
// Página de Dashboard
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading, logout, getUserInscriptions } = useAuth();
  const [userInscriptions, setUserInscriptions] = useState([]);
  const [inscriptionsLoading, setInscriptionsLoading] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isAuthenticated) {
      loadUserInscriptions();
    }
  }, [isAuthenticated, loading, navigate]);

  const loadUserInscriptions = async () => {
    setInscriptionsLoading(true);
    try {
      const inscriptions = await getUserInscriptions();
      setUserInscriptions(inscriptions);
    } catch (error) {
      console.error('Error loading user inscriptions:', error);
    } finally {
      setInscriptionsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
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

  if (!user) {
    return null; // Se redirigirá al login
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
              <p><strong>Nombre:</strong> {user.nombre_usuario} {user.apellido_usuario}</p>
              <p><strong>Email:</strong> {user.email_usuario}</p>
              <p><strong>Tipo de Usuario:</strong> 
                <span style={{
                  background: user.tipo_usuario === 'interno' ? '#28a745' : '#17a2b8',
                  color: 'white',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  marginLeft: '0.5rem',
                  fontSize: '0.9rem'
                }}>
                  {user.tipo_usuario === 'interno' ? 'Estudiante UMG' : 'Estudiante Externo'}
                </span>
              </p>
              {user.telefono_usuario && (
                <p><strong>Teléfono:</strong> {user.telefono_usuario}</p>
              )}
              {user.colegio_usuario && (
                <p><strong>Colegio:</strong> {user.colegio_usuario}</p>
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
                  background: user.estado_usuario ? '#28a745' : '#dc3545',
                  color: 'white',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  marginLeft: '0.5rem',
                  fontSize: '0.9rem'
                }}>
                  {user.estado_usuario ? 'Activo' : 'Inactivo'}
                </span>
              </p>
              <p><strong>Email Verificado:</strong> 
                <span style={{
                  background: user.email_verificado_usuario ? '#28a745' : '#ffc107',
                  color: user.email_verificado_usuario ? 'white' : '#212529',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  marginLeft: '0.5rem',
                  fontSize: '0.9rem'
                }}>
                  {user.email_verificado_usuario ? 'Sí' : 'No'}
                </span>
              </p>
              <p><strong>Fecha de Inscripción:</strong> {new Date(user.fecha_inscripcion_usuario).toLocaleDateString('es-GT')}</p>
            </div>
          </div>
        </div>

        {/* Sección de inscripciones */}
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
            📋 Mis Inscripciones a Actividades
          </h3>
          
          {inscriptionsLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{
                width: '30px',
                height: '30px',
                border: '3px solid #e9ecef',
                borderTop: '3px solid #1A365D',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }}></div>
              <p style={{ color: '#6c757d', margin: 0 }}>Cargando inscripciones...</p>
            </div>
          ) : userInscriptions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {userInscriptions.map((inscription, index) => (
                <div key={index} style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '6px',
                  border: '1px solid #e9ecef',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#1A365D' }}>
                      {inscription.nombre_actividad}
                    </h4>
                    <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>
                      Fecha de inscripción: {new Date(inscription.fecha_inscripcion).toLocaleDateString('es-GT')}
                    </p>
                  </div>
                  <span style={{
                    background: inscription.estado_inscripcion === 'confirmada' ? '#28a745' : '#ffc107',
                    color: inscription.estado_inscripcion === 'confirmada' ? 'white' : '#212529',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {inscription.estado_inscripcion}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📝</div>
              <p style={{ color: '#6c757d', margin: '0 0 1rem 0' }}>
                Aún no te has inscrito a ninguna actividad
              </p>
              <button
                onClick={() => navigate('/')}
                style={{
                  background: '#1A365D',
                  color: 'white',
                  border: 'none',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                Ver Actividades Disponibles
              </button>
            </div>
          )}
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
