import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section id="inicio" className="hero">
      <div className="hero-background">
        <div className="hero-overlay"></div>
      </div>
      
      <div className="hero-content">
        <div className="hero-container">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="hero-title-main">Congreso de Tecnología</span>
              <span className="hero-title-year">2025</span>
            </h1>
            
            <p className="hero-subtitle">
              Conectando el futuro con la innovación tecnológica
            </p>
            
            <p className="hero-description">
              Únete al evento más importante del año en tecnología e ingeniería de sistemas. 
              Descubre las últimas tendencias, participa en talleres especializados y 
              conéctate con profesionales de la industria.
            </p>
            
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">Participantes</span>
              </div>
              <div className="stat">
                <span className="stat-number">20+</span>
                <span className="stat-label">Talleres</span>
              </div>
              <div className="stat">
                <span className="stat-number">15+</span>
                <span className="stat-label">Ponentes</span>
              </div>
              <div className="stat">
                <span className="stat-number">3</span>
                <span className="stat-label">Días</span>
              </div>
            </div>
            
            <div className="hero-actions">
              <button className="btn-hero-primary">
                Inscribirse Ahora
                <span className="btn-icon">→</span>
              </button>
              <button className="btn-hero-secondary">
                Ver Agenda
              </button>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="hero-card">
              <div className="card-header">
                <div className="card-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="card-title">Congreso 2025</span>
              </div>
              <div className="card-content">
                <div className="event-date">
                  <span className="date-day">15</span>
                  <span className="date-month">NOV</span>
                </div>
                <div className="event-info">
                  <h3>Día 1: Innovación</h3>
                  <p>Talleres de desarrollo web y móvil</p>
                  <div className="event-time">9:00 AM - 6:00 PM</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="hero-scroll">
        <div className="scroll-indicator">
          <span>Desplázate para descubrir más</span>
          <div className="scroll-arrow">↓</div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
