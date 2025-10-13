// =====================================================
// Repositorio de asistencia
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { executeStoredProcedure, executeQuery } from '../config/database';
import {
  RegisterGeneralAttendanceDto,
  RegisterActivityAttendanceDto,
  QueryUserAttendanceDto,
  GeneralAttendanceResponse,
  ActivityAttendanceResponse,
  AttendanceRecord
} from '../types/attendance.types';

export class AttendanceRepository {
  constructor() {
    // No necesita inicialización especial
  }

  /**
   * Registra la asistencia general de un usuario al congreso
   */
  async registerGeneralAttendance(data: RegisterGeneralAttendanceDto): Promise<GeneralAttendanceResponse> {
    try {
      console.log('📋 [AttendanceRepository] Registrando asistencia general:', data);
      
      const result = await executeStoredProcedure('sp_registrar_asistencia_general', [data.codigo_qr_usuario]);
      
      console.log('📋 [AttendanceRepository] Resultado SP asistencia general:', result);
      
      if (result && result.length > 0) {
        const row = result[0];
        return {
          success: row.success,
          message: row.message,
          id_usuario: row.id_usuario,
          nombre_completo: row.nombre_completo,
          fecha_asistencia: row.fecha_asistencia,
          hora_ingreso: row.hora_ingreso
        };
      }
      
      throw new Error('No se recibió respuesta del stored procedure');
    } catch (error) {
      console.error('❌ [AttendanceRepository] Error al registrar asistencia general:', error);
      throw error;
    }
  }

  /**
   * Registra la asistencia de un usuario a una actividad específica
   */
  async registerActivityAttendance(data: RegisterActivityAttendanceDto): Promise<ActivityAttendanceResponse> {
    try {
      console.log('📋 [AttendanceRepository] Registrando asistencia a actividad:', data);
      
      const result = await executeStoredProcedure('sp_registrar_asistencia_actividad', [data.codigo_qr_usuario, data.id_actividad]);
      
      console.log('📋 [AttendanceRepository] Resultado SP asistencia actividad:', result);
      
      if (result && result.length > 0) {
        const row = result[0];
        return {
          success: row.success,
          message: row.message,
          id_usuario: row.id_usuario,
          id_actividad: row.id_actividad,
          nombre_completo: row.nombre_completo,
          nombre_actividad: row.nombre_actividad,
          fecha_asistencia: row.fecha_asistencia
        };
      }
      
      throw new Error('No se recibió respuesta del stored procedure');
    } catch (error) {
      console.error('❌ [AttendanceRepository] Error al registrar asistencia a actividad:', error);
      throw error;
    }
  }

  /**
   * Consulta el historial de asistencia de un usuario
   */
  async getUserAttendance(data: QueryUserAttendanceDto): Promise<AttendanceRecord[]> {
    try {
      console.log('📋 [AttendanceRepository] Consultando asistencia de usuario:', data);
      
      const query = 'SELECT * FROM sp_consultar_asistencia_usuario($1, $2, $3, $4)';
      const result = await executeQuery(query, [
        data.codigo_qr_usuario || null,
        data.id_usuario || null,
        data.fecha_desde || null,
        data.fecha_hasta || null
      ]);
      
      console.log('📋 [AttendanceRepository] Resultado SP consulta asistencia:', result);
      
      if (result && result.length > 0) {
        return result.map((row: any) => ({
          success: row.success,
          message: row.message,
          id_usuario: row.id_usuario,
          nombre_completo: row.nombre_completo,
          email_usuario: row.email_usuario,
          tipo_consulta: row.tipo_consulta,
          fecha_asistencia: row.fecha_asistencia,
          hora_asistencia: row.hora_asistencia,
          id_actividad: row.id_actividad,
          nombre_actividad: row.nombre_actividad,
          tipo_actividad: row.tipo_actividad,
          lugar_actividad: row.lugar_actividad
        }));
      }
      
      return [];
    } catch (error) {
      console.error('❌ [AttendanceRepository] Error al consultar asistencia:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas generales de asistencia
   */
  async getAttendanceStats(): Promise<any> {
    try {
      console.log('📋 [AttendanceRepository] Obteniendo estadísticas de asistencia');
      
      // Consulta para estadísticas generales
      const statsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM tb_usuarios WHERE estado_usuario = true) as total_usuarios,
          (SELECT COUNT(*) FROM tb_asistencia_general) as total_asistencia_general,
          (SELECT COUNT(*) FROM tb_asistencia_actividad) as total_asistencia_actividades
      `;
      
      const statsResult = await executeQuery(statsQuery);
      
      // Consulta para actividades más populares
      const popularQuery = `
        SELECT 
          a.id_actividad,
          a.nombre_actividad,
          COUNT(aa.id_usuario) as total_asistentes
        FROM tb_actividades a
        LEFT JOIN tb_asistencia_actividad aa ON a.id_actividad = aa.id_actividad
        WHERE a.estado_actividad = true
        GROUP BY a.id_actividad, a.nombre_actividad
        ORDER BY total_asistentes DESC
        LIMIT 5
      `;
      
      const popularResult = await executeQuery(popularQuery);
      
      const stats = statsResult[0];
      const porcentaje = stats.total_usuarios > 0 
        ? Math.round((stats.total_asistencia_general / stats.total_usuarios) * 100)
        : 0;
      
      return {
        total_usuarios_registrados: parseInt(stats.total_usuarios),
        total_asistencia_general: parseInt(stats.total_asistencia_general),
        total_asistencia_actividades: parseInt(stats.total_asistencia_actividades),
        porcentaje_asistencia_general: porcentaje,
        actividades_mas_populares: popularResult.map((row: any) => ({
          id_actividad: row.id_actividad,
          nombre_actividad: row.nombre_actividad,
          total_asistentes: parseInt(row.total_asistentes)
        }))
      };
    } catch (error) {
      console.error('❌ [AttendanceRepository] Error al obtener estadísticas:', error);
      throw error;
    }
  }

  /**
   * Verifica si un usuario ya asistió al congreso hoy
   */
  async checkTodayGeneralAttendance(codigo_qr_usuario: string): Promise<boolean> {
    try {
      const query = `
        SELECT EXISTS(
          SELECT 1 FROM tb_asistencia_general ag
          JOIN tb_usuarios u ON ag.id_usuario = u.id_usuario
          WHERE u.codigo_qr_usuario = $1
          AND ag.fecha_asistencia = CURRENT_DATE
        )
      `;
      
      const result = await executeQuery(query, [codigo_qr_usuario]);
      return result[0].exists;
    } catch (error) {
      console.error('❌ [AttendanceRepository] Error al verificar asistencia de hoy:', error);
      throw error;
    }
  }

  /**
   * Verifica si un usuario ya asistió a una actividad específica
   */
  async checkActivityAttendance(codigo_qr_usuario: string, id_actividad: number): Promise<boolean> {
    try {
      const query = `
        SELECT EXISTS(
          SELECT 1 FROM tb_asistencia_actividad aa
          JOIN tb_usuarios u ON aa.id_usuario = u.id_usuario
          WHERE u.codigo_qr_usuario = $1
          AND aa.id_actividad = $2
        )
      `;
      
      const result = await executeQuery(query, [codigo_qr_usuario, id_actividad]);
      return result[0].exists;
    } catch (error) {
      console.error('❌ [AttendanceRepository] Error al verificar asistencia a actividad:', error);
      throw error;
    }
  }
}
