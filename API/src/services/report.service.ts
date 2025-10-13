// =====================================================
// Servicio de Reportes
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { ReportRepository } from '../repositories/report.repository';
import {
  AttendanceReportFilters,
  AttendanceReportResponse,
  StatisticsFilters,
  StatisticsResponse,
  RegistrationReportFilters,
  RegistrationReportResponse,
  ActivityReportResponse,
  SchoolReportResponse,
  MostActiveUsersResponse,
  DiplomaReportResponse,
  CompetitionResultsResponse
} from '../types/report.types';

export class ReportService {
  private reportRepository: ReportRepository;

  constructor() {
    this.reportRepository = new ReportRepository();
  }

  // =====================================================
  // REPORTES DE ASISTENCIA
  // =====================================================

  /**
   * Genera reporte de asistencia general al congreso
   */
  async generateGeneralAttendanceReport(filters: AttendanceReportFilters): Promise<AttendanceReportResponse> {
    try {
      const reportFilters: AttendanceReportFilters = {
        ...filters,
        tipo_reporte: 'general'
      };

      return await this.reportRepository.generateAttendanceReport(reportFilters);
    } catch (error) {
      console.error('❌ Service: Error en generateGeneralAttendanceReport:', error);
      throw new Error('Error al generar reporte de asistencia general');
    }
  }

  /**
   * Genera reporte de asistencia a actividades específicas
   */
  async generateActivityAttendanceReport(filters: AttendanceReportFilters): Promise<AttendanceReportResponse> {
    try {
      const reportFilters: AttendanceReportFilters = {
        ...filters,
        tipo_reporte: 'actividades'
      };

      return await this.reportRepository.generateAttendanceReport(reportFilters);
    } catch (error) {
      console.error('❌ Service: Error en generateActivityAttendanceReport:', error);
      throw new Error('Error al generar reporte de asistencia a actividades');
    }
  }

  /**
   * Genera reporte completo de asistencia (general + actividades)
   */
  async generateCompleteAttendanceReport(filters: AttendanceReportFilters): Promise<AttendanceReportResponse> {
    try {
      const reportFilters: AttendanceReportFilters = {
        ...filters,
        tipo_reporte: 'completo'
      };

      return await this.reportRepository.generateAttendanceReport(reportFilters);
    } catch (error) {
      console.error('❌ Service: Error en generateCompleteAttendanceReport:', error);
      throw new Error('Error al generar reporte completo de asistencia');
    }
  }

  // =====================================================
  // ESTADÍSTICAS DEL SISTEMA
  // =====================================================

  /**
   * Obtiene estadísticas completas del sistema
   */
  async getCompleteStatistics(filters?: StatisticsFilters): Promise<StatisticsResponse> {
    try {
      const reportFilters: StatisticsFilters = {
        ...filters,
        tipo_estadisticas: 'completo'
      };

      return await this.reportRepository.getSystemStatistics(reportFilters);
    } catch (error) {
      console.error('❌ Service: Error en getCompleteStatistics:', error);
      throw new Error('Error al obtener estadísticas completas del sistema');
    }
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  async getUserStatistics(filters?: StatisticsFilters): Promise<StatisticsResponse> {
    try {
      const reportFilters: StatisticsFilters = {
        ...filters,
        tipo_estadisticas: 'usuarios'
      };

      return await this.reportRepository.getSystemStatistics(reportFilters);
    } catch (error) {
      console.error('❌ Service: Error en getUserStatistics:', error);
      throw new Error('Error al obtener estadísticas de usuarios');
    }
  }

  /**
   * Obtiene estadísticas de actividades
   */
  async getActivityStatistics(filters?: StatisticsFilters): Promise<StatisticsResponse> {
    try {
      const reportFilters: StatisticsFilters = {
        ...filters,
        tipo_estadisticas: 'actividades'
      };

      return await this.reportRepository.getSystemStatistics(reportFilters);
    } catch (error) {
      console.error('❌ Service: Error en getActivityStatistics:', error);
      throw new Error('Error al obtener estadísticas de actividades');
    }
  }

  /**
   * Obtiene estadísticas de asistencias
   */
  async getAttendanceStatistics(filters?: StatisticsFilters): Promise<StatisticsResponse> {
    try {
      const reportFilters: StatisticsFilters = {
        ...filters,
        tipo_estadisticas: 'asistencias'
      };

      return await this.reportRepository.getSystemStatistics(reportFilters);
    } catch (error) {
      console.error('❌ Service: Error en getAttendanceStatistics:', error);
      throw new Error('Error al obtener estadísticas de asistencias');
    }
  }

  /**
   * Obtiene estadísticas de administradores
   */
  async getAdminStatistics(filters?: StatisticsFilters): Promise<StatisticsResponse> {
    try {
      const reportFilters: StatisticsFilters = {
        ...filters,
        tipo_estadisticas: 'administradores'
      };

      return await this.reportRepository.getSystemStatistics(reportFilters);
    } catch (error) {
      console.error('❌ Service: Error en getAdminStatistics:', error);
      throw new Error('Error al obtener estadísticas de administradores');
    }
  }

  // =====================================================
  // REPORTES DE INSCRIPCIONES
  // =====================================================

  /**
   * Obtiene reporte de inscripciones con filtros
   */
  async getRegistrationReport(filters: RegistrationReportFilters): Promise<RegistrationReportResponse> {
    try {
      return await this.reportRepository.getRegistrationReport(filters);
    } catch (error) {
      console.error('❌ Service: Error en getRegistrationReport:', error);
      throw new Error('Error al obtener reporte de inscripciones');
    }
  }

  /**
   * Obtiene reporte de inscripciones por actividad específica
   */
  async getRegistrationReportByActivity(idActividad: number, filters?: RegistrationReportFilters): Promise<RegistrationReportResponse> {
    try {
      const reportFilters: RegistrationReportFilters = {
        ...filters,
        id_actividad: idActividad
      };

      return await this.reportRepository.getRegistrationReport(reportFilters);
    } catch (error) {
      console.error('❌ Service: Error en getRegistrationReportByActivity:', error);
      throw new Error('Error al obtener reporte de inscripciones por actividad');
    }
  }

  /**
   * Obtiene reporte de inscripciones confirmadas
   */
  async getConfirmedRegistrationsReport(filters?: RegistrationReportFilters): Promise<RegistrationReportResponse> {
    try {
      const reportFilters: RegistrationReportFilters = {
        ...filters,
        estado_inscripcion: 'confirmada'
      };

      return await this.reportRepository.getRegistrationReport(reportFilters);
    } catch (error) {
      console.error('❌ Service: Error en getConfirmedRegistrationsReport:', error);
      throw new Error('Error al obtener reporte de inscripciones confirmadas');
    }
  }

  // =====================================================
  // REPORTES DE ACTIVIDADES
  // =====================================================

  /**
   * Obtiene reporte de actividades con estadísticas de asistencia
   */
  async getActivityReport(): Promise<ActivityReportResponse> {
    try {
      return await this.reportRepository.getActivityReport();
    } catch (error) {
      console.error('❌ Service: Error en getActivityReport:', error);
      throw new Error('Error al obtener reporte de actividades');
    }
  }

  // =====================================================
  // REPORTES POR COLEGIO
  // =====================================================

  /**
   * Obtiene reporte de usuarios agrupados por colegio
   */
  async getSchoolReport(): Promise<SchoolReportResponse> {
    try {
      return await this.reportRepository.getSchoolReport();
    } catch (error) {
      console.error('❌ Service: Error en getSchoolReport:', error);
      throw new Error('Error al obtener reporte por colegios');
    }
  }

  // =====================================================
  // REPORTES DE USUARIOS MÁS ACTIVOS
  // =====================================================

  /**
   * Obtiene reporte de usuarios con mayor participación
   */
  async getMostActiveUsersReport(): Promise<MostActiveUsersResponse> {
    try {
      return await this.reportRepository.getMostActiveUsersReport();
    } catch (error) {
      console.error('❌ Service: Error en getMostActiveUsersReport:', error);
      throw new Error('Error al obtener reporte de usuarios más activos');
    }
  }

  // =====================================================
  // REPORTES DE DIPLOMAS
  // =====================================================

  /**
   * Obtiene reporte de diplomas generados
   */
  async getDiplomaReport(): Promise<DiplomaReportResponse> {
    try {
      return await this.reportRepository.getDiplomaReport();
    } catch (error) {
      console.error('❌ Service: Error en getDiplomaReport:', error);
      throw new Error('Error al obtener reporte de diplomas');
    }
  }

  // =====================================================
  // REPORTES DE RESULTADOS DE COMPETENCIAS
  // =====================================================

  /**
   * Obtiene reporte de resultados de competencias
   */
  async getCompetitionResultsReport(): Promise<CompetitionResultsResponse> {
    try {
      return await this.reportRepository.getCompetitionResultsReport();
    } catch (error) {
      console.error('❌ Service: Error en getCompetitionResultsReport:', error);
      throw new Error('Error al obtener reporte de resultados de competencias');
    }
  }

  // =====================================================
  // MÉTODOS DE UTILIDAD
  // =====================================================


}
