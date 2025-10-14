// =====================================================
// Rutas para diplomas
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { Router } from 'express';
import { DiplomaController } from '../controllers/diploma.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const diplomaController = new DiplomaController();

// =====================================================
// MIDDLEWARE DE AUTENTICACIÓN
// =====================================================

// No aplicar autenticación global, se aplica individualmente

// =====================================================
// RUTAS PARA RESULTADOS DE COMPETENCIAS
// =====================================================

/**
 * @route POST /api/diplomas/competitions/:id/resultados
 * @desc Registrar resultados de una competencia (primeros 3 lugares)
 * @access Private (gestionar_actividades)
 */
router.post(
  '/competitions/:id/resultados',
  authMiddleware.authenticateToken,
  diplomaController.registrarResultadosCompetencia.bind(diplomaController)
);

/**
 * @route GET /api/diplomas/competitions/:id/resultados
 * @desc Consultar resultados de una competencia
 * @access Private (gestionar_actividades)
 */
router.get(
  '/competitions/:id/resultados',
  authMiddleware.authenticateToken,
  diplomaController.consultarResultadosCompetencia.bind(diplomaController)
);

// =====================================================
// RUTAS PARA GENERACIÓN DE DIPLOMAS
// =====================================================

/**
 * @route POST /api/diplomas/activities/:id/generate
 * @desc Generar diplomas para una actividad específica
 * @access Private (gestionar_actividades)
 */
router.post(
  '/activities/:id/generate',
  authMiddleware.authenticateToken,
  diplomaController.generarDiplomasActividad.bind(diplomaController)
);

/**
 * @route POST /api/diplomas/congreso/generate
 * @desc Generar diplomas del congreso general
 * @access Private (gestionar_actividades)
 */
router.post(
  '/congreso/generate',
  authMiddleware.authenticateToken,
  diplomaController.generarDiplomasCongreso.bind(diplomaController)
);

// =====================================================
// RUTAS PARA CONSULTAS DE DIPLOMAS
// =====================================================

/**
 * @route GET /api/diplomas
 * @desc Consultar diplomas con filtros opcionales
 * @access Private (gestionar_actividades)
 * @query id_usuario, id_actividad, tipo_diploma, fecha_desde, fecha_hasta, solo_no_enviados, limite, offset
 */
router.get(
  '/',
  authMiddleware.authenticateToken,
  diplomaController.consultarDiplomas.bind(diplomaController)
);

/**
 * @route GET /api/diplomas/stats
 * @desc Obtener estadísticas de diplomas
 * @access Private (gestionar_actividades)
 */
router.get(
  '/stats',
  authMiddleware.authenticateToken,
  diplomaController.obtenerEstadisticasDiplomas.bind(diplomaController)
);

/**
 * @route GET /api/diplomas/templates
 * @desc Obtener plantillas de diplomas disponibles
 * @access Private (gestionar_actividades)
 */
router.get(
  '/templates',
  authMiddleware.authenticateToken,
  diplomaController.obtenerPlantillasDisponibles.bind(diplomaController)
);

// =====================================================
// RUTAS PARA GESTIÓN DE DIPLOMAS
// =====================================================

/**
 * @route PUT /api/diplomas/:usuarioId/:actividadId/:tipoDiploma
 * @desc Actualizar información de un diploma
 * @access Private (gestionar_actividades)
 */
router.put(
  '/:usuarioId/:actividadId/:tipoDiploma',
  authMiddleware.authenticateToken,
  diplomaController.actualizarDiploma.bind(diplomaController)
);

/**
 * @route PATCH /api/diplomas/:usuarioId/:actividadId/:tipoDiploma/download
 * @desc Marcar diploma como descargado
 * @access Private (gestionar_actividades)
 */
router.patch(
  '/:usuarioId/:actividadId/:tipoDiploma/download',
  authMiddleware.authenticateToken,
  diplomaController.marcarDiplomaDescargado.bind(diplomaController)
);

/**
 * @route POST /api/diplomas/:usuarioId/:actividadId/:tipoDiploma/resend
 * @desc Reenviar diploma por correo electrónico
 * @access Private (gestionar_actividades)
 */
router.post(
  '/:usuarioId/:actividadId/:tipoDiploma/resend',
  authMiddleware.authenticateToken,
  diplomaController.reenviarDiplomaPorCorreo.bind(diplomaController)
);

// =====================================================
// RUTAS ADICIONALES
// =====================================================

/**
 * @route GET /api/diplomas/user/:userId
 * @desc Obtener diplomas de un usuario específico
 * @access Private (gestionar_actividades)
 */
router.get(
  '/user/:userId',
  authMiddleware.authenticateToken,
  diplomaController.obtenerDiplomasUsuario.bind(diplomaController)
);

/**
 * @route GET /api/diplomas/activity/:activityId
 * @desc Obtener diplomas de una actividad específica
 * @access Private (gestionar_actividades)
 */
router.get(
  '/activity/:activityId',
  authMiddleware.authenticateToken,
  diplomaController.obtenerDiplomasActividad.bind(diplomaController)
);

// =====================================================
// RUTAS ESPECIALES PARA DIPLOMAS DEL CONGRESO
// =====================================================

/**
 * @route PUT /api/diplomas/congreso/:usuarioId
 * @desc Actualizar diploma del congreso general
 * @access Private (gestionar_actividades)
 */
router.put(
  '/congreso/:usuarioId',
  authMiddleware.authenticateToken,
  diplomaController.actualizarDiploma.bind(diplomaController)
);

/**
 * @route PATCH /api/diplomas/congreso/:usuarioId/download
 * @desc Marcar diploma del congreso como descargado
 * @access Private (gestionar_actividades)
 */
router.patch(
  '/congreso/:usuarioId/download',
  authMiddleware.authenticateToken,
  diplomaController.marcarDiplomaDescargado.bind(diplomaController)
);

/**
 * @route POST /api/diplomas/congreso/:usuarioId/resend
 * @desc Reenviar diploma del congreso por correo electrónico
 * @access Private (gestionar_actividades)
 */
router.post(
  '/congreso/:usuarioId/resend',
  authMiddleware.authenticateToken,
  diplomaController.reenviarDiplomaPorCorreo.bind(diplomaController)
);

export default router;
