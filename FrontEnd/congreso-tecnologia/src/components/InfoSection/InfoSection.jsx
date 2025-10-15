import React from 'react';
import { usePublicDataSimple } from '../../hooks/usePublicDataSimple';
import './InfoSection.css';

const InfoSection = () => {
  const { publicStats } = usePublicDataSimple();
  
  // El hook de fallback ya proporciona valores por defecto
  const features = [
    {
      icon: '🎯',
      title: 'Objetivo Principal',
      description: 'Promover la carrera de ingeniería en sistemas entre estudiantes de nivel medio y ofrecer una plataforma de participación académica y recreativa.'
    },
    {
      icon: '👥',
      title: 'Participantes',
      description: 'Estudiantes externos de nivel medio y alumnos internos de la facultad, creando un ambiente de intercambio y aprendizaje mutuo.'
    },
    {
      icon: '🏆',
      title: 'Actividades',
      description: 'Talleres especializados, competencias tecnológicas, ponencias magistrales y actividades recreativas para todos los participantes.'
    },
    {
      icon: '📚',
      title: 'Aprendizaje',
      description: 'Oportunidades únicas de aprendizaje práctico, networking profesional y desarrollo de habilidades tecnológicas actuales.'
    },
    {
      icon: '👨‍💼',
      title: 'Asistencia Personalizada',
      description: 'Acompañamiento individual y grupal durante todo el evento, con mentores especializados para guiar tu experiencia.'
    },
    {
      icon: '📜',
      title: 'Certificados',
      description: 'Certificaciones oficiales de participación y diplomas de reconocimiento por competencias y talleres completados.'
    }
  ];

  const highlights = [
    {
      number: '5+',
      label: 'Años de experiencia',
      description: 'Organizando eventos tecnológicos'
    },
    {
      number: `${publicStats.total_usuarios}+`,
      label: 'Estudiantes impactados',
      description: 'En ediciones anteriores'
    },
    {
      number: `${publicStats.total_actividades}+`,
      label: 'Talleres realizados',
      description: 'Con expertos de la industria'
    },
    {
      number: '95%',
      label: 'Satisfacción',
      description: 'De participantes anteriores'
    }
  ];

  return (
    <section id="congreso" className="info-section">
      <div className="info-container">
        {/* Header */}
        <div className="info-header">
          <h2 className="section-title">Sobre el Congreso</h2>
          <p className="section-subtitle">
            Un evento anual que conecta la academia con la industria tecnológica
          </p>
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Highlights Section */}
        <div className="highlights-section">
          <div className="highlights-content">
            <div className="highlights-text">
              <h3>¿Por qué participar?</h3>
              <p>
                El Congreso de Tecnología es más que un evento académico. Es una oportunidad 
                única para estudiantes de nivel medio de descubrir el fascinante mundo de la 
                ingeniería en sistemas, mientras que los alumnos de la facultad pueden 
                compartir sus conocimientos y experiencias.
              </p>
              <ul className="benefits-list">
                <li>Acceso a las últimas tendencias tecnológicas</li>
                <li>Networking con profesionales de la industria</li>
                <li>Certificaciones y diplomas de participación</li>
                <li>Oportunidades de desarrollo profesional</li>
              </ul>
            </div>
            
            <div className="highlights-stats">
              {highlights.map((highlight, index) => (
                <div key={index} className="highlight-stat">
                  <div className="stat-number">{highlight.number}</div>
                  <div className="stat-label">{highlight.label}</div>
                  <div className="stat-description">{highlight.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default InfoSection;
