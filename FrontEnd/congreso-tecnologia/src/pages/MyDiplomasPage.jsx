// =====================================================
// Página de Mis Diplomas
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getApiUrl } from '../config/api';
import './MyDiplomasPage.css';

const MyDiplomasPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useAuth();
  const [userDiplomas, setUserDiplomas] = useState([]);
  const [diplomasLoading, setDiplomasLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isAuthenticated) {
      loadUserDiplomas();
    }
  }, [isAuthenticated, loading, navigate]);

  const loadUserDiplomas = async () => {
    setDiplomasLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      
      // Intentar primero el nuevo endpoint
      let response = await fetch(getApiUrl('/api/users/my-diplomas'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Si falla, usar el endpoint público temporal
      if (!response.ok) {
        console.log('Endpoint /my-diplomas falló, intentando endpoint público temporal...');
        response = await fetch(getApiUrl(`/api/public/user-diplomas/${user?.id_usuario}`), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      const result = await response.json();

      if (result.success) {
        setUserDiplomas(result.diplomas || []);
      } else {
        setError(result.message || 'Error al cargar los diplomas');
      }
    } catch (error) {
      console.error('Error loading user diplomas:', error);
      setError('Error al cargar los diplomas. Por favor, intenta de nuevo.');
    } finally {
      setDiplomasLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-GT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha no disponible';
    }
  };

  const getDiplomaTypeIcon = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'participacion':
        return '🎓';
      case 'competencia':
        return '🏆';
      case 'congreso':
        return '🎉';
      case 'actividad':
        return '📋';
      default:
        return '📜';
    }
  };

  const getDiplomaTypeColor = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'participacion':
        return '#28a745';
      case 'competencia':
        return '#ffc107';
      case 'congreso':
        return '#17a2b8';
      case 'actividad':
        return '#6f42c1';
      default:
        return '#1A365D';
    }
  };

  const handleDownloadDiploma = async (diploma) => {
    try {
      console.log('Descargando diploma:', diploma);
      console.log('ID del diploma:', diploma.id_diploma);
      console.log('Campos disponibles:', Object.keys(diploma));
      
             // Si el diploma ya tiene archivo, descargarlo directamente
             if (diploma.archivo_path_diploma) {
               const token = localStorage.getItem('authToken');
               // Extraer solo el nombre del archivo de la ruta completa
               const fileName = diploma.archivo_path_diploma.split('\\').pop() || diploma.archivo_path_diploma.split('/').pop();
               console.log('📥 Descargando archivo:', fileName);
               console.log('📥 Ruta original:', diploma.archivo_path_diploma);
               
               const response = await fetch(getApiUrl(`/api/diplomas/download/${fileName}`), {
                 method: 'GET',
                 headers: {
                   'Authorization': `Bearer ${token}`
                 }
               });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${diploma.nombre_diploma || 'diploma'}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          alert('Error al descargar el diploma');
        }
        return;
      }
      
      // Si no tiene archivo, generar el PDF primero
      console.log('Generando PDF para diploma:', diploma.id_diploma);
      
      const response = await fetch(getApiUrl(`/api/public/generate-diploma-pdf/${diploma.id_diploma}/${user?.id_usuario}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        console.log('PDF generado exitosamente:', result);
        alert(`PDF generado exitosamente: ${result.fileName}`);
        
        // Recargar los diplomas para mostrar el nuevo estado
        loadUserDiplomas();
      } else {
        console.error('Error al generar PDF:', result.message);
        alert(`Error al generar PDF: ${result.message}`);
      }
    } catch (error) {
      console.error('Error al descargar diploma:', error);
      alert('Error al descargar el diploma');
    }
  };

  if (loading) {
    return (
      <div className="my-diplomas-loading">
        <div className="loading-spinner"></div>
        <p>Cargando diplomas...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="my-diplomas-page">
      <div className="my-diplomas-container">
        {/* Header de la Página */}
        <div className="my-diplomas-header">
          <div className="header-content">
            <button
              onClick={() => navigate('/')}
              className="back-button"
            >
              🏠 Volver al Inicio
            </button>
            <div className="header-info">
              <h1>
                <span className="title-icon">🏆</span>
                Mis Diplomas
              </h1>
              <p>Visualiza y descarga todos tus diplomas del Congreso de Tecnología 2025</p>
            </div>
          </div>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📜</div>
              <div className="stat-content">
                <div className="stat-number">{userDiplomas.length}</div>
                <div className="stat-label">Total Diplomas</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎓</div>
              <div className="stat-content">
                <div className="stat-number">
                  {userDiplomas.filter(d => d.tipo_diploma === 'participacion').length}
                </div>
                <div className="stat-label">Participación</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-content">
                <div className="stat-number">
                  {userDiplomas.filter(d => d.tipo_diploma === 'competencia').length}
                </div>
                <div className="stat-label">Competencias</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📥</div>
              <div className="stat-content">
                <div className="stat-number">
                  {userDiplomas.filter(d => d.fecha_descarga_diploma).length}
                </div>
                <div className="stat-label">Descargados</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Diplomas */}
        <div className="diplomas-section">
          <div className="section-header">
            <h2>📜 Mis Diplomas</h2>
            <button
              onClick={loadUserDiplomas}
              className="refresh-button"
              disabled={diplomasLoading}
            >
              {diplomasLoading ? '⏳' : '🔄'} Actualizar
            </button>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {diplomasLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando diplomas...</p>
            </div>
          ) : userDiplomas.length > 0 ? (
            <div className="diplomas-grid">
              {userDiplomas.map((diploma, index) => (
                <div key={index} className="diploma-card">
                  <div className="diploma-header">
                    <div className="diploma-type">
                      <span 
                        className="type-icon"
                        style={{ color: getDiplomaTypeColor(diploma.tipo_diploma) }}
                      >
                        {getDiplomaTypeIcon(diploma.tipo_diploma)}
                      </span>
                      <span className="type-text">
                        {diploma.tipo_diploma_descripcion || diploma.tipo_diploma || 'Diploma'}
                      </span>
                    </div>
                    <div 
                      className="diploma-status"
                      style={{ 
                        backgroundColor: diploma.archivo_path_diploma ? '#d4edda' : '#fff3cd',
                        color: diploma.archivo_path_diploma ? '#155724' : '#856404'
                      }}
                    >
                      {diploma.archivo_path_diploma ? '✅ Disponible' : '⏳ Generando'}
                    </div>
                  </div>

                  <div className="diploma-content">
                    <h3 className="diploma-title">
                      {diploma.nombre_diploma || 'Diploma sin nombre'}
                    </h3>
                    
                    {diploma.actividad_nombre && (
                      <p className="diploma-activity">
                        <span className="activity-label">Actividad:</span>
                        {diploma.actividad_nombre}
                      </p>
                    )}

                    <div className="diploma-details">
                      {diploma.fecha_generacion_diploma && (
                        <div className="detail-item">
                          <span className="detail-icon">📅</span>
                          <span className="detail-text">
                            Generado: {formatDate(diploma.fecha_generacion_diploma)}
                          </span>
                        </div>
                      )}

                      {diploma.fecha_descarga_diploma && (
                        <div className="detail-item">
                          <span className="detail-icon">📥</span>
                          <span className="detail-text">
                            Descargado: {formatDate(diploma.fecha_descarga_diploma)}
                          </span>
                        </div>
                      )}

                      {diploma.posicion_resultado && (
                        <div className="detail-item">
                          <span className="detail-icon">🏅</span>
                          <span className="detail-text">
                            Posición: {diploma.posicion_resultado}
                          </span>
                        </div>
                      )}

                      {diploma.puntuacion_resultado && (
                        <div className="detail-item">
                          <span className="detail-icon">⭐</span>
                          <span className="detail-text">
                            Puntuación: {diploma.puntuacion_resultado}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="diploma-footer">
                      <button
                        onClick={() => handleDownloadDiploma(diploma)}
                        className={`download-button ${diploma.archivo_path_diploma ? 'available' : 'generate'}`}
                      >
                        {diploma.archivo_path_diploma ? '📥 Descargar PDF' : '🔄 Generar PDF'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📜</div>
              <h3>No tienes diplomas generados</h3>
              <p>Los diplomas se generan automáticamente después de completar las actividades del congreso</p>
              <div className="empty-actions">
                <button
                  onClick={() => navigate('/mis-actividades')}
                  className="action-button primary"
                >
                  🎯 Ver Mis Actividades
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Información Adicional */}
        <div className="info-section">
          <div className="info-card">
            <div className="info-header">
              <span className="info-icon">ℹ️</span>
              <h3>Información sobre Diplomas</h3>
            </div>
            <div className="info-content">
              <ul className="info-list">
                <li>🎓 Los diplomas de participación se generan automáticamente</li>
                <li>🏆 Los diplomas de competencia requieren resultados oficiales</li>
                <li>📧 Recibirás notificación por email cuando estén listos</li>
                <li>💾 Los diplomas se pueden descargar en formato PDF</li>
                <li>🔒 Cada diploma tiene un código único de verificación</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyDiplomasPage;
