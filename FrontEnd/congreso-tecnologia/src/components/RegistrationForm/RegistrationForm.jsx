import React, { useState } from 'react';
import { API_URLS } from '../../config/api';
import './RegistrationForm.css';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    tipo_usuario: 'externo',
    nombre_usuario: '',
    apellido_usuario: '',
    email_usuario: '',
    password: '',
    confirmPassword: '',
    telefono_usuario: '',
    colegio_usuario: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Validación de email de UMG para usuarios internos
  const isValidUMGEmail = (email) => {
    return email.endsWith('@miumg.edu.gt');
  };

  // Validación de email para usuarios externos
  const isValidExternalEmail = (email) => {
    return email.endsWith('.edu.gt');
  };

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.nombre_usuario.trim()) {
      newErrors.nombre_usuario = 'El nombre es requerido';
    } else if (formData.nombre_usuario.trim().length < 2) {
      newErrors.nombre_usuario = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar apellido
    if (!formData.apellido_usuario.trim()) {
      newErrors.apellido_usuario = 'El apellido es requerido';
    } else if (formData.apellido_usuario.trim().length < 2) {
      newErrors.apellido_usuario = 'El apellido debe tener al menos 2 caracteres';
    }

    // Validar email
    if (!formData.email_usuario.trim()) {
      newErrors.email_usuario = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_usuario)) {
      newErrors.email_usuario = 'El formato del email no es válido';
    } else if (formData.tipo_usuario === 'interno' && !isValidUMGEmail(formData.email_usuario)) {
      newErrors.email_usuario = 'Para usuarios internos, debe usar un email de UMG (@miumg.edu.gt)';
    } else if (formData.tipo_usuario === 'externo' && !isValidExternalEmail(formData.email_usuario)) {
      newErrors.email_usuario = 'Para usuarios externos, debe usar un email educativo (.edu.gt)';
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Debe confirmar la contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validar teléfono
    if (formData.telefono_usuario && !/^[0-9+\-\s()]+$/.test(formData.telefono_usuario)) {
      newErrors.telefono_usuario = 'El formato del teléfono no es válido';
    }

    // Validar colegio (solo para usuarios externos)
    if (formData.tipo_usuario === 'externo' && !formData.colegio_usuario.trim()) {
      newErrors.colegio_usuario = 'El colegio es requerido para estudiantes externos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
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

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Preparar datos para enviar (sin confirmPassword)
      const { confirmPassword, ...dataToSend } = formData;
      
      const response = await fetch(API_URLS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitMessage('¡Registro exitoso! Se ha enviado un correo de confirmación a tu email.');
        // Limpiar formulario
        setFormData({
          tipo_usuario: 'externo',
          nombre_usuario: '',
          apellido_usuario: '',
          email_usuario: '',
          password: '',
          confirmPassword: '',
          telefono_usuario: '',
          colegio_usuario: ''
        });
      } else {
        // Manejar errores de validación de la API
        if (result.errors && Array.isArray(result.errors)) {
          const apiErrors = {};
          result.errors.forEach(error => {
            apiErrors[error.field] = error.message;
          });
          setErrors(apiErrors);
          setSubmitMessage('Por favor, corrige los errores en el formulario.');
        } else {
          setSubmitMessage(result.message || 'Error al registrar usuario');
        }
      }
    } catch (error) {
      setSubmitMessage('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="registration-form-container">
      <div className="registration-form-card">
        <div className="registration-form-header">
          <h2>Registro al Congreso de Tecnología 2025</h2>
          <p>Únete al evento más importante de tecnología del año</p>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          {/* Tipo de Usuario */}
          <div className="form-group">
            <label htmlFor="tipo_usuario" className="form-label">
              Tipo de Usuario *
            </label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="tipo_usuario"
                  value="externo"
                  checked={formData.tipo_usuario === 'externo'}
                  onChange={handleInputChange}
                />
                <span className="radio-custom"></span>
                <div className="radio-content">
                  <strong>Estudiante Externo</strong>
                  <small>Estudiantes de nivel medio de colegios externos</small>
                </div>
              </label>
              
              <label className="radio-option">
                <input
                  type="radio"
                  name="tipo_usuario"
                  value="interno"
                  checked={formData.tipo_usuario === 'interno'}
                  onChange={handleInputChange}
                />
                <span className="radio-custom"></span>
                <div className="radio-content">
                  <strong>Estudiante Interno</strong>
                  <small>Alumnos de la facultad de ingeniería en sistemas</small>
                </div>
              </label>
            </div>
          </div>

          {/* Nombre y Apellido */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre_usuario" className="form-label">
                Nombre *
              </label>
              <input
                type="text"
                id="nombre_usuario"
                name="nombre_usuario"
                value={formData.nombre_usuario}
                onChange={handleInputChange}
                className={`form-input ${errors.nombre_usuario ? 'error' : ''}`}
                placeholder="Ingresa tu nombre"
              />
              {errors.nombre_usuario && (
                <span className="error-message">{errors.nombre_usuario}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="apellido_usuario" className="form-label">
                Apellido *
              </label>
              <input
                type="text"
                id="apellido_usuario"
                name="apellido_usuario"
                value={formData.apellido_usuario}
                onChange={handleInputChange}
                className={`form-input ${errors.apellido_usuario ? 'error' : ''}`}
                placeholder="Ingresa tu apellido"
              />
              {errors.apellido_usuario && (
                <span className="error-message">{errors.apellido_usuario}</span>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email_usuario" className="form-label">
              Email *
            </label>
            <input
              type="email"
              id="email_usuario"
              name="email_usuario"
              value={formData.email_usuario}
              onChange={handleInputChange}
              className={`form-input ${errors.email_usuario ? 'error' : ''}`}
              placeholder={
                formData.tipo_usuario === 'interno' 
                  ? 'ejemplo@miumg.edu.gt' 
                  : 'ejemplo@universidad.edu.gt'
              }
            />
            {errors.email_usuario && (
              <span className="error-message">{errors.email_usuario}</span>
            )}
            {formData.tipo_usuario === 'interno' && (
              <small className="form-help">
                Debe ser un email de UMG (@miumg.edu.gt)
              </small>
            )}
            {formData.tipo_usuario === 'externo' && (
              <small className="form-help">
                Debe ser un email educativo (.edu.gt)
              </small>
            )}
          </div>

          {/* Teléfono */}
          <div className="form-group">
            <label htmlFor="telefono_usuario" className="form-label">
              Teléfono
            </label>
            <input
              type="tel"
              id="telefono_usuario"
              name="telefono_usuario"
              value={formData.telefono_usuario}
              onChange={handleInputChange}
              className={`form-input ${errors.telefono_usuario ? 'error' : ''}`}
              placeholder="+502 1234-5678"
            />
            {errors.telefono_usuario && (
              <span className="error-message">{errors.telefono_usuario}</span>
            )}
          </div>

          {/* Colegio (solo para externos) */}
          {formData.tipo_usuario === 'externo' && (
            <div className="form-group">
              <label htmlFor="colegio_usuario" className="form-label">
                Colegio *
              </label>
              <input
                type="text"
                id="colegio_usuario"
                name="colegio_usuario"
                value={formData.colegio_usuario}
                onChange={handleInputChange}
                className={`form-input ${errors.colegio_usuario ? 'error' : ''}`}
                placeholder="Nombre de tu colegio"
              />
              {errors.colegio_usuario && (
                <span className="error-message">{errors.colegio_usuario}</span>
              )}
            </div>
          )}

          {/* Contraseña */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Mínimo 8 caracteres"
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
            <small className="form-help">
              Debe contener al menos una mayúscula, una minúscula y un número
            </small>
          </div>

          {/* Confirmar Contraseña */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar Contraseña *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Repite tu contraseña"
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Mensaje de envío */}
          {submitMessage && (
            <div className={`submit-message ${submitMessage.includes('exitoso') ? 'success' : 'error'}`}>
              {submitMessage}
            </div>
          )}

          {/* Botón de envío */}
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className="registration-form-footer">
          <p>
            ¿Ya tienes una cuenta? 
            <a href="#login" className="login-link"> Iniciar Sesión</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
