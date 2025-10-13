// =====================================================
// Rutas de Actividades
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import express from 'express';
import { ActivityController } from '../controllers/activity.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();
const activityController = new ActivityController();

/**
 * @route   GET /api/activities
 * @desc    Listar actividades con filtros opcionales
 * @access  Public
 * @query   tipo_actividad, id_categoria, solo_disponibles, solo_activas, limite, offset
 */
router.get('/', activityController.listActivities);

/**
 * @route   GET /api/activities/categories
 * @desc    Obtener categorías de actividades
 * @access  Public
 */
router.get('/categories', activityController.getActivityCategories);

/**
 * @route   GET /api/activities/:id
 * @desc    Obtener actividad por ID
 * @access  Public
 */
router.get('/:id', activityController.getActivityById);

/**
 * @route   POST /api/activities
 * @desc    Crear nueva actividad
 * @access  Private (Solo administradores)
 */
router.post('/', authMiddleware.authenticateToken, activityController.createActivity);

/**
 * @route   PUT /api/activities/:id
 * @desc    Actualizar actividad
 * @access  Private (Solo administradores)
 */
router.put('/:id', authMiddleware.authenticateToken, activityController.updateActivity);

/**
 * @route   POST /api/activities/:id/inscribe
 * @desc    Inscribir usuario autenticado en actividad
 * @access  Private
 */
router.post('/:id/inscribe', authMiddleware.authenticateToken, activityController.inscribeUserToActivity);

/**
 * @route   DELETE /api/activities/:id/inscribe
 * @desc    Cancelar inscripción del usuario autenticado
 * @access  Private
 */
router.delete('/:id/inscribe', authMiddleware.authenticateToken, activityController.cancelInscription);

/**
 * @route   GET /api/activities/user/inscriptions
 * @desc    Obtener inscripciones del usuario autenticado
 * @access  Private
 */
router.get('/user/inscriptions', authMiddleware.authenticateToken, activityController.getUserInscriptions);

export default router;
