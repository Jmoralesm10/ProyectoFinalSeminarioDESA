// =====================================================
// Repositorio de Intentos de Pago
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { executeStoredProcedure } from '../config/database';

export interface CreateAttemptData {
  id_pago: string;
  id_usuario: string;
  id_actividad: number;
  metodo_pago: string;
  monto_original: number;
  moneda_original: string;
  estado_intento: string;
  codigo_error?: string | undefined;
  mensaje_error?: string | undefined;
  datos_entrada?: any;
  respuesta_procesador?: any;
  ip_cliente?: string | undefined;
  user_agent?: string | undefined;
}

export class PaymentAttemptRepository {
  /**
   * Crear un nuevo intento de pago
   */
  async createAttempt(attemptData: CreateAttemptData): Promise<any> {
    try {
      const result = await executeStoredProcedure('sp_crear_intento_pago', [
        attemptData.id_pago,
        attemptData.id_usuario,
        attemptData.id_actividad,
        attemptData.metodo_pago,
        attemptData.monto_original,
        attemptData.moneda_original,
        attemptData.estado_intento,
        attemptData.codigo_error,
        attemptData.mensaje_error,
        attemptData.datos_entrada,
        attemptData.respuesta_procesador,
        attemptData.ip_cliente,
        attemptData.user_agent
      ]);

      return result[0];
    } catch (error) {
      console.error('❌ Error en createAttempt:', error);
      throw new Error('Error al crear intento de pago');
    }
  }

  /**
   * Obtener intentos de pago por ID de pago
   */
  async getAttemptsByPaymentId(id_pago: string): Promise<any[]> {
    try {
      const result = await executeStoredProcedure('sp_consultar_intentos_por_pago', [
        id_pago
      ]);

      return result;
    } catch (error) {
      console.error('❌ Error en getAttemptsByPaymentId:', error);
      throw new Error('Error al obtener intentos de pago');
    }
  }

  /**
   * Obtener intentos de pago de un usuario
   */
  async getUserAttempts(id_usuario: string): Promise<any[]> {
    try {
      const result = await executeStoredProcedure('sp_consultar_intentos_usuario', [
        id_usuario
      ]);

      return result;
    } catch (error) {
      console.error('❌ Error en getUserAttempts:', error);
      throw new Error('Error al obtener intentos del usuario');
    }
  }

  /**
   * Obtener estadísticas de intentos de pago
   */
  async getAttemptStatistics(): Promise<any> {
    try {
      const result = await executeStoredProcedure('sp_estadisticas_intentos_pago', []);

      return result[0];
    } catch (error) {
      console.error('❌ Error en getAttemptStatistics:', error);
      throw new Error('Error al obtener estadísticas de intentos');
    }
  }
}
