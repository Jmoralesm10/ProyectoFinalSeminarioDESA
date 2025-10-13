// =====================================================
// Servicio de Pagos Simulados
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentAttemptRepository } from '../repositories/payment-attempt.repository';

export interface PaymentRequest {
  id_usuario: string;
  id_actividad: number;
  monto: number;
  moneda: string;
  metodo_pago: 'tarjeta' | 'paypal' | 'transferencia';
  detalles_pago: {
    numero_tarjeta?: string;
    fecha_vencimiento?: string;
    cvv?: string;
    nombre_tarjeta?: string;
    email_paypal?: string;
  };
  ip_cliente?: string;
  user_agent?: string;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  id_pago?: string;
  referencia_pago?: string | undefined;
  estado_pago?: string;
  fecha_pago?: Date;
}

export interface PaymentAttempt {
  id_intento: string;
  id_pago: string;
  estado_intento: string;
  codigo_error?: string;
  mensaje_error?: string;
  fecha_intento: Date;
}

export class PaymentService {
  private paymentRepository: PaymentRepository;
  private paymentAttemptRepository: PaymentAttemptRepository;

  constructor() {
    this.paymentRepository = new PaymentRepository();
    this.paymentAttemptRepository = new PaymentAttemptRepository();
  }

  /**
   * Procesar un pago simulado
   */
  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('💳 Iniciando procesamiento de pago simulado:', {
        id_usuario: paymentRequest.id_usuario,
        id_actividad: paymentRequest.id_actividad,
        monto: paymentRequest.monto,
        metodo: paymentRequest.metodo_pago
      });

      // 1. Crear registro de pago
      const payment = await this.paymentRepository.createPayment({
        id_usuario: paymentRequest.id_usuario,
        id_actividad: paymentRequest.id_actividad,
        monto_pago: paymentRequest.monto,
        moneda_pago: paymentRequest.moneda,
        metodo_pago: paymentRequest.metodo_pago,
        detalles_pago: paymentRequest.detalles_pago,
        estado_pago: 'procesando'
      });

      // 2. Simular procesamiento del pago
      const paymentResult = await this.simulatePaymentProcessing(paymentRequest);

      // 3. Actualizar estado del pago
      const updatedPayment = await this.paymentRepository.updatePaymentStatus(
        payment.id_pago,
        paymentResult.success ? 'completado' : 'fallido',
        paymentResult.referencia_pago,
        paymentResult.mensaje_error
      );

      // 4. Registrar intento de pago
      await this.paymentAttemptRepository.createAttempt({
        id_pago: payment.id_pago,
        id_usuario: paymentRequest.id_usuario,
        id_actividad: paymentRequest.id_actividad,
        metodo_pago: paymentRequest.metodo_pago,
        monto_original: paymentRequest.monto,
        moneda_original: paymentRequest.moneda,
        estado_intento: paymentResult.success ? 'exitoso' : 'fallido',
        codigo_error: paymentResult.codigo_error,
        mensaje_error: paymentResult.mensaje_error,
        datos_entrada: paymentRequest.detalles_pago,
        respuesta_procesador: paymentResult,
        ip_cliente: paymentRequest.ip_cliente,
        user_agent: paymentRequest.user_agent
      });

      return {
        success: paymentResult.success,
        message: paymentResult.success 
          ? 'Pago procesado exitosamente' 
          : paymentResult.mensaje_error || 'Error al procesar el pago',
        id_pago: payment.id_pago,
        referencia_pago: paymentResult.referencia_pago,
        estado_pago: updatedPayment.estado_pago,
        fecha_pago: updatedPayment.fecha_pago
      };

    } catch (error) {
      console.error('❌ Error en processPayment:', error);
      return {
        success: false,
        message: 'Error interno del servidor al procesar el pago'
      };
    }
  }

  /**
   * Simular el procesamiento de un pago
   */
  private async simulatePaymentProcessing(paymentRequest: PaymentRequest): Promise<{
    success: boolean;
    referencia_pago?: string;
    mensaje_error?: string;
    codigo_error?: string;
  }> {
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simular diferentes escenarios de pago
    const random = Math.random();

    if (random < 0.05) { // 5% de fallos por tarjeta inválida
      return {
        success: false,
        mensaje_error: 'Tarjeta inválida o expirada',
        codigo_error: 'CARD_INVALID'
      };
    }

    if (random < 0.08) { // 3% de fallos por fondos insuficientes
      return {
        success: false,
        mensaje_error: 'Fondos insuficientes',
        codigo_error: 'INSUFFICIENT_FUNDS'
      };
    }

    if (random < 0.1) { // 2% de fallos por error de red
      return {
        success: false,
        mensaje_error: 'Error de conexión con el procesador de pagos',
        codigo_error: 'NETWORK_ERROR'
      };
    }

    // 90% de éxito
    const referencia_pago = this.generatePaymentReference(paymentRequest.metodo_pago);
    
    return {
      success: true,
      referencia_pago: referencia_pago
    };
  }

  /**
   * Generar referencia de pago única
   */
  private generatePaymentReference(metodo_pago: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const prefix = metodo_pago === 'tarjeta' ? 'CARD' : 
                   metodo_pago === 'paypal' ? 'PP' : 'TRF';
    
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Obtener historial de pagos de un usuario
   */
  async getUserPayments(id_usuario: string): Promise<any[]> {
    try {
      return await this.paymentRepository.getUserPayments(id_usuario);
    } catch (error) {
      console.error('❌ Error en getUserPayments:', error);
      throw new Error('Error al obtener historial de pagos');
    }
  }

  /**
   * Obtener detalles de un pago específico
   */
  async getPaymentDetails(id_pago: string): Promise<any> {
    try {
      return await this.paymentRepository.getPaymentById(id_pago);
    } catch (error) {
      console.error('❌ Error en getPaymentDetails:', error);
      throw new Error('Error al obtener detalles del pago');
    }
  }

  /**
   * Verificar si un usuario ya pagó por una actividad
   */
  async hasUserPaidForActivity(id_usuario: string, id_actividad: number): Promise<boolean> {
    try {
      const payment = await this.paymentRepository.getPaymentByUserAndActivity(
        id_usuario, 
        id_actividad
      );
      return payment && payment.estado_pago === 'completado';
    } catch (error) {
      console.error('❌ Error en hasUserPaidForActivity:', error);
      return false;
    }
  }
}
