// =====================================================
// Controladores Públicos
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { Request, Response } from 'express';
import { PublicService } from '../services/public.service';
import { 
  ConsultarFaqDto, 
  ConsultarAgendaCongresoDto, 
  ConsultarPonentesCongresoDto 
} from '../types/public.types';

export class PublicController {
  private publicService: PublicService;

  constructor() {
    this.publicService = new PublicService();
  }

  // =====================================================
  // ENDPOINTS PARA FAQ
  // =====================================================

  /**
   * GET /api/public/faq
   * Consulta todas las preguntas frecuentes o por categoría
   */
  consultarFaq = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('📋 [PublicController] Consultando FAQ');

      const filtros: ConsultarFaqDto = {
        categoria_faq: req.query['categoria'] as string | undefined
      };

      const result = await this.publicService.consultarFaq(filtros);
      
      res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
      console.error('❌ [PublicController] Error al consultar FAQ:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al consultar FAQ',
        total_registros: 0,
        faqs: []
      });
    }
  };

  /**
   * GET /api/public/faq/categories
   * Obtiene las categorías de FAQ disponibles
   */
  obtenerCategoriasFaq = async (_req: Request, res: Response): Promise<void> => {
    try {
      console.log('📂 [PublicController] Obteniendo categorías de FAQ');

      const result = await this.publicService.obtenerCategoriasFaq();
      
      res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
      console.error('❌ [PublicController] Error al obtener categorías de FAQ:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener categorías de FAQ',
        categorias: []
      });
    }
  };

  // =====================================================
  // ENDPOINTS PARA INFORMACIÓN DEL CONGRESO
  // =====================================================

  /**
   * GET /api/public/congress/info
   * Consulta la información general del congreso
   */
  consultarInformacionCongreso = async (_req: Request, res: Response): Promise<void> => {
    try {
      console.log('🏛️ [PublicController] Consultando información del congreso');

      const result = await this.publicService.consultarInformacionCongreso();
      
      res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
      console.error('❌ [PublicController] Error al consultar información del congreso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al consultar información del congreso',
        informacion: null
      });
    }
  };

  /**
   * GET /api/public/congress/agenda
   * Consulta la agenda del congreso
   */
  consultarAgendaCongreso = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('📅 [PublicController] Consultando agenda del congreso');

      const filtros: ConsultarAgendaCongresoDto = {
        dia_agenda: req.query['dia'] ? parseInt(req.query['dia'] as string) : undefined,
        tipo_actividad: req.query['tipo'] as string | undefined
      };

      const result = await this.publicService.consultarAgendaCongreso(filtros);
      
      res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
      console.error('❌ [PublicController] Error al consultar agenda del congreso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al consultar agenda del congreso',
        total_registros: 0,
        agenda: []
      });
    }
  };

  /**
   * GET /api/public/congress/speakers
   * Consulta los ponentes del congreso
   */
  consultarPonentesCongreso = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('👥 [PublicController] Consultando ponentes del congreso');

      const filtros: ConsultarPonentesCongresoDto = {
        especialidad: req.query['especialidad'] as string | undefined,
        empresa: req.query['empresa'] as string | undefined
      };

      const result = await this.publicService.consultarPonentesCongreso(filtros);
      
      res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
      console.error('❌ [PublicController] Error al consultar ponentes del congreso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al consultar ponentes del congreso',
        total_registros: 0,
        ponentes: []
      });
    }
  };

  // =====================================================
  // ENDPOINTS PARA ESTADÍSTICAS PÚBLICAS
  // =====================================================

  /**
   * GET /api/public/stats
   * Obtiene estadísticas públicas del congreso
   */
  obtenerEstadisticasPublicas = async (_req: Request, res: Response): Promise<void> => {
    try {
      console.log('📊 [PublicController] Obteniendo estadísticas públicas');

      const result = await this.publicService.obtenerEstadisticasPublicas();
      
      res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
      console.error('❌ [PublicController] Error al obtener estadísticas públicas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener estadísticas públicas',
        estadisticas: null
      });
    }
  };

  // =====================================================
  // ENDPOINT DE SALUD PÚBLICO
  // =====================================================

  /**
   * GET /api/public/health
   * Endpoint de salud para verificar que la API está funcionando
   */
  healthCheck = async (_req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json({
        success: true,
        message: 'API pública del Congreso de Tecnología funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        endpoints: {
          faq: '/api/public/faq',
          faq_categories: '/api/public/faq/categories',
          congress_info: '/api/public/congress/info',
          congress_agenda: '/api/public/congress/agenda',
          congress_speakers: '/api/public/congress/speakers',
          stats: '/api/public/stats',
          health: '/api/public/health'
        }
      });
    } catch (error) {
      console.error('❌ [PublicController] Error en health check:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el health check',
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * Obtener diplomas de un usuario específico (endpoint temporal)
   * GET /api/public/user-diplomas/:userId
   */
  obtenerDiplomasUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params['userId'];
      console.log('🎓 [PublicController] Obteniendo diplomas de usuario:', userId);

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario requerido',
          diplomas: []
        });
        return;
      }

      const result = await this.publicService.obtenerDiplomasUsuario(userId);
      
      res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
      console.error('❌ [PublicController] Error al obtener diplomas de usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener diplomas del usuario',
        diplomas: []
      });
    }
  };

  /**
   * Generar PDF para un diploma específico
   * POST /api/public/generate-diploma-pdf/:diplomaId/:userId
   */
  generarPDFDiploma = async (req: Request, res: Response): Promise<void> => {
    try {
      const diplomaId = req.params['diplomaId'];
      const userId = req.params['userId'];
      console.log('🎓 [PublicController] Generando PDF para diploma:', diplomaId, 'usuario:', userId);

      if (!diplomaId || !userId) {
        res.status(400).json({
          success: false,
          message: 'ID de diploma y usuario requeridos'
        });
        return;
      }

      const result = await this.publicService.generarPDFDiploma(diplomaId, userId);
      
      res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
      console.error('❌ [PublicController] Error al generar PDF del diploma:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al generar PDF del diploma'
      });
    }
  };
}
