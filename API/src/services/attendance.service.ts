// =====================================================
// Servicio de asistencia
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { AttendanceRepository } from '../repositories/attendance.repository';
import { executeQuery } from '../config/database';
import {
  RegisterGeneralAttendanceDto,
  RegisterActivityAttendanceDto,
  QueryUserAttendanceDto,
  GeneralAttendanceResponse,
  ActivityAttendanceResponse,
  UserAttendanceResponse,
  AttendanceStatsResponse
} from '../types/attendance.types';

export class AttendanceService {
  private attendanceRepository: AttendanceRepository;

  constructor() {
    this.attendanceRepository = new AttendanceRepository();
  }

  /**
   * Registra la asistencia general de un usuario al congreso
   */
  async registerGeneralAttendance(data: RegisterGeneralAttendanceDto): Promise<GeneralAttendanceResponse> {
    try {
      console.log('🎯 [AttendanceService] Procesando registro de asistencia general:', data);

      // Validar datos de entrada
      if (!data.codigo_qr_usuario || data.codigo_qr_usuario.trim() === '') {
        return {
          success: false,
          message: 'El código QR es requerido'
        };
      }

      // Registrar asistencia usando el repositorio
      const result = await this.attendanceRepository.registerGeneralAttendance(data);
      
      console.log('🎯 [AttendanceService] Resultado del registro:', result);
      
      return result;
    } catch (error) {
      console.error('❌ [AttendanceService] Error al registrar asistencia general:', error);
      return {
        success: false,
        message: 'Error interno del servidor al registrar asistencia'
      };
    }
  }

  /**
   * Registra la asistencia de un usuario a una actividad específica
   */
  async registerActivityAttendance(data: RegisterActivityAttendanceDto): Promise<ActivityAttendanceResponse> {
    try {
      console.log('🎯 [AttendanceService] Procesando registro de asistencia a actividad:', data);

      // Validar datos de entrada
      if (!data.codigo_qr_usuario || data.codigo_qr_usuario.trim() === '') {
        return {
          success: false,
          message: 'El código QR es requerido'
        };
      }

      if (!data.id_actividad || data.id_actividad <= 0) {
        return {
          success: false,
          message: 'El ID de actividad es requerido y debe ser válido'
        };
      }

      // Registrar asistencia usando el repositorio
      const result = await this.attendanceRepository.registerActivityAttendance(data);
      
      console.log('🎯 [AttendanceService] Resultado del registro a actividad:', result);
      
      return result;
    } catch (error) {
      console.error('❌ [AttendanceService] Error al registrar asistencia a actividad:', error);
      return {
        success: false,
        message: 'Error interno del servidor al registrar asistencia a actividad'
      };
    }
  }

  /**
   * Consulta el historial de asistencia de un usuario
   */
  async getUserAttendance(data: QueryUserAttendanceDto): Promise<UserAttendanceResponse> {
    try {
      console.log('🎯 [AttendanceService] Consultando asistencia de usuario:', data);

      // Validar que al menos uno de los parámetros de identificación esté presente
      if ((!data.codigo_qr_usuario || data.codigo_qr_usuario.trim() === '') && !data.id_usuario) {
        return {
          success: false,
          message: 'Debe proporcionar código QR o ID de usuario',
          records: [],
          total_records: 0
        };
      }

      // Consultar asistencia usando el repositorio
      const records = await this.attendanceRepository.getUserAttendance(data);
      
      console.log('🎯 [AttendanceService] Registros encontrados:', records.length);
      
      // Verificar si hay registros
      if (records.length === 0) {
        return {
          success: true,
          message: 'No se encontraron registros de asistencia',
          records: [],
          total_records: 0
        };
      }

      // Verificar si el primer registro indica error
      if (records.length > 0 && !records[0]?.success) {
        return {
          success: false,
          message: records[0]?.message || 'Error desconocido',
          records: [],
          total_records: 0
        };
      }

      return {
        success: true,
        message: 'Consulta exitosa',
        records: records,
        total_records: records.length
      };
    } catch (error) {
      console.error('❌ [AttendanceService] Error al consultar asistencia:', error);
      return {
        success: false,
        message: 'Error interno del servidor al consultar asistencia',
        records: [],
        total_records: 0
      };
    }
  }

  /**
   * Obtiene estadísticas de asistencia
   */
  async getAttendanceStats(): Promise<AttendanceStatsResponse> {
    try {
      console.log('🎯 [AttendanceService] Obteniendo estadísticas de asistencia');

      const stats = await this.attendanceRepository.getAttendanceStats();
      
      console.log('🎯 [AttendanceService] Estadísticas obtenidas:', stats);
      
      return {
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        stats: stats
      };
    } catch (error) {
      console.error('❌ [AttendanceService] Error al obtener estadísticas:', error);
      return {
        success: false,
        message: 'Error interno del servidor al obtener estadísticas'
      };
    }
  }

  /**
   * Verifica si un usuario ya asistió al congreso hoy
   */
  async checkTodayGeneralAttendance(codigo_qr_usuario: string): Promise<{ success: boolean; message: string; already_attended?: boolean }> {
    try {
      console.log('🎯 [AttendanceService] Verificando asistencia de hoy:', codigo_qr_usuario);

      if (!codigo_qr_usuario || codigo_qr_usuario.trim() === '') {
        return {
          success: false,
          message: 'El código QR es requerido'
        };
      }

      const alreadyAttended = await this.attendanceRepository.checkTodayGeneralAttendance(codigo_qr_usuario);
      
      return {
        success: true,
        message: alreadyAttended ? 'El usuario ya asistió hoy' : 'El usuario no ha asistido hoy',
        already_attended: alreadyAttended
      };
    } catch (error) {
      console.error('❌ [AttendanceService] Error al verificar asistencia de hoy:', error);
      return {
        success: false,
        message: 'Error interno del servidor al verificar asistencia'
      };
    }
  }

  /**
   * Verifica si un usuario ya asistió a una actividad específica
   */
  async checkActivityAttendance(codigo_qr_usuario: string, id_actividad: number): Promise<{ success: boolean; message: string; already_attended?: boolean }> {
    try {
      console.log('🎯 [AttendanceService] Verificando asistencia a actividad:', { codigo_qr_usuario, id_actividad });

      if (!codigo_qr_usuario || codigo_qr_usuario.trim() === '') {
        return {
          success: false,
          message: 'El código QR es requerido'
        };
      }

      if (!id_actividad || id_actividad <= 0) {
        return {
          success: false,
          message: 'El ID de actividad es requerido y debe ser válido'
        };
      }

      const alreadyAttended = await this.attendanceRepository.checkActivityAttendance(codigo_qr_usuario, id_actividad);
      
      return {
        success: true,
        message: alreadyAttended ? 'El usuario ya asistió a esta actividad' : 'El usuario no ha asistido a esta actividad',
        already_attended: alreadyAttended
      };
    } catch (error) {
      console.error('❌ [AttendanceService] Error al verificar asistencia a actividad:', error);
      return {
        success: false,
        message: 'Error interno del servidor al verificar asistencia'
      };
    }
  }

  /**
   * Obtiene resumen de asistencia para el día actual
   */
  async getTodayAttendanceSummary(): Promise<{ success: boolean; message: string; summary?: any }> {
    try {
      console.log('🎯 [AttendanceService] Obteniendo resumen de asistencia de hoy');

      const query = `
        SELECT 
          COUNT(DISTINCT ag.id_usuario) as usuarios_asistieron_hoy,
          COUNT(DISTINCT aa.id_usuario) as usuarios_actividades_hoy,
          (SELECT COUNT(*) FROM tb_usuarios WHERE estado_usuario = true) as total_usuarios_registrados
        FROM tb_asistencia_general ag
        FULL OUTER JOIN tb_asistencia_actividad aa ON ag.id_usuario = aa.id_usuario 
          AND DATE(ag.fecha_asistencia) = CURRENT_DATE 
          AND DATE(aa.fecha_asistencia) = CURRENT_DATE
        WHERE DATE(ag.fecha_asistencia) = CURRENT_DATE OR DATE(aa.fecha_asistencia) = CURRENT_DATE
      `;

      const result = await executeQuery(query);
      const summary = result[0];
      
      return {
        success: true,
        message: 'Resumen obtenido exitosamente',
        summary: {
          usuarios_asistieron_hoy: parseInt(summary.usuarios_asistieron_hoy) || 0,
          usuarios_actividades_hoy: parseInt(summary.usuarios_actividades_hoy) || 0,
          total_usuarios_registrados: parseInt(summary.total_usuarios_registrados) || 0,
          porcentaje_asistencia_hoy: summary.total_usuarios_registrados > 0 
            ? Math.round(((parseInt(summary.usuarios_asistieron_hoy) || 0) / summary.total_usuarios_registrados) * 100)
            : 0
        }
      };
    } catch (error) {
      console.error('❌ [AttendanceService] Error al obtener resumen de hoy:', error);
      return {
        success: false,
        message: 'Error interno del servidor al obtener resumen'
      };
    }
  }
}
