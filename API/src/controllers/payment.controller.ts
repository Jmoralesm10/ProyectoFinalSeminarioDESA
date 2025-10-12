// =====================================================
// Controlador de Pagos
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { ActivityService } from '../services/activity.service';

export class PaymentController {
  private paymentService: PaymentService;
  private activityService: ActivityService;

  constructor() {
    this.paymentService = new PaymentService();
    this.activityService = new ActivityService();
  }

  /**
   * Procesar pago para una actividad
   */
  processPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const id_usuario = (req as any).user?.id_usuario;

      if (!id_usuario) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const { 
        id_actividad, 
        metodo_pago, 
        detalles_pago 
      } = req.body;

      // Validar parámetros requeridos
      if (!id_actividad || !metodo_pago) {
        res.status(400).json({
          success: false,
          message: 'ID de actividad y método de pago son obligatorios'
        });
        return;
      }

      // Obtener información de la actividad
      const activityResponse = await this.activityService.getActivityById(id_actividad);
      
      if (!activityResponse.success || !activityResponse.data) {
        res.status(404).json({
          success: false,
          message: 'Actividad no encontrada'
        });
        return;
      }

      const activity = activityResponse.data;

      // Verificar si la actividad tiene costo
      if (activity.costo_actividad <= 0) {
        res.status(400).json({
          success: false,
          message: 'Esta actividad es gratuita, no requiere pago'
        });
        return;
      }

      // Verificar si el usuario ya pagó por esta actividad
      const hasPaid = await this.paymentService.hasUserPaidForActivity(id_usuario, id_actividad);
      
      if (hasPaid) {
        res.status(400).json({
          success: false,
          message: 'Ya has pagado por esta actividad'
        });
        return;
      }

      // Preparar datos del pago
      const paymentRequest = {
        id_usuario,
        id_actividad,
        monto: activity.costo_actividad,
        moneda: activity.moneda_costo || 'GTQ',
        metodo_pago: metodo_pago as 'tarjeta' | 'paypal' | 'transferencia',
        detalles_pago,
        ip_cliente: req.ip || '127.0.0.1',
        user_agent: req.get('User-Agent') || 'Unknown'
      };

      // Procesar el pago
      const paymentResult = await this.paymentService.processPayment(paymentRequest);

      if (paymentResult.success) {
        res.status(200).json({
          success: true,
          message: paymentResult.message,
          data: {
            id_pago: paymentResult.id_pago,
            referencia_pago: paymentResult.referencia_pago,
            estado_pago: paymentResult.estado_pago,
            fecha_pago: paymentResult.fecha_pago,
            monto: activity.costo_actividad,
            moneda: activity.moneda_costo
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: paymentResult.message
        });
      }

    } catch (error) {
      console.error('❌ Error en processPayment controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener historial de pagos del usuario
   */
  getUserPayments = async (req: Request, res: Response): Promise<void> => {
    try {
      const id_usuario = (req as any).user?.id_usuario;

      if (!id_usuario) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const payments = await this.paymentService.getUserPayments(id_usuario);

      res.status(200).json({
        success: true,
        data: payments
      });

    } catch (error) {
      console.error('❌ Error en getUserPayments controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener detalles de un pago específico
   */
  getPaymentDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id_pago } = req.params;
      const id_usuario = (req as any).user?.id_usuario;

      if (!id_usuario) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (!id_pago) {
        res.status(400).json({
          success: false,
          message: 'ID de pago es obligatorio'
        });
        return;
      }

      const payment = await this.paymentService.getPaymentDetails(id_pago);

      if (!payment) {
        res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
        return;
      }

      // Verificar que el pago pertenece al usuario
      if (payment.id_usuario !== id_usuario) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver este pago'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: payment
      });

    } catch (error) {
      console.error('❌ Error en getPaymentDetails controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Verificar si el usuario ha pagado por una actividad
   */
  checkPaymentStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id_actividad } = req.params;
      const id_usuario = (req as any).user?.id_usuario;

      if (!id_usuario) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (!id_actividad) {
        res.status(400).json({
          success: false,
          message: 'ID de actividad es obligatorio'
        });
        return;
      }

      const hasPaid = await this.paymentService.hasUserPaidForActivity(
        id_usuario, 
        parseInt(id_actividad)
      );

      res.status(200).json({
        success: true,
        data: {
          has_paid: hasPaid,
          id_usuario,
          id_actividad: parseInt(id_actividad)
        }
      });

    } catch (error) {
      console.error('❌ Error en checkPaymentStatus controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
}
