import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import logoUMG from '../../assets/LogoPrincipalUMG.png';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { isAuthenticated, user, logout, isAdmin, hasPermission, permissionsLoading } = useAuth();
  const profileDropdownRef = useRef(null);


  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);
  };

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo Container */}
        <div className="logo-container">
          <img src={logoUMG} alt="Universidad Mariano Gálvez" className="logo-image" />
          <div className="logo-text">
            <h1>UMG</h1>
          </div>
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
            {isAuthenticated && (
              <>
                {isAdmin && (
                  <>
                    <li><Link to="/admin-panel"><span className="nav-icon">🔧</span>Panel Admin</Link></li>
                  </>
                )}
              </>
            )}
            {isAuthenticated ? (
              <li className="nav-profile">
                <div className="profile-dropdown" ref={profileDropdownRef}>
                  <button 
                    className="profile-button"
                    onClick={toggleProfileDropdown}
                    aria-label="Perfil de usuario"
                  >
                    <span className="profile-avatar">
                      {user?.nombre_usuario?.charAt(0)?.toUpperCase() || '👤'}
                    </span>
                    <span className="profile-name">
                      {user?.nombre_usuario || 'Usuario'}
                    </span>
                    <span className="dropdown-arrow">▼</span>
                  </button>
                  
                  {isProfileDropdownOpen && (
                    <div className="profile-dropdown-menu">
                      <div className="profile-info">
                        <div className="profile-avatar-large">
                          {user?.nombre_usuario?.charAt(0)?.toUpperCase() || '👤'}
                        </div>
                        <div className="profile-details">
                          <h4>{user?.nombre_usuario} {user?.apellido_usuario}</h4>
                          <p>{user?.email_usuario}</p>
                          <span className="user-type">
                            {(() => {
                              const isSuperAdmin = user?.permisos_especiales && Array.isArray(user.permisos_especiales) &&
                                user.permisos_especiales.some(item => 
                                  typeof item === 'object' && item.rol_administrador === 'super_admin'
                                );
                              
                              if (isSuperAdmin) return '👑 Super Administrador';
                              if (isAdmin) return '👑 Administrador';
                              return user?.tipo_usuario === 'interno' ? 'Estudiante Interno' : 'Estudiante Externo';
                            })()}
                          </span>
                        </div>
                      </div>
                      <div className="profile-actions">
                        <Link to="/dashboard" className="profile-action">
                          <span className="action-icon">📊</span>
                          Mi Dashboard
                        </Link>
                        <Link to="/perfil" className="profile-action">
                          <span className="action-icon">⚙️</span>
                          Mi Perfil
                        </Link>
                        <Link to="/mis-actividades" className="profile-action">
                          <span className="action-icon">🎯</span>
                          Mis Actividades
                        </Link>
                        <Link to="/permisos" className="profile-action">
                          <span className="action-icon">🔐</span>
                          Mis Permisos
                        </Link>
                        <hr className="profile-divider" />
                        <button onClick={handleLogout} className="profile-action logout">
                          <span className="action-icon">🚪</span>
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ) : (
              <li className="nav-buttons">
                <Link to="/login" className="btn-login">Iniciar Sesión</Link>
                <Link to="/registro" className="btn-primary">Inscribirse</Link>
              </li>
            )}
          </ul>
        </nav>

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
          {isAuthenticated && (
            <>
              {isAdmin && (
                <>
                  <li><Link to="/admin-panel" onClick={toggleMenu}><span className="nav-icon">🔧</span>Panel Admin</Link></li>
                </>
              )}
            </>
          )}
          {isAuthenticated ? (
            <li className="mobile-profile">
              <div className="mobile-profile-info">
                <div className="mobile-profile-avatar">
                  {user?.nombre_usuario?.charAt(0)?.toUpperCase() || '👤'}
                </div>
                <div className="mobile-profile-details">
                  <h4>{user?.nombre_usuario} {user?.apellido_usuario}</h4>
                  <p>{user?.email_usuario}</p>
                </div>
              </div>
              <div className="mobile-profile-actions">
                <Link to="/dashboard" className="mobile-profile-action" onClick={toggleMenu}>
                  <span className="action-icon">📊</span>
                  Mi Dashboard
                </Link>
                <Link to="/perfil" className="mobile-profile-action" onClick={toggleMenu}>
                  <span className="action-icon">⚙️</span>
                  Mi Perfil
                </Link>
                <Link to="/mis-actividades" className="mobile-profile-action" onClick={toggleMenu}>
                  <span className="action-icon">🎯</span>
                  Mis Actividades
                </Link>
                <Link to="/permisos" className="mobile-profile-action" onClick={toggleMenu}>
                  <span className="action-icon">🔐</span>
                  Mis Permisos
                </Link>
                <button onClick={handleLogout} className="mobile-profile-action logout">
                  <span className="action-icon">🚪</span>
                  Cerrar Sesión
                </button>
              </div>
            </li>
          ) : (
            <li className="mobile-actions">
              <Link to="/login" className="btn-login" onClick={toggleMenu}>Iniciar Sesión</Link>
              <Link to="/registro" className="btn-primary" onClick={toggleMenu}>Inscribirse</Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
