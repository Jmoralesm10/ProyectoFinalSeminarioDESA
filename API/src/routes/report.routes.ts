// =====================================================
// Rutas de Reportes
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const reportController = new ReportController();

// =====================================================
// MIDDLEWARE DE AUTENTICACIÓN Y AUTORIZACIÓN
// =====================================================

// Todos los endpoints de reportes requieren autenticación
router.use(authMiddleware.authenticateToken);

// =====================================================
// REPORTES DE ASISTENCIA
// =====================================================

/**
 * GET /api/reports/attendance/general
 * Genera reporte de asistencia general al congreso
 * Requiere permiso: ver_reportes
 */
router.get(
  '/attendance/general',
  authMiddleware.requirePermission('ver_reportes'),
  reportController.generateGeneralAttendanceReport.bind(reportController)
);

/**
 * GET /api/reports/attendance/activities
 * Genera reporte de asistencia a actividades específicas
 * Requiere permiso: ver_reportes
 */
router.get(
  '/attendance/activities',
  authMiddleware.requirePermission('ver_reportes'),
  reportController.generateActivityAttendanceReport.bind(reportController)
);

/**
 * GET /api/reports/attendance/complete
 * Genera reporte completo de asistencia (general + actividades)
 * Requiere permiso: ver_reportes
 */
router.get(
  '/attendance/complete',
  authMiddleware.requirePermission('ver_reportes'),
  reportController.generateCompleteAttendanceReport.bind(reportController)
);

// =====================================================
// ESTADÍSTICAS DEL SISTEMA
// =====================================================

/**
 * GET /api/reports/statistics/complete
 * Obtiene estadísticas completas del sistema
 * Requiere permiso: ver_estadisticas
 */
router.get(
  '/statistics/complete',
  authMiddleware.requirePermission('ver_estadisticas'),
  reportController.getCompleteStatistics.bind(reportController)
);

/**
 * GET /api/reports/statistics/users
 * Obtiene estadísticas de usuarios
 * Requiere permiso: ver_estadisticas
 */
router.get(
  '/statistics/users',
  authMiddleware.requirePermission('ver_estadisticas'),
  reportController.getUserStatistics.bind(reportController)
);

/**
 * GET /api/reports/statistics/activities
 * Obtiene estadísticas de actividades
 * Requiere permiso: ver_estadisticas
 */
router.get(
  '/statistics/activities',
  authMiddleware.requirePermission('ver_estadisticas'),
  reportController.getActivityStatistics.bind(reportController)
);

/**
 * GET /api/reports/statistics/attendance
 * Obtiene estadísticas de asistencias
 * Requiere permiso: ver_estadisticas
 */
router.get(
  '/statistics/attendance',
  authMiddleware.requirePermission('ver_estadisticas'),
  reportController.getAttendanceStatistics.bind(reportController)
);

/**
 * GET /api/reports/statistics/admins
 * Obtiene estadísticas de administradores
 * Requiere permiso: ver_estadisticas
 */
router.get(
  '/statistics/admins',
  authMiddleware.requirePermission('ver_estadisticas'),
  reportController.getAdminStatistics.bind(reportController)
);

// =====================================================
// REPORTES DE INSCRIPCIONES
// =====================================================

/**
 * GET /api/reports/registrations
 * Obtiene reporte de inscripciones con filtros
 * Requiere permiso: ver_reportes
 */
router.get(
  '/registrations',
  authMiddleware.requirePermission('ver_reportes'),
  reportController.getRegistrationReport.bind(reportController)
);

/**
 * GET /api/reports/registrations/activity/:id
 * Obtiene reporte de inscripciones por actividad específica
 * Requiere permiso: ver_reportes
 */
router.get(
  '/registrations/activity/:id',
  authMiddleware.requirePermission('ver_reportes'),
  reportController.getRegistrationReportByActivity.bind(reportController)
);

/**
 * GET /api/reports/registrations/confirmed
 * Obtiene reporte de inscripciones confirmadas
 * Requiere permiso: ver_reportes
 */
router.get(
  '/registrations/confirmed',
  authMiddleware.requirePermission('ver_reportes'),
  reportController.getConfirmedRegistrationsReport.bind(reportController)
);

// =====================================================
// REPORTES DE ACTIVIDADES
// =====================================================

/**
 * GET /api/reports/activities
 * Obtiene reporte de actividades con estadísticas de asistencia
 * Requiere permiso: ver_reportes
 */
router.get(
  '/activities',
  authMiddleware.requirePermission('ver_reportes'),
  reportController.getActivityReport.bind(reportController)
);

// =====================================================
// REPORTES POR COLEGIO
// =====================================================

/**
 * GET /api/reports/schools
 * Obtiene reporte de usuarios agrupados por colegio
 * Requiere permiso: ver_reportes
 */
router.get(
  '/schools',
  authMiddleware.requirePermission('ver_reportes'),
  reportController.getSchoolReport.bind(reportController)
);

// =====================================================
// REPORTES DE USUARIOS MÁS ACTIVOS
// =====================================================

/**
 * GET /api/reports/users/most-active
 * Obtiene reporte de usuarios con mayor participación
 * Requiere permiso: ver_reportes
 */
router.get(
  '/users/most-active',
  authMiddleware.requirePermission('ver_reportes'),
  reportController.getMostActiveUsersReport.bind(reportController)
);

// =====================================================
// REPORTES DE DIPLOMAS
// =====================================================

/**
 * GET /api/reports/diplomas
 * Obtiene reporte de diplomas generados
 * Requiere permiso: ver_reportes
 */
router.get(
  '/diplomas',
  authMiddleware.requirePermission('ver_reportes'),
  reportController.getDiplomaReport.bind(reportController)
);

// =====================================================
// REPORTES DE RESULTADOS DE COMPETENCIAS
// =====================================================

/**
 * GET /api/reports/competitions/results
 * Obtiene reporte de resultados de competencias
 * Requiere permiso: ver_reportes
 */
router.get(
  '/competitions/results',
  authMiddleware.requirePermission('ver_reportes'),
  reportController.getCompetitionResultsReport.bind(reportController)
);

export default router;
