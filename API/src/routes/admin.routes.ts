// =====================================================
// Rutas de Administración
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const userController = new UserController();

// =====================================================
// RUTAS DE ADMINISTRACIÓN (Requieren permisos de admin)
// =====================================================

/**
 * @route   GET /api/admin/admins
 * @desc    Obtener lista de administradores
 * @access  Admin (ver_estadisticas)
 */
router.get('/admins', 
  authMiddleware.authenticateToken,
  authMiddleware.requirePermission('gestionar_usuarios'),
  userController.getAdmins.bind(userController)
);

/**
 * @route   GET /api/admin/permissions/:userId
 * @desc    Obtener permisos de un usuario
 * @access  Admin (gestionar_usuarios)
 */
router.get('/permissions/:userId',
  authMiddleware.authenticateToken,
  authMiddleware.requirePermission('gestionar_usuarios'),
  userController.getUserPermissions.bind(userController)
);

/**
 * @route   POST /api/admin/promote/:userId
 * @desc    Promover usuario a administrador
 * @access  Admin (gestionar_usuarios)
 */
router.post('/promote/:userId',
  authMiddleware.authenticateToken,
  authMiddleware.requirePermission('gestionar_usuarios'),
  userController.promoteToAdmin.bind(userController)
);

/**
 * @route   POST /api/admin/demote/:userId
 * @desc    Quitar permisos de administrador
 * @access  Admin (gestionar_usuarios)
 */
router.post('/demote/:userId',
  authMiddleware.authenticateToken,
  authMiddleware.requirePermission('gestionar_usuarios'),
  userController.demoteFromAdmin.bind(userController)
);

/**
 * @route   GET /api/admin/stats
 * @desc    Obtener estadísticas del sistema
 * @access  Admin (ver_estadisticas)
 */
router.get('/stats',
  authMiddleware.authenticateToken,
  authMiddleware.requirePermission('ver_estadisticas'),
  userController.getSystemStats.bind(userController)
);

export default router;