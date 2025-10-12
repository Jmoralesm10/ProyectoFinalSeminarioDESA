import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import './EnrollmentModal.css';

const EnrollmentModal = ({ 
  activity, 
  isOpen, 
  onClose, 
  onConfirm, 
  user 
}) => {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('tarjeta');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !activity) {
    return null;
  }

  const costoActividad = parseFloat(activity.costo_actividad) || 0;
  const hasCost = costoActividad > 0;
  const costFormatted = hasCost 
    ? `${activity.moneda_costo || 'GTQ'} ${costoActividad.toFixed(2)}`
    : 'Gratis';

  const handleConfirm = () => {
    if (hasCost) {
      setShowPayment(true);
    } else {
      // Inscripción directa para actividades gratuitas
      onConfirm();
    }
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      alert('Por favor selecciona un método de pago');
      return;
    }

    setIsProcessing(true);

    try {
      // Preparar datos del pago
      const paymentData = {
        id_actividad: activity.id_actividad,
        metodo_pago: paymentMethod,
        detalles_pago: paymentMethod === 'tarjeta' ? {
          numero_tarjeta: cardDetails.number.replace(/\s/g, ''),
          fecha_vencimiento: cardDetails.expiry,
          cvv: cardDetails.cvv,
          nombre_tarjeta: cardDetails.name
        } : {
          email_paypal: 'usuario@paypal.com' // En un caso real, esto vendría del formulario
        }
      };

      // Obtener token de autenticación
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Enviar pago a la API
      const response = await fetch('http://localhost:3001/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();

              if (result.success) {
                alert(`¡Pago exitoso! Referencia: ${result.data.referencia_pago}`);
                
                // Confirmar inscripción después del pago exitoso
                onConfirm();
                onClose();
              } else {
                alert(`Error en el pago: ${result.message}`);
              }
    } catch (error) {
      console.error('Error en el pago:', error);
      alert('Error al procesar el pago. Inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return createPortal(
    <div className="enrollment-modal-overlay" onClick={onClose}>
      <div className="enrollment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="enrollment-modal-header">
          <h2>Confirmar Inscripción</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="enrollment-modal-content">
          {!showPayment ? (
            // Vista de confirmación
            <>
              <div className="activity-info">
                <h3>{activity.nombre_actividad}</h3>
                <div className="activity-details">
                  <div className="detail-row">
                    <span className="label">Tipo:</span>
                    <span className="value">{activity.tipo_actividad}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Fecha:</span>
                    <span className="value">{formatDate(activity.fecha_inicio_actividad)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Lugar:</span>
                    <span className="value">{activity.lugar_actividad}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Ponente:</span>
                    <span className="value">{activity.ponente_actividad}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Duración:</span>
                    <span className="value">{activity.duracion_estimada_minutos} minutos</span>
                  </div>
                  <div className="detail-row cost">
                    <span className="label">Costo:</span>
                    <span className="value">{costFormatted}</span>
                  </div>
                </div>
              </div>

              {activity.requisitos_actividad && (
                <div className="requirements">
                  <h4>Requisitos:</h4>
                  <p>{activity.requisitos_actividad}</p>
                </div>
              )}

              {activity.materiales_requeridos && (
                <div className="materials">
                  <h4>Materiales Requeridos:</h4>
                  <p>{activity.materiales_requeridos}</p>
                </div>
              )}

              <div className="user-info">
                <h4>Datos del Participante:</h4>
                <p><strong>Nombre:</strong> {user?.nombre_usuario} {user?.apellido_usuario}</p>
                <p><strong>Email:</strong> {user?.email_usuario}</p>
                <p><strong>Tipo:</strong> {user?.tipo_usuario?.nombre_tipo_usuario || user?.tipo_usuario || 'No especificado'}</p>
              </div>
            </>
          ) : (
            // Vista de pago
            <div className="payment-section">
              <h3>Procesar Pago</h3>
              <div className="payment-summary">
                <div className="payment-item">
                  <span>{activity.nombre_actividad}</span>
                  <span>{costFormatted}</span>
                </div>
                <div className="payment-total">
                  <span>Total a pagar:</span>
                  <span>{costFormatted}</span>
                </div>
              </div>

              <div className="payment-methods">
                <h4>Método de Pago:</h4>
                <div className="payment-options">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="tarjeta"
                      checked={paymentMethod === 'tarjeta'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>💳 Tarjeta de Crédito/Débito</span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === 'paymentMethod' === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>🅿️ PayPal</span>
                  </label>
                </div>
              </div>

              {paymentMethod === 'tarjeta' && (
                <div className="card-details">
                  <h4>Datos de la Tarjeta:</h4>
                  <div className="card-form">
                    <input
                      type="text"
                      placeholder="Número de tarjeta"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                    />
                    <div className="card-row">
                      <input
                        type="text"
                        placeholder="MM/AA"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Nombre en la tarjeta"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="payment-note">
                <p>🔒 <strong>Modo de Prueba:</strong> Este es un sistema de pago simulado. No se procesarán cargos reales.</p>
              </div>
            </div>
          )}
        </div>

        <div className="enrollment-modal-footer">
          {!showPayment ? (
            <>
              <button className="btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleConfirm}>
                {hasCost ? 'Proceder al Pago' : 'Confirmar Inscripción'}
              </button>
            </>
          ) : (
            <>
              <button className="btn-secondary" onClick={() => setShowPayment(false)}>
                Regresar
              </button>
              <button 
                className="btn-primary" 
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? 'Procesando...' : 'Pagar e Inscribirse'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EnrollmentModal;
