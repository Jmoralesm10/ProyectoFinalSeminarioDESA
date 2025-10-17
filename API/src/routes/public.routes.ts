// =====================================================
// Rutas Públicas
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { Router } from 'express';
import { PublicController } from '../controllers/public.controller';

const router = Router();
const publicController = new PublicController();

// =====================================================
// ENDPOINTS PÚBLICOS (SIN AUTENTICACIÓN)
// =====================================================

/**
 * @route   GET /api/public/health
 * @desc    Health check de la API pública
 * @access  Public
 */
router.get('/health', publicController.healthCheck.bind(publicController));

// =====================================================
// ENDPOINTS PARA FAQ
// =====================================================

/**
 * @route   GET /api/public/faq
 * @desc    Consulta todas las preguntas frecuentes o por categoría
 * @access  Public
 * @query   categoria (opcional) - Filtrar por categoría específica
 */
router.get('/faq', publicController.consultarFaq.bind(publicController));

/**
 * @route   GET /api/public/faq/categories
 * @desc    Obtiene las categorías de FAQ disponibles
 * @access  Public
 */
router.get('/faq/categories', publicController.obtenerCategoriasFaq.bind(publicController));

// =====================================================
// ENDPOINTS PARA INFORMACIÓN DEL CONGRESO
// =====================================================

/**
 * @route   GET /api/public/congress/info
 * @desc    Consulta la información general del congreso
 * @access  Public
 */
router.get('/congress/info', publicController.consultarInformacionCongreso.bind(publicController));

/**
 * @route   GET /api/public/congress/agenda
 * @desc    Consulta la agenda del congreso
 * @access  Public
 * @query   dia (opcional) - Filtrar por día específico (1, 2, 3, etc.)
 * @query   tipo (opcional) - Filtrar por tipo de actividad (inauguracion, conferencia, taller, etc.)
 */
router.get('/congress/agenda', publicController.consultarAgendaCongreso.bind(publicController));

/**
 * @route   GET /api/public/congress/speakers
 * @desc    Consulta los ponentes del congreso
 * @access  Public
 * @query   especialidad (opcional) - Filtrar por especialidad (IA, Cloud Computing, etc.)
 * @query   empresa (opcional) - Filtrar por empresa (Microsoft, Google, etc.)
 */
router.get('/congress/speakers', publicController.consultarPonentesCongreso.bind(publicController));

// =====================================================
// ENDPOINTS PARA ESTADÍSTICAS PÚBLICAS
// =====================================================

/**
 * @route   GET /api/public/stats
 * @desc    Obtiene estadísticas públicas del congreso
 * @access  Public
 */
router.get('/stats', publicController.obtenerEstadisticasPublicas.bind(publicController));

/**
 * @route   GET /api/public/user-diplomas/:userId
 * @desc    Obtener diplomas de un usuario específico (endpoint temporal)
 * @access  Public (temporal para testing)
 */
router.get('/user-diplomas/:userId', publicController.obtenerDiplomasUsuario.bind(publicController));

/**
 * @route   POST /api/public/generate-diploma-pdf/:diplomaId/:userId
 * @desc    Generar PDF para un diploma específico
 * @access  Public (temporal para testing)
 */
router.post('/generate-diploma-pdf/:diplomaId/:userId', publicController.generarPDFDiploma.bind(publicController));

export default router;
