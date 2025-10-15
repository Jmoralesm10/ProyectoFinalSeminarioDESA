import React from 'react';
import { Link } from 'react-router-dom';
import { usePublicDataSimple } from '../../hooks/usePublicDataSimple';
import { useAuth } from '../../hooks/useAuth';
import './Hero.css';

const Hero = () => {
  const { heroStats, congressInfoFormatted } = usePublicDataSimple();
  const { isAuthenticated, user } = useAuth();
  return (
    <section id="inicio" className="hero">
      <div className="hero-background">
        <div className="hero-overlay"></div>
      </div>
      
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">
            <span className="hero-title-main">{congressInfoFormatted.titulo}</span>
            <span className="hero-title-year">2025</span>
          </h1>
          
          <p className="hero-subtitle">
            {congressInfoFormatted.descripcion}
          </p>
          
          <p className="hero-description">
            Únete al evento más importante del año en tecnología e ingeniería de sistemas. 
            Descubre las últimas tendencias, participa en talleres especializados y 
            conéctate con profesionales de la industria.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
