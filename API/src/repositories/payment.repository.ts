// =====================================================
// Repositorio de Pagos
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { executeStoredProcedure } from '../config/database';

export interface CreatePaymentData {
  id_usuario: string;
  id_actividad: number;
  monto_pago: number;
  moneda_pago: string;
  metodo_pago: string;
  detalles_pago: any;
  estado_pago: string;
}

export interface UpdatePaymentData {
  estado_pago?: string;
  referencia_pago?: string;
  fecha_confirmacion?: Date;
  observaciones_pago?: string;
}

export class PaymentRepository {
  /**
   * Crear un nuevo registro de pago
   */
  async createPayment(paymentData: CreatePaymentData): Promise<any> {
    try {
      const result = await executeStoredProcedure('sp_crear_pago_simulado', [
        paymentData.id_usuario,
        paymentData.id_actividad,
        paymentData.monto_pago,
        paymentData.moneda_pago,
        paymentData.metodo_pago,
        paymentData.detalles_pago,
        paymentData.estado_pago
      ]);
      return result[0];
    } catch (error) {
      console.error('❌ Error en createPayment:', error);
      throw new Error('Error al crear registro de pago');
    }
  }

  /**
   * Actualizar estado de un pago
   */
  async updatePaymentStatus(
    id_pago: string, 
    estado_pago: string, 
    referencia_pago?: string,
    observaciones?: string
  ): Promise<any> {
    try {
      const result = await executeStoredProcedure('sp_actualizar_estado_pago', [
        id_pago,
        estado_pago,
        referencia_pago,
        observaciones
      ]);

      return result[0];
    } catch (error) {
      console.error('❌ Error en updatePaymentStatus:', error);
      throw new Error('Error al actualizar estado del pago');
    }
  }

  /**
   * Obtener pago por ID
   */
  async getPaymentById(id_pago: string): Promise<any> {
    try {
      const result = await executeStoredProcedure('sp_consultar_pago_por_id', [
        id_pago
      ]);

      return result[0];
    } catch (error) {
      console.error('❌ Error en getPaymentById:', error);
      throw new Error('Error al obtener pago por ID');
    }
  }

  /**
   * Obtener pagos de un usuario
   */
  async getUserPayments(id_usuario: string): Promise<any[]> {
    try {
      const result = await executeStoredProcedure('sp_consultar_pagos_usuario', [
        id_usuario
      ]);

      return result;
    } catch (error) {
      console.error('❌ Error en getUserPayments:', error);
      throw new Error('Error al obtener pagos del usuario');
    }
  }

  /**
   * Obtener pago por usuario y actividad
   */
  async getPaymentByUserAndActivity(id_usuario: string, id_actividad: number): Promise<any> {
    try {
      const result = await executeStoredProcedure('sp_consultar_pago_usuario_actividad', [
        id_usuario,
        id_actividad
      ]);

      return result[0];
    } catch (error) {
      console.error('❌ Error en getPaymentByUserAndActivity:', error);
      throw new Error('Error al obtener pago por usuario y actividad');
    }
  }

  /**
   * Obtener estadísticas de pagos
   */
  async getPaymentStatistics(): Promise<any> {
    try {
      const result = await executeStoredProcedure('sp_estadisticas_pagos', []);

      return result[0];
    } catch (error) {
      console.error('❌ Error en getPaymentStatistics:', error);
      throw new Error('Error al obtener estadísticas de pagos');
    }
  }
}
