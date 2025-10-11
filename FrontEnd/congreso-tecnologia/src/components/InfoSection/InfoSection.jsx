import React from 'react';
import './InfoSection.css';

const InfoSection = () => {
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
    }
  ];

  const highlights = [
    {
      number: '5+',
      label: 'Años de experiencia',
      description: 'Organizando eventos tecnológicos'
    },
    {
      number: '1000+',
      label: 'Estudiantes impactados',
      description: 'En ediciones anteriores'
    },
    {
      number: '50+',
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

        {/* Call to Action */}
        <div className="info-cta">
          <div className="cta-content">
            <h3>¿Listo para ser parte del futuro tecnológico?</h3>
            <p>Inscríbete ahora y forma parte de esta experiencia única</p>
            <div className="cta-buttons">
              <button className="btn-cta-primary">Inscribirse Ahora</button>
              <button className="btn-cta-secondary">Ver Programa Completo</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
