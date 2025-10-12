// =====================================================
// Rutas de Usuarios
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';

const router = Router();
const userController = new UserController();

// =====================================================
// RUTAS PÚBLICAS (No requieren autenticación)
// =====================================================

/**
 * @route   POST /api/users/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post(
  '/register',
  validationMiddleware.validateRegister,
  userController.register
);

/**
 * @route   POST /api/users/login
 * @desc    Autenticar usuario
 * @access  Public
 */
router.post(
  '/login',
  validationMiddleware.validateLogin,
  userController.login
);

/**
 * @route   POST /api/users/verify-email
 * @desc    Verificar email del usuario
 * @access  Public
 */
router.post(
  '/verify-email',
  validationMiddleware.validateVerifyEmail,
  userController.verifyEmail
);

/**
 * @route   POST /api/users/forgot-password
 * @desc    Solicitar recuperación de contraseña
 * @access  Public
 */
router.post(
  '/forgot-password',
  validationMiddleware.validateForgotPassword,
  userController.forgotPassword
);

/**
 * @route   POST /api/users/reset-password
 * @desc    Resetear contraseña con token
 * @access  Public
 */
router.post(
  '/reset-password',
  validationMiddleware.validateResetPassword,
  userController.resetPassword
);

/**
 * @route   GET /api/users/types
 * @desc    Obtener tipos de usuario disponibles
 * @access  Public
 */
router.get('/types', userController.getUserTypes);

/**
 * @route   POST /api/users/send-confirmation
 * @desc    Enviar correo de confirmación a un usuario
 * @access  Public
 */
router.post('/send-confirmation', userController.sendConfirmationEmail);

// =====================================================
// RUTAS PROTEGIDAS (Requieren autenticación)
// =====================================================

/**
 * @route   GET /api/users/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 */
router.get(
  '/profile',
  authMiddleware.authenticateToken,
  authMiddleware.requireActiveUser,
  userController.getProfile
);

/**
 * @route   PUT /api/users/profile
 * @desc    Actualizar perfil del usuario autenticado
 * @access  Private
 */
router.put(
  '/profile',
  authMiddleware.authenticateToken,
  authMiddleware.requireActiveUser,
  validationMiddleware.validateUpdateProfile,
  userController.updateProfile
);

/**
 * @route   PUT /api/users/change-password
 * @desc    Cambiar contraseña del usuario autenticado
 * @access  Private
 */
router.put(
  '/change-password',
  authMiddleware.authenticateToken,
  authMiddleware.requireActiveUser,
  validationMiddleware.validateChangePassword,
  userController.changePassword
);

// =====================================================
// RUTAS ADMINISTRATIVAS (Requieren roles específicos)
// =====================================================

/**
 * @route   GET /api/users/:id
 * @desc    Obtener perfil de usuario por ID (Solo administradores)
 * @access  Private (Admin)
 */
router.get(
  '/:id',
  authMiddleware.authenticateToken,
  authMiddleware.requireActiveUser,
  authMiddleware.requireRole(['admin', 'super_admin']),
  validationMiddleware.validateUUID('id'),
  userController.getProfile
);

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizar perfil de usuario por ID (Solo administradores)
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  authMiddleware.authenticateToken,
  authMiddleware.requireActiveUser,
  authMiddleware.requireRole(['admin', 'super_admin']),
  validationMiddleware.validateUUID('id'),
  validationMiddleware.validateUpdateProfile,
  userController.updateProfile
);

export default router;
