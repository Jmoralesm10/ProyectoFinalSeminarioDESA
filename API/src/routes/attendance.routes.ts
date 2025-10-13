// =====================================================
// Rutas de asistencia
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const attendanceController = new AttendanceController();

// =====================================================
// RUTAS PÚBLICAS (para escáner QR)
// =====================================================

/**
 * POST /api/attendance/general
 * Registra la asistencia general de un usuario al congreso
 * Acceso: Público (para escáner QR)
 */
router.post('/general', attendanceController.registerGeneralAttendance.bind(attendanceController));

/**
 * POST /api/attendance/activity
 * Registra la asistencia de un usuario a una actividad específica
 * Acceso: Público (para escáner QR)
 */
router.post('/activity', attendanceController.registerActivityAttendance.bind(attendanceController));

/**
 * GET /api/attendance/check/general
 * Verifica si un usuario ya asistió al congreso hoy
 * Acceso: Público (para escáner QR)
 */
router.get('/check/general', attendanceController.checkTodayGeneralAttendance.bind(attendanceController));

/**
 * GET /api/attendance/check/activity
 * Verifica si un usuario ya asistió a una actividad específica
 * Acceso: Público (para escáner QR)
 */
router.get('/check/activity', attendanceController.checkActivityAttendance.bind(attendanceController));

// =====================================================
// RUTAS PROTEGIDAS (requieren autenticación)
// =====================================================

/**
 * GET /api/attendance/user
 * Consulta el historial de asistencia de un usuario
 * Acceso: Autenticado
 */
router.get('/user', authMiddleware.authenticateToken, attendanceController.getUserAttendance.bind(attendanceController));

/**
 * GET /api/attendance/stats
 * Obtiene estadísticas de asistencia
 * Acceso: Autenticado con permisos de administrador
 */
router.get('/stats', 
  authMiddleware.authenticateToken, 
  authMiddleware.requirePermission('ver_estadisticas'), 
  attendanceController.getAttendanceStats.bind(attendanceController)
);

/**
 * GET /api/attendance/summary/today
 * Obtiene resumen de asistencia para el día actual
 * Acceso: Autenticado con permisos de administrador
 */
router.get('/summary/today', 
  authMiddleware.authenticateToken, 
  authMiddleware.requirePermission('gestionar_asistencia'), 
  attendanceController.getTodayAttendanceSummary.bind(attendanceController)
);

export default router;
