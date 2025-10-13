// =====================================================
// Repositorio de Actividades
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { executeStoredProcedure } from '../config/database';
import { 
  SpListActivitiesResponse,
  SpCreateActivityResponse,
  SpUpdateActivityResponse,
  SpInscribeActivityResponse
} from '../types/activity.types';

export class ActivityRepository {
  
  // Listar actividades usando stored procedure
  async listActivities(
    tipo_actividad?: string,
    id_categoria?: number,
    solo_disponibles: boolean = true,
    solo_activas: boolean = true,
    limite: number = 50,
    offset: number = 0
  ): Promise<SpListActivitiesResponse[]> {
    try {
      const result = await executeStoredProcedure('sp_listar_actividades', [
        tipo_actividad,
        id_categoria,
        solo_disponibles,
        solo_activas,
        limite,
        offset
      ]);
      
      return result;
    } catch (error) {
      console.error('Error en listActivities:', error);
      throw new Error('Error al listar actividades');
    }
  }

  // Crear actividad usando stored procedure
  async createActivity(activityData: {
    id_categoria: number;
    nombre_actividad: string;
    tipo_actividad: string;
    fecha_inicio_actividad: string;
    fecha_fin_actividad: string;
    cupo_maximo_actividad: number;
    descripcion_actividad?: string | undefined;
    fecha_limite_inscripcion?: string | undefined;
    duracion_estimada_minutos?: number | undefined;
    lugar_actividad?: string | undefined;
    ponente_actividad?: string | undefined;
    requisitos_actividad?: string | undefined;
    nivel_requerido?: string | undefined;
    edad_minima?: number | undefined;
    edad_maxima?: number | undefined;
    materiales_requeridos?: string | undefined;
    costo_actividad?: number | undefined;
    moneda_costo?: string | undefined;
    permite_inscripciones?: boolean | undefined;
    requiere_aprobacion?: boolean | undefined;
  }): Promise<SpCreateActivityResponse> {
    try {
      const result = await executeStoredProcedure('sp_crear_actividad', [
        activityData.id_categoria,
        activityData.nombre_actividad,
        activityData.tipo_actividad,
        activityData.fecha_inicio_actividad,
        activityData.fecha_fin_actividad,
        activityData.cupo_maximo_actividad,
        activityData.descripcion_actividad,
        activityData.fecha_limite_inscripcion,
        activityData.duracion_estimada_minutos,
        activityData.lugar_actividad,
        activityData.ponente_actividad,
        activityData.requisitos_actividad,
        activityData.nivel_requerido,
        activityData.edad_minima,
        activityData.edad_maxima,
        activityData.materiales_requeridos,
        activityData.costo_actividad,
        activityData.moneda_costo,
        activityData.permite_inscripciones,
        activityData.requiere_aprobacion
      ]);
      
      return result[0];
    } catch (error) {
      console.error('Error en createActivity:', error);
      throw new Error('Error al crear actividad');
    }
  }

  // Actualizar actividad usando stored procedure
  async updateActivity(
    id_actividad: number,
    activityData: {
      id_categoria?: number | undefined;
      nombre_actividad?: string | undefined;
      tipo_actividad?: string | undefined;
      fecha_inicio_actividad?: string | undefined;
      fecha_fin_actividad?: string | undefined;
      cupo_maximo_actividad?: number | undefined;
      descripcion_actividad?: string | undefined;
      fecha_limite_inscripcion?: string | undefined;
      duracion_estimada_minutos?: number | undefined;
      lugar_actividad?: string | undefined;
      ponente_actividad?: string | undefined;
      requisitos_actividad?: string | undefined;
      nivel_requerido?: string | undefined;
      edad_minima?: number | undefined;
      edad_maxima?: number | undefined;
      materiales_requeridos?: string | undefined;
      costo_actividad?: number | undefined;
      moneda_costo?: string | undefined;
      permite_inscripciones?: boolean | undefined;
      requiere_aprobacion?: boolean | undefined;
      estado_actividad?: boolean | undefined;
    }
  ): Promise<SpUpdateActivityResponse> {
    try {
      const result = await executeStoredProcedure('sp_actualizar_actividad', [
        id_actividad,
        activityData.id_categoria,
        activityData.nombre_actividad,
        activityData.tipo_actividad,
        activityData.fecha_inicio_actividad,
        activityData.fecha_fin_actividad,
        activityData.cupo_maximo_actividad,
        activityData.descripcion_actividad,
        activityData.fecha_limite_inscripcion,
        activityData.duracion_estimada_minutos,
        activityData.lugar_actividad,
        activityData.ponente_actividad,
        activityData.requisitos_actividad,
        activityData.nivel_requerido,
        activityData.edad_minima,
        activityData.edad_maxima,
        activityData.materiales_requeridos,
        activityData.costo_actividad,
        activityData.moneda_costo,
        activityData.permite_inscripciones,
        activityData.requiere_aprobacion,
        activityData.estado_actividad
      ]);
      
      return result[0];
    } catch (error) {
      console.error('Error en updateActivity:', error);
      throw new Error('Error al actualizar actividad');
    }
  }

  // Inscribir usuario en actividad usando stored procedure
  async inscribeUserToActivity(
    id_usuario: string,
    id_actividad: number,
    observaciones_inscripcion?: string
  ): Promise<SpInscribeActivityResponse> {
    try {
      
      const result = await executeStoredProcedure('sp_inscribirse_actividad', [
        id_usuario, // PostgreSQL debería convertir automáticamente string a UUID
        id_actividad,
        observaciones_inscripcion
      ]);
      
      
      if (!result || result.length === 0) {
        throw new Error('El stored procedure no devolvió ningún resultado');
      }
      
      return result[0];
    } catch (error) {
      console.error('❌ Repository: Error en inscribeUserToActivity:', error);
      throw new Error('Error al inscribir usuario en actividad');
    }
  }

  // Obtener categorías de actividades
  async getActivityCategories(): Promise<any[]> {
    try {
      const result = await executeStoredProcedure('sp_consultar_categorias_actividad', []);
      return result;
    } catch (error) {
      console.error('Error en getActivityCategories:', error);
      throw new Error('Error al obtener categorías de actividades');
    }
  }

  // Obtener inscripciones de un usuario
  async getUserInscriptions(id_usuario: string): Promise<any[]> {
    try {
      const result = await executeStoredProcedure('sp_consultar_inscripciones_usuario', [id_usuario]);
      return result;
    } catch (error) {
      console.error('Error en getUserInscriptions:', error);
      throw new Error('Error al obtener inscripciones del usuario');
    }
  }

  // Obtener una actividad específica por ID
  async getActivityById(id_actividad: number): Promise<SpListActivitiesResponse | null> {
    try {
      const result = await executeStoredProcedure('sp_consultar_actividad_por_id', [id_actividad]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error en getActivityById:', error);
      throw new Error('Error al obtener actividad por ID');
    }
  }
}
