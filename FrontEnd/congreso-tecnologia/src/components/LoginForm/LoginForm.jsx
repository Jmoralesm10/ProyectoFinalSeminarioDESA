// =====================================================
// Componente de Formulario de Login
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URLS } from '../../config/api';
import './LoginForm.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email_usuario: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    // Validar email
    if (!formData.email_usuario.trim()) {
      newErrors.email_usuario = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_usuario)) {
      newErrors.email_usuario = 'Formato de email inválido';
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      console.log('🔍 Datos que se envían:', formData);
      console.log('🔍 URL de la API:', API_URLS.LOGIN);
      
      const response = await fetch(API_URLS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('🔍 Status de la respuesta:', response.status);
      console.log('🔍 Headers de la respuesta:', response.headers);
      
      const result = await response.json();
      console.log('🔍 Respuesta del servidor:', result);

      if (response.ok) {
        // Login exitoso
        setSubmitMessage('¡Inicio de sesión exitoso!');
        
        // Guardar token en localStorage
        if (result.data && result.data.token) {
          localStorage.setItem('authToken', result.data.token);
          localStorage.setItem('userData', JSON.stringify(result.data.user));
        }
        
        // Redirigir a la página principal
        setTimeout(() => {
          navigate('/');
        }, 1500);
        
      } else {
        // Error en el login
        if (result.errors && Array.isArray(result.errors)) {
          const apiErrors = {};
          result.errors.forEach(error => {
            apiErrors[error.field] = error.message;
          });
          setErrors(apiErrors);
          setSubmitMessage('Por favor, corrige los errores en el formulario.');
        } else {
          setSubmitMessage(result.message || 'Error al iniciar sesión');
        }
      }
    } catch (error) {
      setSubmitMessage('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-form-container">
      <div className="login-form-card">
        <div className="login-form-header">
          <div className="header-actions">
            <Link to="/" className="back-button">
              ← Volver al Inicio
            </Link>
          </div>
          <h2>Iniciar Sesión</h2>
          <p>Accede a tu cuenta del Congreso de Tecnología 2025</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Campo Email */}
          <div className="form-group">
            <label htmlFor="email_usuario" className="form-label">
              <span className="label-icon">📧</span>
              Email
            </label>
            <input
              type="email"
              id="email_usuario"
              name="email_usuario"
              value={formData.email_usuario}
              onChange={handleChange}
              className={`form-input ${errors.email_usuario ? 'error' : ''}`}
              placeholder="tu.email@ejemplo.com"
              disabled={isSubmitting}
            />
            {errors.email_usuario && (
              <span className="error-message">{errors.email_usuario}</span>
            )}
          </div>

          {/* Campo Contraseña */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <span className="label-icon">🔒</span>
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Tu contraseña"
              disabled={isSubmitting}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {/* Opciones adicionales */}
          <div className="form-options">
            <label className="checkbox-container">
              <input type="checkbox" />
              <span className="checkmark"></span>
              Recordarme
            </label>
            <Link to="/forgot-password" className="forgot-password-link">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            className={`submit-button ${isSubmitting ? 'loading' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Iniciando sesión...
              </>
            ) : (
              <>
                <span className="button-icon">🚀</span>
                Iniciar Sesión
              </>
            )}
          </button>

          {/* Mensaje de resultado */}
          {submitMessage && (
            <div className={`submit-message ${submitMessage.includes('exitoso') ? 'success' : 'error'}`}>
              {submitMessage}
            </div>
          )}
        </form>

        <div className="login-form-footer">
          <p>
            ¿No tienes una cuenta? 
            <Link to="/registro" className="register-link"> Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
