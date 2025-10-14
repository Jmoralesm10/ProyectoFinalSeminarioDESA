// =====================================================
// Controlador para diplomas
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { Request, Response } from 'express';
import { DiplomaService } from '../services/diploma.service';
import {
  RegistrarResultadosCompetenciaDto,
  GenerarDiplomasActividadDto,
  GenerarDiplomasCongresoDto,
  ConsultarDiplomasDto,
  ActualizarDiplomaDto
} from '../types/diploma.types';

export class DiplomaController {
  private diplomaService: DiplomaService;

  constructor() {
    this.diplomaService = new DiplomaService();
  }

  // =====================================================
  // RESULTADOS DE COMPETENCIAS
  // =====================================================

  /**
   * Registrar resultados de una competencia
   * POST /api/diplomas/competitions/:id/resultados
   */
  async registrarResultadosCompetencia(req: Request, res: Response): Promise<void> {
    try {
      const idActividad = parseInt(req.params['id'] || '0');
      const registradoPorUsuario = req.user?.id_usuario || '';

      if (!idActividad || idActividad <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de actividad inválido'
        });
        return;
      }

      if (!registradoPorUsuario) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const datos: RegistrarResultadosCompetenciaDto = req.body;

      const resultado = await this.diplomaService.registrarResultadosCompetencia(
        idActividad,
        datos,
        registradoPorUsuario
      );

      if (resultado.success) {
        res.status(201).json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Error en registrarResultadosCompetencia controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Consultar resultados de una competencia
   * GET /api/diplomas/competitions/:id/resultados
   */
  async consultarResultadosCompetencia(req: Request, res: Response): Promise<void> {
    try {
      const idActividad = parseInt(req.params['id'] || '0');

      if (!idActividad || idActividad <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de actividad inválido'
        });
        return;
      }

      const resultado = await this.diplomaService.consultarResultadosCompetencia(idActividad);

      if (resultado.success) {
        res.status(200).json(resultado);
      } else {
        res.status(404).json(resultado);
      }
    } catch (error) {
      console.error('Error en consultarResultadosCompetencia controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // =====================================================
  // GENERACIÓN DE DIPLOMAS
  // =====================================================

  /**
   * Generar diplomas para una actividad específica
   * POST /api/diplomas/activities/:id/generate
   */
  async generarDiplomasActividad(req: Request, res: Response): Promise<void> {
    try {
      const idActividad = parseInt(req.params['id'] || '0');
      const generadoPorUsuario = req.user?.id_usuario || '';

      if (!idActividad || idActividad <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de actividad inválido'
        });
        return;
      }

      if (!generadoPorUsuario) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const datos: GenerarDiplomasActividadDto = req.body;

      const resultado = await this.diplomaService.generarDiplomasActividad(
        idActividad,
        datos,
        generadoPorUsuario
      );

      if (resultado.success) {
        res.status(201).json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Error en generarDiplomasActividad controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Generar diplomas del congreso general
   * POST /api/diplomas/congreso/generate
   */
  async generarDiplomasCongreso(req: Request, res: Response): Promise<void> {
    try {
      const generadoPorUsuario = req.user?.id_usuario || '';

      if (!generadoPorUsuario) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const datos: GenerarDiplomasCongresoDto = req.body;

      const resultado = await this.diplomaService.generarDiplomasCongreso(
        datos,
        generadoPorUsuario
      );

      if (resultado.success) {
        res.status(201).json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Error en generarDiplomasCongreso controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // =====================================================
  // CONSULTAS DE DIPLOMAS
  // =====================================================

  /**
   * Consultar diplomas con filtros
   * GET /api/diplomas
   */
  async consultarDiplomas(req: Request, res: Response): Promise<void> {
    try {
      const filters: ConsultarDiplomasDto = {
        id_usuario: req.query['id_usuario'] as string | undefined,
        id_actividad: req.query['id_actividad'] ? parseInt(req.query['id_actividad'] as string) : undefined,
        tipo_diploma: req.query['tipo_diploma'] as string | undefined,
        fecha_desde: req.query['fecha_desde'] as string | undefined,
        fecha_hasta: req.query['fecha_hasta'] as string | undefined,
        solo_no_enviados: req.query['solo_no_enviados'] === 'true',
        limite: req.query['limite'] ? parseInt(req.query['limite'] as string) : 100,
        offset: req.query['offset'] ? parseInt(req.query['offset'] as string) : 0
      };

      const resultado = await this.diplomaService.consultarDiplomas(filters);

      if (resultado.success) {
        res.status(200).json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Error en consultarDiplomas controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener estadísticas de diplomas
   * GET /api/diplomas/stats
   */
  async obtenerEstadisticasDiplomas(_req: Request, res: Response): Promise<void> {
    try {
      const resultado = await this.diplomaService.obtenerEstadisticasDiplomas();

      if (resultado.success) {
        res.status(200).json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Error en obtenerEstadisticasDiplomas controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener plantillas de diplomas disponibles
   * GET /api/diplomas/templates
   */
  async obtenerPlantillasDisponibles(_req: Request, res: Response): Promise<void> {
    try {
      const resultado = await this.diplomaService.obtenerPlantillasDisponibles();

      if (resultado.success) {
        res.status(200).json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Error en obtenerPlantillasDisponibles controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // =====================================================
  // GESTIÓN DE DIPLOMAS
  // =====================================================

  /**
   * Actualizar información de un diploma
   * PUT /api/diplomas/:usuarioId/:actividadId/:tipoDiploma
   */
  async actualizarDiploma(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.params['usuarioId'] || '';
      const actividadId = req.params['actividadId'] ? parseInt(req.params['actividadId']) : null;
      const tipoDiploma = req.params['tipoDiploma'] || '';

      if (!usuarioId || !tipoDiploma) {
        res.status(400).json({
          success: false,
          message: 'Parámetros inválidos'
        });
        return;
      }

      const datos: ActualizarDiplomaDto = req.body;

      const resultado = await this.diplomaService.actualizarDiploma(
        usuarioId,
        actividadId,
        tipoDiploma,
        datos
      );

      if (resultado.success) {
        res.status(200).json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Error en actualizarDiploma controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Marcar diploma como descargado
   * PATCH /api/diplomas/:usuarioId/:actividadId/:tipoDiploma/download
   */
  async marcarDiplomaDescargado(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.params['usuarioId'] || '';
      const actividadId = req.params['actividadId'] ? parseInt(req.params['actividadId']) : null;
      const tipoDiploma = req.params['tipoDiploma'] || '';

      if (!usuarioId || !tipoDiploma) {
        res.status(400).json({
          success: false,
          message: 'Parámetros inválidos'
        });
        return;
      }

      const resultado = await this.diplomaService.marcarDiplomaDescargado(
        usuarioId,
        actividadId,
        tipoDiploma
      );

      if (resultado.success) {
        res.status(200).json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Error en marcarDiplomaDescargado controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Reenviar diploma por correo electrónico
   * POST /api/diplomas/:usuarioId/:actividadId/:tipoDiploma/resend
   */
  async reenviarDiplomaPorCorreo(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.params['usuarioId'] || '';
      const actividadId = req.params['actividadId'] ? parseInt(req.params['actividadId']) : null;
      const tipoDiploma = req.params['tipoDiploma'] || '';

      if (!usuarioId || !tipoDiploma) {
        res.status(400).json({
          success: false,
          message: 'Parámetros inválidos'
        });
        return;
      }

      const resultado = await this.diplomaService.reenviarDiplomaPorCorreo(
        usuarioId,
        actividadId,
        tipoDiploma
      );

      if (resultado.success) {
        res.status(200).json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Error en reenviarDiplomaPorCorreo controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // =====================================================
  // ENDPOINTS ADICIONALES
  // =====================================================

  /**
   * Obtener diplomas de un usuario específico
   * GET /api/diplomas/user/:userId
   */
  async obtenerDiplomasUsuario(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params['userId'] || '';

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
        return;
      }

      const filters: ConsultarDiplomasDto = {
        id_usuario: userId,
        limite: 100,
        offset: 0
      };

      const resultado = await this.diplomaService.consultarDiplomas(filters);

      if (resultado.success) {
        res.status(200).json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Error en obtenerDiplomasUsuario controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener diplomas de una actividad específica
   * GET /api/diplomas/activity/:activityId
   */
  async obtenerDiplomasActividad(req: Request, res: Response): Promise<void> {
    try {
      const activityId = parseInt(req.params['activityId'] || '0');

      if (!activityId || activityId <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de actividad inválido'
        });
        return;
      }

      const filters: ConsultarDiplomasDto = {
        id_actividad: activityId,
        limite: 100,
        offset: 0
      };

      const resultado = await this.diplomaService.consultarDiplomas(filters);

      if (resultado.success) {
        res.status(200).json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Error en obtenerDiplomasActividad controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
