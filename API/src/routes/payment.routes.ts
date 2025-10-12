// =====================================================
// Rutas de Pagos
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';

const router = Router();
const paymentController = new PaymentController();

/**
 * @route POST /api/payments/process
 * @desc Procesar un pago para una actividad
 * @access Private
 */
router.post('/process', 
  authMiddleware.authenticateToken,
  validationMiddleware.validatePaymentRequest,
  paymentController.processPayment
);

/**
 * @route GET /api/payments/user
 * @desc Obtener historial de pagos del usuario autenticado
 * @access Private
 */
router.get('/user', 
  authMiddleware.authenticateToken,
  paymentController.getUserPayments
);

/**
 * @route GET /api/payments/:id_pago
 * @desc Obtener detalles de un pago específico
 * @access Private
 */
router.get('/:id_pago', 
  authMiddleware.authenticateToken,
  paymentController.getPaymentDetails
);

/**
 * @route GET /api/payments/check/:id_actividad
 * @desc Verificar si el usuario ha pagado por una actividad
 * @access Private
 */
router.get('/check/:id_actividad', 
  authMiddleware.authenticateToken,
  paymentController.checkPaymentStatus
);

export default router;
