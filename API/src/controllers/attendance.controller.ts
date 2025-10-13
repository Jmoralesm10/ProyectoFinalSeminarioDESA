// =====================================================
// Controlador de asistencia
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { Request, Response } from 'express';
import { AttendanceService } from '../services/attendance.service';
import {
  RegisterGeneralAttendanceDto,
  RegisterActivityAttendanceDto,
  QueryUserAttendanceDto
} from '../types/attendance.types';

export class AttendanceController {
  private attendanceService: AttendanceService;

  constructor() {
    this.attendanceService = new AttendanceService();
  }

  /**
   * POST /api/attendance/general
   * Registra la asistencia general de un usuario al congreso
   */
  async registerGeneralAttendance(req: Request, res: Response): Promise<void> {
    try {
      console.log('🎮 [AttendanceController] Registrando asistencia general:', req.body);

      const data: RegisterGeneralAttendanceDto = {
        codigo_qr_usuario: req.body.codigo_qr_usuario
      };

      const result = await this.attendanceService.registerGeneralAttendance(data);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: {
            id_usuario: result.id_usuario,
            nombre_completo: result.nombre_completo,
            fecha_asistencia: result.fecha_asistencia,
            hora_ingreso: result.hora_ingreso
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('❌ [AttendanceController] Error al registrar asistencia general:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * POST /api/attendance/activity
   * Registra la asistencia de un usuario a una actividad específica
   */
  async registerActivityAttendance(req: Request, res: Response): Promise<void> {
    try {
      console.log('🎮 [AttendanceController] Registrando asistencia a actividad:', req.body);

      const data: RegisterActivityAttendanceDto = {
        codigo_qr_usuario: req.body.codigo_qr_usuario,
        id_actividad: parseInt(req.body.id_actividad)
      };

      const result = await this.attendanceService.registerActivityAttendance(data);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: {
            id_usuario: result.id_usuario,
            id_actividad: result.id_actividad,
            nombre_completo: result.nombre_completo,
            nombre_actividad: result.nombre_actividad,
            fecha_asistencia: result.fecha_asistencia
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('❌ [AttendanceController] Error al registrar asistencia a actividad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/attendance/user
   * Consulta el historial de asistencia de un usuario
   */
  async getUserAttendance(req: Request, res: Response): Promise<void> {
    try {
      console.log('🎮 [AttendanceController] Consultando asistencia de usuario:', req.query);

      const data: QueryUserAttendanceDto = {
        codigo_qr_usuario: req.query['codigo_qr_usuario'] as string,
        id_usuario: req.query['id_usuario'] as string,
        fecha_desde: req.query['fecha_desde'] as string,
        fecha_hasta: req.query['fecha_hasta'] as string
      };

      const result = await this.attendanceService.getUserAttendance(data);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: {
            records: result.records,
            total_records: result.total_records
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('❌ [AttendanceController] Error al consultar asistencia:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/attendance/stats
   * Obtiene estadísticas de asistencia
   */
  async getAttendanceStats(_req: Request, res: Response): Promise<void> {
    try {
      console.log('🎮 [AttendanceController] Obteniendo estadísticas de asistencia');

      const result = await this.attendanceService.getAttendanceStats();
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.stats
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('❌ [AttendanceController] Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/attendance/check/general
   * Verifica si un usuario ya asistió al congreso hoy
   */
  async checkTodayGeneralAttendance(req: Request, res: Response): Promise<void> {
    try {
      console.log('🎮 [AttendanceController] Verificando asistencia general de hoy:', req.query);

      const codigo_qr_usuario = req.query['codigo_qr_usuario'] as string;

      if (!codigo_qr_usuario) {
        res.status(400).json({
          success: false,
          message: 'El código QR es requerido'
        });
        return;
      }

      const result = await this.attendanceService.checkTodayGeneralAttendance(codigo_qr_usuario);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: {
            already_attended: result.already_attended
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('❌ [AttendanceController] Error al verificar asistencia general:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/attendance/check/activity
   * Verifica si un usuario ya asistió a una actividad específica
   */
  async checkActivityAttendance(req: Request, res: Response): Promise<void> {
    try {
      console.log('🎮 [AttendanceController] Verificando asistencia a actividad:', req.query);

      const codigo_qr_usuario = req.query['codigo_qr_usuario'] as string;
      const id_actividad = req.query['id_actividad'] as string;

      if (!codigo_qr_usuario) {
        res.status(400).json({
          success: false,
          message: 'El código QR es requerido'
        });
        return;
      }

      if (!id_actividad || isNaN(parseInt(id_actividad))) {
        res.status(400).json({
          success: false,
          message: 'El ID de actividad es requerido y debe ser válido'
        });
        return;
      }

      const result = await this.attendanceService.checkActivityAttendance(
        codigo_qr_usuario, 
        parseInt(id_actividad)
      );
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: {
            already_attended: result.already_attended
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('❌ [AttendanceController] Error al verificar asistencia a actividad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/attendance/summary/today
   * Obtiene resumen de asistencia para el día actual
   */
  async getTodayAttendanceSummary(_req: Request, res: Response): Promise<void> {
    try {
      console.log('🎮 [AttendanceController] Obteniendo resumen de asistencia de hoy');

      const result = await this.attendanceService.getTodayAttendanceSummary();
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.summary
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('❌ [AttendanceController] Error al obtener resumen de hoy:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
