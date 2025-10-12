// =====================================================
// Controladores de Actividades
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { Request, Response } from 'express';
import { ActivityService } from '../services/activity.service';
import { 
  CreateActivityDto, 
  UpdateActivityDto, 
  InscribeActivityDto, 
  ListActivitiesDto
} from '../types/activity.types';

export class ActivityController {
  private activityService: ActivityService;

  constructor() {
    this.activityService = new ActivityService();
  }

  // Listar actividades
  listActivities = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('🔍 listActivities controller - Query params:', req.query);
      
      const filters: ListActivitiesDto = {
        tipo_actividad: req.query['tipo_actividad'] as 'taller' | 'competencia' | undefined,
        id_categoria: req.query['id_categoria'] ? parseInt(req.query['id_categoria'] as string) : undefined,
        solo_disponibles: req.query['solo_disponibles'] === 'true',
        solo_activas: req.query['solo_activas'] === 'true',
        limite: req.query['limite'] ? parseInt(req.query['limite'] as string) : 50,
        offset: req.query['offset'] ? parseInt(req.query['offset'] as string) : 0
      };

      console.log('🔍 listActivities controller - Filters:', filters);

      const result = await this.activityService.listActivities(filters);
      
      console.log('🔍 listActivities controller - Service result:', result);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('❌ Error en listActivities controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Obtener actividad por ID
  getActivityById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id_actividad = parseInt(req.params['id'] || '0');
      
      if (isNaN(id_actividad)) {
        res.status(400).json({
          success: false,
          message: 'ID de actividad inválido'
        });
        return;
      }

      const result = await this.activityService.getActivityById(id_actividad);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Error en getActivityById controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Crear actividad (Solo administradores)
  createActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      const activityData: CreateActivityDto = req.body;

      // Validaciones básicas
      if (!activityData.nombre_actividad || activityData.nombre_actividad.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'El nombre de la actividad es obligatorio'
        });
        return;
      }

      if (!activityData.tipo_actividad || !['taller', 'competencia'].includes(activityData.tipo_actividad)) {
        res.status(400).json({
          success: false,
          message: 'El tipo de actividad debe ser "taller" o "competencia"'
        });
        return;
      }

      const result = await this.activityService.createActivity(activityData);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error en createActivity controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Actualizar actividad (Solo administradores)
  updateActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      const id_actividad = parseInt(req.params['id'] || '0');
      
      if (isNaN(id_actividad)) {
        res.status(400).json({
          success: false,
          message: 'ID de actividad inválido'
        });
        return;
      }

      const activityData: UpdateActivityDto = req.body;
      const result = await this.activityService.updateActivity(id_actividad, activityData);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error en updateActivity controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Inscribir usuario en actividad
  inscribeUserToActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('🔍 Iniciando inscripción de usuario a actividad');
      console.log('🔍 Headers:', req.headers);
      console.log('🔍 Body:', req.body);
      console.log('🔍 Params:', req.params);
      console.log('🔍 User from token:', (req as any).user);
      
      const id_usuario = (req as any).user?.id_usuario;
      
      if (!id_usuario) {
        console.log('❌ Usuario no autenticado');
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const id_actividad = parseInt(req.params['id'] || '0');
      
      if (isNaN(id_actividad) || id_actividad <= 0) {
        console.log('❌ ID de actividad inválido:', req.params['id']);
        res.status(400).json({
          success: false,
          message: 'ID de actividad inválido'
        });
        return;
      }

      const inscriptionData: InscribeActivityDto = {
        id_actividad: id_actividad,
        observaciones_inscripcion: req.body.observaciones_inscripcion
      };

      const result = await this.activityService.inscribeUserToActivity(id_usuario, inscriptionData);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error en inscribeUserToActivity controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Obtener categorías de actividades
  getActivityCategories = async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.activityService.getActivityCategories();
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Error en getActivityCategories controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Obtener inscripciones del usuario autenticado
  getUserInscriptions = async (req: Request, res: Response): Promise<void> => {
    try {
      const id_usuario = (req as any).user?.id_usuario;
      
      if (!id_usuario) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const result = await this.activityService.getUserInscriptions(id_usuario);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Error en getUserInscriptions controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Cancelar inscripción del usuario autenticado
  cancelInscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const id_usuario = (req as any).user?.id_usuario;
      const id_actividad = parseInt(req.params['id'] || '0');
      
      if (!id_usuario) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (isNaN(id_actividad)) {
        res.status(400).json({
          success: false,
          message: 'ID de actividad inválido'
        });
        return;
      }

      // TODO: Implementar cancelación de inscripción
      // Por ahora, devolvemos un mensaje de que no está implementado
      res.status(501).json({
        success: false,
        message: 'Funcionalidad de cancelación de inscripción no implementada aún'
      });
    } catch (error) {
      console.error('Error en cancelInscription controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
}
