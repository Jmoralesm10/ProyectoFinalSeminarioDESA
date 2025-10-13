// =====================================================
// Servicios de Actividades
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { ActivityRepository } from '../repositories/activity.repository';
import { 
  CreateActivityDto,
  UpdateActivityDto,
  InscribeActivityDto,
  ListActivitiesDto,
  ActivityListResponse,
  ActivityResponse,
  ActivityInscriptionResponse,
  ActivityCategoryListResponse,
  Activity,
  ActivityCategory,
  ActivityInscription
} from '../types/activity.types';

export class ActivityService {
  private activityRepository: ActivityRepository;

  constructor() {
    this.activityRepository = new ActivityRepository();
  }

  // Listar actividades
  async listActivities(filters: ListActivitiesDto): Promise<ActivityListResponse> {
    try {
      
      const result = await this.activityRepository.listActivities(
        filters.tipo_actividad,
        filters.id_categoria,
        filters.solo_disponibles ?? true,
        filters.solo_activas ?? true,
        filters.limite ?? 50,
        filters.offset ?? 0
      );

      if (result.length === 0) {
        return {
          success: false,
          message: 'No se encontraron actividades con los criterios especificados'
        };
      }

      // Mapear resultados a formato de Activity
      const activities: Activity[] = result.map(item => ({
        id_actividad: item.id_actividad,
        id_categoria: 0, // Se puede obtener del SP si es necesario
        nombre_actividad: item.nombre_actividad,
        descripcion_actividad: item.descripcion_actividad,
        tipo_actividad: item.tipo_actividad as 'taller' | 'competencia',
        fecha_inicio_actividad: item.fecha_inicio_actividad,
        fecha_fin_actividad: item.fecha_fin_actividad,
        fecha_limite_inscripcion: item.fecha_limite_inscripcion,
        duracion_estimada_minutos: item.duracion_estimada_minutos,
        cupo_maximo_actividad: item.cupo_maximo_actividad,
        cupo_disponible_actividad: item.cupo_disponible_actividad,
        lugar_actividad: item.lugar_actividad,
        ponente_actividad: item.ponente_actividad,
        requisitos_actividad: item.requisitos_actividad,
        nivel_requerido: item.nivel_requerido,
        edad_minima: item.edad_minima,
        edad_maxima: item.edad_maxima,
        materiales_requeridos: item.materiales_requeridos,
        costo_actividad: item.costo_actividad,
        moneda_costo: item.moneda_costo,
        permite_inscripciones: item.permite_inscripciones,
        requiere_aprobacion: item.requiere_aprobacion,
        categoria_nombre: item.categoria_nombre,
        estado_actividad: item.estado_actividad,
        fecha_creacion_actividad: item.fecha_creacion_actividad
      }));

      return {
        success: true,
        message: 'Actividades obtenidas exitosamente',
        data: activities,
        total: activities.length,
        page: Math.floor((filters.offset ?? 0) / (filters.limite ?? 50)) + 1,
        limit: filters.limite ?? 50
      };
    } catch (error) {
      console.error('Error en listActivities service:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // Crear actividad
  async createActivity(activityData: CreateActivityDto): Promise<ActivityResponse> {
    try {
      // Validaciones básicas
      if (!activityData.nombre_actividad || activityData.nombre_actividad.trim() === '') {
        return {
          success: false,
          message: 'El nombre de la actividad es obligatorio'
        };
      }

      if (!activityData.tipo_actividad || !['taller', 'competencia'].includes(activityData.tipo_actividad)) {
        return {
          success: false,
          message: 'El tipo de actividad debe ser "taller" o "competencia"'
        };
      }

      if (!activityData.fecha_inicio_actividad || !activityData.fecha_fin_actividad) {
        return {
          success: false,
          message: 'Las fechas de inicio y fin son obligatorias'
        };
      }

      if (activityData.cupo_maximo_actividad <= 0) {
        return {
          success: false,
          message: 'El cupo máximo debe ser mayor a 0'
        };
      }

      const result = await this.activityRepository.createActivity({
        id_categoria: activityData.id_categoria,
        nombre_actividad: activityData.nombre_actividad,
        tipo_actividad: activityData.tipo_actividad,
        fecha_inicio_actividad: activityData.fecha_inicio_actividad,
        fecha_fin_actividad: activityData.fecha_fin_actividad,
        cupo_maximo_actividad: activityData.cupo_maximo_actividad,
        descripcion_actividad: activityData.descripcion_actividad,
        fecha_limite_inscripcion: activityData.fecha_limite_inscripcion,
        duracion_estimada_minutos: activityData.duracion_estimada_minutos,
        lugar_actividad: activityData.lugar_actividad,
        ponente_actividad: activityData.ponente_actividad,
        requisitos_actividad: activityData.requisitos_actividad,
        nivel_requerido: activityData.nivel_requerido,
        edad_minima: activityData.edad_minima,
        edad_maxima: activityData.edad_maxima,
        materiales_requeridos: activityData.materiales_requeridos,
        costo_actividad: activityData.costo_actividad ?? 0,
        moneda_costo: activityData.moneda_costo ?? 'GTQ',
        permite_inscripciones: activityData.permite_inscripciones ?? true,
        requiere_aprobacion: activityData.requiere_aprobacion ?? false
      });

      if (result.success) {
        return {
          success: true,
          message: result.message,
          data: {
            id_actividad: result.id_actividad,
            id_categoria: activityData.id_categoria,
            nombre_actividad: result.nombre_actividad,
            descripcion_actividad: activityData.descripcion_actividad,
            tipo_actividad: activityData.tipo_actividad,
            fecha_inicio_actividad: new Date(activityData.fecha_inicio_actividad),
            fecha_fin_actividad: new Date(activityData.fecha_fin_actividad),
            fecha_limite_inscripcion: activityData.fecha_limite_inscripcion ? new Date(activityData.fecha_limite_inscripcion) : undefined,
            duracion_estimada_minutos: activityData.duracion_estimada_minutos,
            cupo_maximo_actividad: activityData.cupo_maximo_actividad,
            cupo_disponible_actividad: activityData.cupo_maximo_actividad,
            lugar_actividad: activityData.lugar_actividad,
            ponente_actividad: activityData.ponente_actividad,
            requisitos_actividad: activityData.requisitos_actividad,
            nivel_requerido: activityData.nivel_requerido,
            edad_minima: activityData.edad_minima,
            edad_maxima: activityData.edad_maxima,
            materiales_requeridos: activityData.materiales_requeridos,
            costo_actividad: activityData.costo_actividad ?? 0,
            moneda_costo: activityData.moneda_costo ?? 'GTQ',
            permite_inscripciones: activityData.permite_inscripciones ?? true,
            requiere_aprobacion: activityData.requiere_aprobacion ?? false,
            categoria_nombre: '',
            estado_actividad: true,
            fecha_creacion_actividad: new Date()
          } as Activity
        };
      } else {
        return {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      console.error('Error en createActivity service:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // Actualizar actividad
  async updateActivity(id_actividad: number, activityData: UpdateActivityDto): Promise<ActivityResponse> {
    try {
      const result = await this.activityRepository.updateActivity(id_actividad, activityData);

      if (result.success) {
        // Obtener la actividad actualizada
        const updatedActivity = await this.activityRepository.getActivityById(id_actividad);
        
        if (updatedActivity) {
          const activity: Activity = {
            id_actividad: updatedActivity.id_actividad,
            id_categoria: 0,
            nombre_actividad: updatedActivity.nombre_actividad,
            descripcion_actividad: updatedActivity.descripcion_actividad,
            tipo_actividad: updatedActivity.tipo_actividad as 'taller' | 'competencia',
            fecha_inicio_actividad: updatedActivity.fecha_inicio_actividad,
            fecha_fin_actividad: updatedActivity.fecha_fin_actividad,
            fecha_limite_inscripcion: updatedActivity.fecha_limite_inscripcion,
            duracion_estimada_minutos: updatedActivity.duracion_estimada_minutos,
            cupo_maximo_actividad: updatedActivity.cupo_maximo_actividad,
            cupo_disponible_actividad: updatedActivity.cupo_disponible_actividad,
            lugar_actividad: updatedActivity.lugar_actividad,
            ponente_actividad: updatedActivity.ponente_actividad,
            requisitos_actividad: updatedActivity.requisitos_actividad,
            nivel_requerido: updatedActivity.nivel_requerido,
            edad_minima: updatedActivity.edad_minima,
            edad_maxima: updatedActivity.edad_maxima,
            materiales_requeridos: updatedActivity.materiales_requeridos,
            costo_actividad: updatedActivity.costo_actividad,
            moneda_costo: updatedActivity.moneda_costo,
            permite_inscripciones: updatedActivity.permite_inscripciones,
            requiere_aprobacion: updatedActivity.requiere_aprobacion,
            categoria_nombre: updatedActivity.categoria_nombre,
            estado_actividad: updatedActivity.estado_actividad,
            fecha_creacion_actividad: updatedActivity.fecha_creacion_actividad
          };

          return {
            success: true,
            message: result.message,
            data: activity
          };
        }
      }

      return {
        success: false,
        message: result.message
      };
    } catch (error) {
      console.error('Error en updateActivity service:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // Inscribir usuario en actividad
  async inscribeUserToActivity(
    id_usuario: string,
    inscriptionData: InscribeActivityDto
  ): Promise<ActivityInscriptionResponse> {
    try {
      
      const result = await this.activityRepository.inscribeUserToActivity(
        id_usuario,
        inscriptionData.id_actividad,
        inscriptionData.observaciones_inscripcion
      );
      

      if (result.success) {
        const inscription: ActivityInscription = {
          id_usuario: result.id_usuario,
          id_actividad: result.id_actividad,
          fecha_inscripcion: result.fecha_inscripcion,
          estado_inscripcion: result.estado_inscripcion as 'confirmada' | 'cancelada' | 'en_espera',
          observaciones_inscripcion: inscriptionData.observaciones_inscripcion,
          nombre_actividad: result.nombre_actividad
        };

        return {
          success: true,
          message: result.message,
          data: inscription
        };
      } else {
        return {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      console.error('Error en inscribeUserToActivity service:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // Obtener categorías de actividades
  async getActivityCategories(): Promise<ActivityCategoryListResponse> {
    try {
      const result = await this.activityRepository.getActivityCategories();

      if (result.length === 0) {
        return {
          success: false,
          message: 'No se encontraron categorías de actividades'
        };
      }

      const categories: ActivityCategory[] = result.map(item => ({
        id_categoria: item.id_categoria,
        nombre_categoria: item.nombre_categoria,
        descripcion_categoria: item.descripcion_categoria,
        estado_categoria: item.estado_categoria,
        fecha_creacion_categoria: item.fecha_creacion_categoria
      }));

      return {
        success: true,
        message: 'Categorías obtenidas exitosamente',
        data: categories
      };
    } catch (error) {
      console.error('Error en getActivityCategories service:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // Obtener inscripciones de un usuario
  async getUserInscriptions(id_usuario: string): Promise<ActivityListResponse> {
    try {
      const result = await this.activityRepository.getUserInscriptions(id_usuario);

      if (result.length === 0) {
        return {
          success: false,
          message: 'El usuario no tiene inscripciones'
        };
      }

      // Mapear resultados a formato de Activity
      const activities: Activity[] = result.map(item => ({
        id_actividad: item.id_actividad,
        id_categoria: 0,
        nombre_actividad: item.nombre_actividad,
        descripcion_actividad: item.descripcion_actividad,
        tipo_actividad: item.tipo_actividad as 'taller' | 'competencia',
        fecha_inicio_actividad: item.fecha_inicio_actividad,
        fecha_fin_actividad: item.fecha_fin_actividad,
        fecha_limite_inscripcion: item.fecha_limite_inscripcion,
        duracion_estimada_minutos: item.duracion_estimada_minutos,
        cupo_maximo_actividad: item.cupo_maximo_actividad,
        cupo_disponible_actividad: item.cupo_disponible_actividad,
        lugar_actividad: item.lugar_actividad,
        ponente_actividad: item.ponente_actividad,
        requisitos_actividad: item.requisitos_actividad,
        nivel_requerido: item.nivel_requerido,
        edad_minima: item.edad_minima,
        edad_maxima: item.edad_maxima,
        materiales_requeridos: item.materiales_requeridos,
        costo_actividad: item.costo_actividad,
        moneda_costo: item.moneda_costo,
        permite_inscripciones: item.permite_inscripciones,
        requiere_aprobacion: item.requiere_aprobacion,
        categoria_nombre: item.categoria_nombre,
        estado_actividad: item.estado_actividad,
        fecha_creacion_actividad: item.fecha_creacion_actividad
      }));

      return {
        success: true,
        message: 'Inscripciones del usuario obtenidas exitosamente',
        data: activities,
        total: activities.length
      };
    } catch (error) {
      console.error('Error en getUserInscriptions service:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // Obtener actividad por ID
  async getActivityById(id_actividad: number): Promise<ActivityResponse> {
    try {
      const result = await this.activityRepository.getActivityById(id_actividad);

      if (!result) {
        return {
          success: false,
          message: 'Actividad no encontrada'
        };
      }

      const activity: Activity = {
        id_actividad: result.id_actividad,
        id_categoria: 0,
        nombre_actividad: result.nombre_actividad,
        descripcion_actividad: result.descripcion_actividad,
        tipo_actividad: result.tipo_actividad as 'taller' | 'competencia',
        fecha_inicio_actividad: result.fecha_inicio_actividad,
        fecha_fin_actividad: result.fecha_fin_actividad,
        fecha_limite_inscripcion: result.fecha_limite_inscripcion,
        duracion_estimada_minutos: result.duracion_estimada_minutos,
        cupo_maximo_actividad: result.cupo_maximo_actividad,
        cupo_disponible_actividad: result.cupo_disponible_actividad,
        lugar_actividad: result.lugar_actividad,
        ponente_actividad: result.ponente_actividad,
        requisitos_actividad: result.requisitos_actividad,
        nivel_requerido: result.nivel_requerido,
        edad_minima: result.edad_minima,
        edad_maxima: result.edad_maxima,
        materiales_requeridos: result.materiales_requeridos,
        costo_actividad: result.costo_actividad,
        moneda_costo: result.moneda_costo,
        permite_inscripciones: result.permite_inscripciones,
        requiere_aprobacion: result.requiere_aprobacion,
        categoria_nombre: result.categoria_nombre,
        estado_actividad: result.estado_actividad,
        fecha_creacion_actividad: result.fecha_creacion_actividad
      };

      return {
        success: true,
        message: 'Actividad obtenida exitosamente',
        data: activity
      };
    } catch (error) {
      console.error('Error en getActivityById service:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }
}
