import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logoUMG from '../../assets/LogoPrincipalUMG.png';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo Container */}
        <div className="logo-container">
          <img src={logoUMG} alt="Universidad Mariano Gálvez" className="logo-image" />
        </div>
        
        {/* Logo Text */}
        <div className="logo-text">
          <h1>UMG</h1>
        </div>

        {/* Navegación Desktop */}
        <nav className="nav-desktop">
          <ul>
            <li><a href="#inicio"><span className="nav-icon">🏠</span>Inicio</a></li>
            <li><a href="#congreso"><span className="nav-icon">ℹ️</span>Sobre el Congreso</a></li>
            <li><a href="#actividades"><span className="nav-icon">🎯</span>Actividades</a></li>
            <li><a href="#agenda"><span className="nav-icon">📅</span>Agenda</a></li>
            <li><a href="#ponentes"><span className="nav-icon">👥</span>Oponentes</a></li>
            <li><a href="#carrera"><span className="nav-icon">🎓</span>Carrera</a></li>
            <li><a href="#faq"><span className="nav-icon">❓</span>FAQ</a></li>
          </ul>
        </nav>

        {/* Botones de Acción */}
        <div className="header-actions">
          <button className="btn-login">Iniciar Sesión</button>
          <Link to="/registro" className="btn-primary">Inscribirse</Link>
        </div>

        {/* Botón Menú Móvil */}
        <button 
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Navegación Móvil */}
      <nav className={`nav-mobile ${isMenuOpen ? 'active' : ''}`}>
        <ul>
          <li><a href="#inicio" onClick={toggleMenu}><span className="nav-icon">🏠</span>Inicio</a></li>
          <li><a href="#congreso" onClick={toggleMenu}><span className="nav-icon">ℹ️</span>Sobre el Congreso</a></li>
          <li><a href="#actividades" onClick={toggleMenu}><span className="nav-icon">🎯</span>Actividades</a></li>
          <li><a href="#agenda" onClick={toggleMenu}><span className="nav-icon">📅</span>Agenda</a></li>
          <li><a href="#ponentes" onClick={toggleMenu}><span className="nav-icon">👥</span>Oponentes</a></li>
          <li><a href="#carrera" onClick={toggleMenu}><span className="nav-icon">🎓</span>Carrera</a></li>
          <li><a href="#faq" onClick={toggleMenu}><span className="nav-icon">❓</span>FAQ</a></li>
          <li className="mobile-actions">
            <button className="btn-login">Iniciar Sesión</button>
            <Link to="/registro" className="btn-primary" onClick={toggleMenu}>Inscribirse</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
