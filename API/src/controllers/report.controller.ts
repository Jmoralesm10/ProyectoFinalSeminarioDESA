// =====================================================
// Controlador de Reportes
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { Request, Response } from 'express';
import { ReportService } from '../services/report.service';
import {
  AttendanceReportFilters,
  StatisticsFilters,
  RegistrationReportFilters
} from '../types/report.types';

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  // =====================================================
  // REPORTES DE ASISTENCIA
  // =====================================================

  /**
   * GET /api/reports/attendance/general
   * Genera reporte de asistencia general al congreso
   */
  async generateGeneralAttendanceReport(req: Request, res: Response): Promise<void> {
    try {
      const filters: AttendanceReportFilters = {
        fecha_desde: req.query['fecha_desde'] as string | undefined,
        fecha_hasta: req.query['fecha_hasta'] as string | undefined,
        limite: req.query['limite'] ? parseInt(req.query['limite'] as string) : undefined,
        offset: req.query['offset'] ? parseInt(req.query['offset'] as string) : undefined
      };

      const result = await this.reportService.generateGeneralAttendanceReport(filters);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Controller: Error en generateGeneralAttendanceReport:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al generar reporte de asistencia general',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /api/reports/attendance/activities
   * Genera reporte de asistencia a actividades específicas
   */
  async generateActivityAttendanceReport(req: Request, res: Response): Promise<void> {
    try {
      const filters: AttendanceReportFilters = {
        fecha_desde: req.query['fecha_desde'] as string | undefined,
        fecha_hasta: req.query['fecha_hasta'] as string | undefined,
        id_actividad: req.query['id_actividad'] ? parseInt(req.query['id_actividad'] as string) : undefined,
        limite: req.query['limite'] ? parseInt(req.query['limite'] as string) : undefined,
        offset: req.query['offset'] ? parseInt(req.query['offset'] as string) : undefined
      };

      const result = await this.reportService.generateActivityAttendanceReport(filters);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Controller: Error en generateActivityAttendanceReport:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al generar reporte de asistencia a actividades',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /api/reports/attendance/complete
   * Genera reporte completo de asistencia (general + actividades)
   */
  async generateCompleteAttendanceReport(req: Request, res: Response): Promise<void> {
    try {
      const filters: AttendanceReportFilters = {
        fecha_desde: req.query['fecha_desde'] as string | undefined,
        fecha_hasta: req.query['fecha_hasta'] as string | undefined,
        id_actividad: req.query['id_actividad'] ? parseInt(req.query['id_actividad'] as string) : undefined,
        limite: req.query['limite'] ? parseInt(req.query['limite'] as string) : undefined,
        offset: req.query['offset'] ? parseInt(req.query['offset'] as string) : undefined
      };

      const result = await this.reportService.generateCompleteAttendanceReport(filters);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Controller: Error en generateCompleteAttendanceReport:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al generar reporte completo de asistencia',
        timestamp: new Date().toISOString()
      });
    }
  }

  // =====================================================
  // ESTADÍSTICAS DEL SISTEMA
  // =====================================================

  /**
   * GET /api/reports/statistics/complete
   * Obtiene estadísticas completas del sistema
   */
  async getCompleteStatistics(req: Request, res: Response): Promise<void> {
    try {
      const filters: StatisticsFilters = {
        fecha_desde: req.query['fecha_desde'] as string | undefined,
        fecha_hasta: req.query['fecha_hasta'] as string | undefined
      };

      const result = await this.reportService.getCompleteStatistics(filters);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Controller: Error en getCompleteStatistics:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener estadísticas completas',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /api/reports/statistics/users
   * Obtiene estadísticas de usuarios
   */
  async getUserStatistics(req: Request, res: Response): Promise<void> {
    try {
      const filters: StatisticsFilters = {
        fecha_desde: req.query['fecha_desde'] as string | undefined,
        fecha_hasta: req.query['fecha_hasta'] as string | undefined
      };

      const result = await this.reportService.getUserStatistics(filters);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Controller: Error en getUserStatistics:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener estadísticas de usuarios',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /api/reports/statistics/activities
   * Obtiene estadísticas de actividades
   */
  async getActivityStatistics(req: Request, res: Response): Promise<void> {
    try {
      const filters: StatisticsFilters = {
        fecha_desde: req.query['fecha_desde'] as string | undefined,
        fecha_hasta: req.query['fecha_hasta'] as string | undefined
      };

      const result = await this.reportService.getActivityStatistics(filters);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Controller: Error en getActivityStatistics:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener estadísticas de actividades',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /api/reports/statistics/attendance
   * Obtiene estadísticas de asistencias
   */
  async getAttendanceStatistics(req: Request, res: Response): Promise<void> {
    try {
      const filters: StatisticsFilters = {
        fecha_desde: req.query['fecha_desde'] as string | undefined,
        fecha_hasta: req.query['fecha_hasta'] as string | undefined
      };

      const result = await this.reportService.getAttendanceStatistics(filters);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Controller: Error en getAttendanceStatistics:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener estadísticas de asistencias',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /api/reports/statistics/admins
   * Obtiene estadísticas de administradores
   */
  async getAdminStatistics(req: Request, res: Response): Promise<void> {
    try {
      const filters: StatisticsFilters = {
        fecha_desde: req.query['fecha_desde'] as string | undefined,
        fecha_hasta: req.query['fecha_hasta'] as string | undefined
      };

      const result = await this.reportService.getAdminStatistics(filters);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Controller: Error en getAdminStatistics:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener estadísticas de administradores',
        timestamp: new Date().toISOString()
      });
    }
  }

  // =====================================================
  // REPORTES DE INSCRIPCIONES
  // =====================================================

  /**
   * GET /api/reports/registrations
   * Obtiene reporte de inscripciones con filtros
   */
  async getRegistrationReport(req: Request, res: Response): Promise<void> {
    try {
      const filters: RegistrationReportFilters = {
        fecha_desde: req.query['fecha_desde'] as string | undefined,
        fecha_hasta: req.query['fecha_hasta'] as string | undefined,
        id_actividad: req.query['id_actividad'] ? parseInt(req.query['id_actividad'] as string) : undefined,
        estado_inscripcion: req.query['estado_inscripcion'] as 'confirmada' | 'pendiente' | 'cancelada' | undefined,
        limite: req.query['limite'] ? parseInt(req.query['limite'] as string) : undefined,
        offset: req.query['offset'] ? parseInt(req.query['offset'] as string) : undefined
      };

      const result = await this.reportService.getRegistrationReport(filters);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Controller: Error en getRegistrationReport:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener reporte de inscripciones',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /api/reports/registrations/activity/:id
   * Obtiene reporte de inscripciones por actividad específica
   */
  async getRegistrationReportByActivity(req: Request, res: Response): Promise<void> {
    try {
      const idActividad = parseInt(req.params['id'] || '0');
      
      if (isNaN(idActividad)) {
        res.status(400).json({
          success: false,
          message: 'ID de actividad inválido',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const filters: RegistrationReportFilters = {
        fecha_desde: req.query['fecha_desde'] as string | undefined,
        fecha_hasta: req.query['fecha_hasta'] as string | undefined,
        estado_inscripcion: req.query['estado_inscripcion'] as 'confirmada' | 'pendiente' | 'cancelada' | undefined,
        limite: req.query['limite'] ? parseInt(req.query['limite'] as string) : undefined,
        offset: req.query['offset'] ? parseInt(req.query['offset'] as string) : undefined
      };

      const result = await this.reportService.getRegistrationReportByActivity(idActividad, filters);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Controller: Error en getRegistrationReportByActivity:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener reporte de inscripciones por actividad',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /api/reports/registrations/confirmed
   * Obtiene reporte de inscripciones confirmadas
   */
  async getConfirmedRegistrationsReport(req: Request, res: Response): Promise<void> {
    try {
      const filters: RegistrationReportFilters = {
        fecha_desde: req.query['fecha_desde'] as string | undefined,
        fecha_hasta: req.query['fecha_hasta'] as string | undefined,
        limite: req.query['limite'] ? parseInt(req.query['limite'] as string) : undefined,
        offset: req.query['offset'] ? parseInt(req.query['offset'] as string) : undefined
      };

      const result = await this.reportService.getConfirmedRegistrationsReport(filters);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Controller: Error en getConfirmedRegistrationsReport:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener reporte de inscripciones confirmadas',
        timestamp: new Date().toISOString()
      });
    }
  }

  // =====================================================
  // REPORTES DE ACTIVIDADES
  // =====================================================

  /**
   * GET /api/reports/activities
   * Obtiene reporte de actividades con estadísticas de asistencia
   */
  async getActivityReport(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.reportService.getActivityReport();
      
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Controller: Error en getActivityReport:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener reporte de actividades',
        timestamp: new Date().toISOString()
      });
    }
  }

  // =====================================================
  // REPORTES POR COLEGIO
  // =====================================================

  /**
   * GET /api/reports/schools
   * Obtiene reporte de usuarios agrupados por colegio
   */
  async getSchoolReport(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.reportService.getSchoolReport();
      
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Controller: Error en getSchoolReport:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener reporte por colegios',
        timestamp: new Date().toISOString()
      });
    }
  }

  // =====================================================
  // REPORTES DE USUARIOS MÁS ACTIVOS
  // =====================================================

  /**
   * GET /api/reports/users/most-active
   * Obtiene reporte de usuarios con mayor participación
   */
  async getMostActiveUsersReport(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.reportService.getMostActiveUsersReport();
      
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Controller: Error en getMostActiveUsersReport:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener reporte de usuarios más activos',
        timestamp: new Date().toISOString()
      });
    }
  }

  // =====================================================
  // REPORTES DE DIPLOMAS
  // =====================================================

  /**
   * GET /api/reports/diplomas
   * Obtiene reporte de diplomas generados
   */
  async getDiplomaReport(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.reportService.getDiplomaReport();
      
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Controller: Error en getDiplomaReport:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener reporte de diplomas',
        timestamp: new Date().toISOString()
      });
    }
  }

  // =====================================================
  // REPORTES DE RESULTADOS DE COMPETENCIAS
  // =====================================================

  /**
   * GET /api/reports/competitions/results
   * Obtiene reporte de resultados de competencias
   */
  async getCompetitionResultsReport(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.reportService.getCompetitionResultsReport();
      
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Controller: Error en getCompetitionResultsReport:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener reporte de resultados de competencias',
        timestamp: new Date().toISOString()
      });
    }
  }
}
