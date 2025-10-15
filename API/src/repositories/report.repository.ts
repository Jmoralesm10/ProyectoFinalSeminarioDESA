// =====================================================
// Repositorio de Reportes
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { executeStoredProcedure, executeQuery } from '../config/database';
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

export class ReportRepository {

  // =====================================================
  // REPORTES DE ASISTENCIA
  // =====================================================

  /**
   * Genera reporte de asistencia usando sp_generar_reporte_asistencia
   */
  async generateAttendanceReport(filters: AttendanceReportFilters): Promise<AttendanceReportResponse> {
    try {
      const result = await executeStoredProcedure('sp_generar_reporte_asistencia', [
        filters.tipo_reporte || 'general',           // p_tipo_reporte
        filters.fecha_desde || null,                 // p_fecha_desde
        filters.fecha_hasta || null,                 // p_fecha_hasta
        filters.id_actividad || null,                // p_id_actividad
        filters.limite || 1000,                      // p_limite
        filters.offset || 0                          // p_offset
      ]);

      if (result && result.length > 0) {
        const firstRecord = result[0];
        const registros = result.map((record: any) => ({
          id_usuario: record.id_usuario,
          nombre_completo: record.nombre_completo,
          email_usuario: record.email_usuario,
          tipo_usuario: record.tipo_usuario,
          fecha_asistencia: record.fecha_asistencia,
          hora_asistencia: record.hora_asistencia,
          id_actividad: record.id_actividad,
          nombre_actividad: record.nombre_actividad,
          tipo_actividad: record.tipo_actividad,
          lugar_actividad: record.lugar_actividad,
          categoria_actividad: record.categoria_actividad
        }));

        return {
          success: true,
          message: 'Reporte de asistencia generado exitosamente',
          timestamp: new Date().toISOString(),
          data: {
            tipo_reporte: firstRecord.tipo_reporte,
            total_registros: firstRecord.total_registros,
            fecha_desde: firstRecord.fecha_desde,
            fecha_hasta: firstRecord.fecha_hasta,
            registros,
            paginacion: {
              pagina_actual: Math.floor((filters.offset || 0) / (filters.limite || 1000)) + 1,
              total_paginas: Math.ceil(firstRecord.total_registros / (filters.limite || 1000)),
              limite: filters.limite || 1000,
              offset: filters.offset || 0
            }
          }
        };
      }

      return {
        success: false,
        message: 'No se encontraron registros de asistencia',
        timestamp: new Date().toISOString(),
        data: {
          tipo_reporte: filters.tipo_reporte || 'general',
          total_registros: 0,
          fecha_desde: filters.fecha_desde || '',
          fecha_hasta: filters.fecha_hasta || '',
          registros: [],
          paginacion: {
            pagina_actual: 1,
            total_paginas: 0,
            limite: filters.limite || 1000,
            offset: filters.offset || 0
          }
        }
      };
    } catch (error) {
      console.error('❌ Repository: Error en generateAttendanceReport:', error);
      throw new Error('Error al generar reporte de asistencia');
    }
  }

  // =====================================================
  // ESTADÍSTICAS DEL SISTEMA
  // =====================================================

  /**
   * Consulta estadísticas del sistema usando sp_consultar_estadisticas_usuarios
   */
  async getSystemStatistics(filters: StatisticsFilters): Promise<StatisticsResponse> {
    try {
      // Siempre obtener estadísticas completas para evitar objetos vacíos
      const result = await executeStoredProcedure('sp_consultar_estadisticas_usuarios', [
        filters.fecha_desde || null,                 // p_fecha_desde
        filters.fecha_hasta || null,                 // p_fecha_hasta
        'completo'                                   // Siempre obtener estadísticas completas
      ]);

      if (result && result.length > 0) {
        const data = result[0];
        
        // Filtrar las secciones según el tipo solicitado
        const responseData: any = {
          estadisticas_generales: data.estadisticas_generales || {
            fecha_consulta: new Date().toISOString(),
            periodo_consulta: {
              desde: filters.fecha_desde || '',
              hasta: filters.fecha_hasta || ''
            },
            sistema_info: {
              version: '1.0.0',
              ultima_actualizacion: new Date().toISOString()
            }
          }
        };

        // Solo incluir las secciones solicitadas
        const tipoSolicitado = filters.tipo_estadisticas || 'completo';
        
        if (tipoSolicitado === 'completo' || tipoSolicitado === 'usuarios') {
          responseData.estadisticas_usuarios = data.estadisticas_usuarios || {
            total_usuarios: 0,
            usuarios_activos: 0,
            usuarios_inactivos: 0,
            usuarios_por_tipo: {},
            usuarios_por_colegio: {},
            emails_verificados: 0,
            emails_no_verificados: 0
          };
        }
        
        if (tipoSolicitado === 'completo' || tipoSolicitado === 'actividades') {
          responseData.estadisticas_actividades = data.estadisticas_actividades || {
            total_actividades: 0,
            actividades_activas: 0,
            total_inscripciones: 0,
            inscripciones_confirmadas: 0,
            inscripciones_pendientes: 0,
            actividades_por_tipo: {},
            actividades_mas_populares: []
          };
        }
        
        if (tipoSolicitado === 'completo' || tipoSolicitado === 'asistencias') {
          responseData.estadisticas_asistencias = data.estadisticas_asistencias || {
            total_asistencias_generales: 0,
            total_asistencias_actividades: 0,
            usuarios_con_asistencia: 0,
            asistencias_por_dia: {},
            actividades_con_mas_asistencia: []
          };
        }
        
        if (tipoSolicitado === 'completo' || tipoSolicitado === 'administradores') {
          responseData.estadisticas_administradores = data.estadisticas_administradores || {
            total_administradores: 0,
            administradores_activos: 0,
            administradores_por_rol: {},
            permisos_mas_comunes: {}
          };
        }
        
        if (tipoSolicitado === 'completo') {
          responseData.tendencias = data.tendencias || {
            crecimiento_usuarios: {
              periodo_actual: 0,
              periodo_anterior: 0,
              porcentaje_cambio: 0
            },
            actividad_reciente: {
              usuarios_activos_ultimos_7_dias: 0,
              inscripciones_ultimos_7_dias: 0
            }
          };
        }
        
        return {
          success: true,
          message: 'Estadísticas consultadas exitosamente',
          timestamp: new Date().toISOString(),
          data: responseData
        };
      }

      // Fallback con datos básicos
      return {
        success: true,
        message: 'Estadísticas consultadas exitosamente (datos básicos)',
        timestamp: new Date().toISOString(),
        data: {
          estadisticas_generales: {
            fecha_consulta: new Date().toISOString(),
            periodo_consulta: {
              desde: filters.fecha_desde || '',
              hasta: filters.fecha_hasta || ''
            },
            sistema_info: {
              version: '1.0.0',
              ultima_actualizacion: new Date().toISOString()
            }
          },
          estadisticas_usuarios: {
            total_usuarios: 0,
            usuarios_activos: 0,
            usuarios_inactivos: 0,
            usuarios_por_tipo: {},
            usuarios_por_colegio: {},
            emails_verificados: 0,
            emails_no_verificados: 0
          },
          estadisticas_actividades: {
            total_actividades: 0,
            actividades_activas: 0,
            total_inscripciones: 0,
            inscripciones_confirmadas: 0,
            inscripciones_pendientes: 0,
            actividades_por_tipo: {},
            actividades_mas_populares: []
          },
          estadisticas_asistencias: {
            total_asistencias_generales: 0,
            total_asistencias_actividades: 0,
            usuarios_con_asistencia: 0,
            asistencias_por_dia: {},
            actividades_con_mas_asistencia: []
          },
          estadisticas_administradores: {
            total_administradores: 0,
            administradores_activos: 0,
            administradores_por_rol: {},
            permisos_mas_comunes: {}
          },
          tendencias: {
            crecimiento_usuarios: {
              periodo_actual: 0,
              periodo_anterior: 0,
              porcentaje_cambio: 0
            },
            actividad_reciente: {
              usuarios_activos_ultimos_7_dias: 0,
              inscripciones_ultimos_7_dias: 0
            }
          }
        }
      };
    } catch (error) {
      console.error('❌ Repository: Error en getSystemStatistics:', error);
      throw new Error('Error al consultar estadísticas del sistema');
    }
  }

  // =====================================================
  // REPORTES DE INSCRIPCIONES
  // =====================================================

  /**
   * Obtiene reporte de inscripciones usando vista_inscripciones_completa
   */
  async getRegistrationReport(filters: RegistrationReportFilters): Promise<RegistrationReportResponse> {
    try {
      let query = `
        SELECT 
          id_usuario,
          id_actividad,
          nombre_completo,
          email_usuario,
          codigo_qr_usuario,
          actividad_nombre,
          tipo_actividad,
          fecha_inicio_actividad,
          lugar_actividad,
          categoria_nombre,
          fecha_inscripcion,
          estado_inscripcion,
          observaciones_inscripcion
        FROM vista_inscripciones_completa
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (filters.fecha_desde) {
        query += ` AND fecha_inscripcion >= $${paramIndex}`;
        params.push(filters.fecha_desde);
        paramIndex++;
      }

      if (filters.fecha_hasta) {
        query += ` AND fecha_inscripcion <= $${paramIndex}`;
        params.push(filters.fecha_hasta);
        paramIndex++;
      }

      if (filters.id_actividad) {
        query += ` AND id_actividad = $${paramIndex}`;
        params.push(filters.id_actividad);
        paramIndex++;
      }

      if (filters.estado_inscripcion) {
        query += ` AND estado_inscripcion = $${paramIndex}`;
        params.push(filters.estado_inscripcion);
        paramIndex++;
      }

      // Contar total de registros
      const countQuery = query.replace('SELECT id_usuario, id_actividad, nombre_completo, email_usuario, codigo_qr_usuario, actividad_nombre, tipo_actividad, fecha_inicio_actividad, lugar_actividad, categoria_nombre, fecha_inscripcion, estado_inscripcion, observaciones_inscripcion', 'SELECT COUNT(*) as total');
      const countResult = await executeQuery(countQuery, params);
      const totalRegistros = countResult.rows[0]?.total || 0;

      // Agregar paginación
      query += ` ORDER BY fecha_inscripcion DESC`;
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(filters.limite || 50);
      params.push(filters.offset || 0);

      const result = await executeQuery(query, params);

      const registros = result.rows.map((record: any) => ({
        id_usuario: record.id_usuario,
        id_actividad: record.id_actividad,
        nombre_completo: record.nombre_completo,
        email_usuario: record.email_usuario,
        codigo_qr_usuario: record.codigo_qr_usuario,
        actividad_nombre: record.actividad_nombre,
        tipo_actividad: record.tipo_actividad,
        fecha_inicio_actividad: record.fecha_inicio_actividad,
        lugar_actividad: record.lugar_actividad,
        categoria_nombre: record.categoria_nombre,
        fecha_inscripcion: record.fecha_inscripcion,
        estado_inscripcion: record.estado_inscripcion,
        observaciones_inscripcion: record.observaciones_inscripcion
      }));

      return {
        success: true,
        message: 'Reporte de inscripciones generado exitosamente',
        timestamp: new Date().toISOString(),
        data: {
          total_registros: totalRegistros,
          registros,
          paginacion: {
            pagina_actual: Math.floor((filters.offset || 0) / (filters.limite || 50)) + 1,
            total_paginas: Math.ceil(totalRegistros / (filters.limite || 50)),
            limite: filters.limite || 50,
            offset: filters.offset || 0
          }
        }
      };
    } catch (error) {
      console.error('❌ Repository: Error en getRegistrationReport:', error);
      throw new Error('Error al generar reporte de inscripciones');
    }
  }

  // =====================================================
  // REPORTES DE ACTIVIDADES
  // =====================================================

  /**
   * Obtiene reporte de actividades usando vista_reporte_asistencia_actividad
   */
  async getActivityReport(): Promise<ActivityReportResponse> {
    try {
      const query = `
        SELECT 
          id_actividad,
          nombre_actividad,
          tipo_actividad,
          fecha_inicio_actividad,
          lugar_actividad,
          categoria_nombre,
          total_inscritos,
          total_asistentes,
          porcentaje_asistencia,
          cupo_maximo_actividad,
          cupos_disponibles
        FROM vista_reporte_asistencia_actividad
        ORDER BY total_inscritos DESC
      `;

      const result = await executeQuery(query);

      const actividades = result.rows.map((record: any) => ({
        id_actividad: record.id_actividad,
        nombre_actividad: record.nombre_actividad,
        tipo_actividad: record.tipo_actividad,
        fecha_inicio_actividad: record.fecha_inicio_actividad,
        lugar_actividad: record.lugar_actividad,
        categoria_nombre: record.categoria_nombre,
        total_inscritos: record.total_inscritos,
        total_asistentes: record.total_asistentes,
        porcentaje_asistencia: record.porcentaje_asistencia,
        cupo_maximo_actividad: record.cupo_maximo_actividad,
        cupos_disponibles: record.cupos_disponibles
      }));

      return {
        success: true,
        message: 'Reporte de actividades generado exitosamente',
        timestamp: new Date().toISOString(),
        data: {
          total_actividades: actividades.length,
          actividades
        }
      };
    } catch (error) {
      console.error('❌ Repository: Error en getActivityReport:', error);
      throw new Error('Error al generar reporte de actividades');
    }
  }

  // =====================================================
  // REPORTES POR COLEGIO
  // =====================================================

  /**
   * Obtiene reporte de usuarios por colegio usando vista_reporte_usuarios_por_colegio
   */
  async getSchoolReport(): Promise<SchoolReportResponse> {
    try {
      const query = `
        SELECT 
          colegio,
          total_usuarios,
          usuarios_activos,
          usuarios_externos,
          usuarios_internos,
          emails_verificados,
          total_inscripciones,
          total_asistencias_generales
        FROM vista_reporte_usuarios_por_colegio
        ORDER BY total_usuarios DESC
      `;

      const result = await executeQuery(query);

      const colegios = result.rows.map((record: any) => ({
        colegio: record.colegio,
        total_usuarios: record.total_usuarios,
        usuarios_activos: record.usuarios_activos,
        usuarios_externos: record.usuarios_externos,
        usuarios_internos: record.usuarios_internos,
        emails_verificados: record.emails_verificados,
        total_inscripciones: record.total_inscripciones,
        total_asistencias_generales: record.total_asistencias_generales
      }));

      return {
        success: true,
        message: 'Reporte por colegios generado exitosamente',
        timestamp: new Date().toISOString(),
        data: {
          total_colegios: colegios.length,
          colegios
        }
      };
    } catch (error) {
      console.error('❌ Repository: Error en getSchoolReport:', error);
      throw new Error('Error al generar reporte por colegios');
    }
  }

  // =====================================================
  // REPORTES DE USUARIOS MÁS ACTIVOS
  // =====================================================

  /**
   * Obtiene reporte de usuarios más activos usando vista_usuarios_mas_activos
   */
  async getMostActiveUsersReport(): Promise<MostActiveUsersResponse> {
    try {
      const query = `
        SELECT 
          id_usuario,
          nombre_completo,
          email_usuario,
          nombre_tipo_usuario,
          colegio_usuario,
          total_inscripciones,
          total_asistencias_actividades,
          total_asistencias_generales,
          fecha_inscripcion_usuario,
          ultimo_acceso_usuario
        FROM vista_usuarios_mas_activos
        LIMIT 50
      `;

      const result = await executeQuery(query);

      const usuarios = result.rows.map((record: any) => ({
        id_usuario: record.id_usuario,
        nombre_completo: record.nombre_completo,
        email_usuario: record.email_usuario,
        nombre_tipo_usuario: record.nombre_tipo_usuario,
        colegio_usuario: record.colegio_usuario,
        total_inscripciones: record.total_inscripciones,
        total_asistencias_actividades: record.total_asistencias_actividades,
        total_asistencias_generales: record.total_asistencias_generales,
        fecha_inscripcion_usuario: record.fecha_inscripcion_usuario,
        ultimo_acceso_usuario: record.ultimo_acceso_usuario
      }));

      return {
        success: true,
        message: 'Reporte de usuarios más activos generado exitosamente',
        timestamp: new Date().toISOString(),
        data: {
          total_usuarios: usuarios.length,
          usuarios
        }
      };
    } catch (error) {
      console.error('❌ Repository: Error en getMostActiveUsersReport:', error);
      throw new Error('Error al generar reporte de usuarios más activos');
    }
  }

  // =====================================================
  // REPORTES DE DIPLOMAS
  // =====================================================

  /**
   * Obtiene reporte de diplomas usando vista_diplomas_completa
   */
  async getDiplomaReport(): Promise<DiplomaReportResponse> {
    try {
      const query = `
        SELECT 
          id_usuario,
          id_actividad,
          nombre_completo,
          email_usuario,
          actividad_nombre,
          tipo_actividad,
          tipo_diploma,
          nombre_diploma,
          plantilla_path_diploma,
          archivo_path_diploma,
          fecha_generacion_diploma,
          fecha_descarga_diploma,
          enviado_email_diploma,
          fecha_envio_email_diploma,
          generado_por_nombre,
          observaciones_diploma,
          posicion_resultado,
          puntuacion_resultado,
          tipo_diploma_descripcion
        FROM vista_diplomas_completa
        ORDER BY fecha_generacion_diploma DESC
      `;

      const result = await executeQuery(query);

      const diplomas = result.rows.map((record: any) => ({
        id_usuario: record.id_usuario,
        id_actividad: record.id_actividad,
        nombre_completo: record.nombre_completo,
        email_usuario: record.email_usuario,
        actividad_nombre: record.actividad_nombre,
        tipo_actividad: record.tipo_actividad,
        tipo_diploma: record.tipo_diploma,
        nombre_diploma: record.nombre_diploma,
        plantilla_path_diploma: record.plantilla_path_diploma,
        archivo_path_diploma: record.archivo_path_diploma,
        fecha_generacion_diploma: record.fecha_generacion_diploma,
        fecha_descarga_diploma: record.fecha_descarga_diploma,
        enviado_email_diploma: record.enviado_email_diploma,
        fecha_envio_email_diploma: record.fecha_envio_email_diploma,
        generado_por_nombre: record.generado_por_nombre,
        observaciones_diploma: record.observaciones_diploma,
        posicion_resultado: record.posicion_resultado,
        puntuacion_resultado: record.puntuacion_resultado,
        tipo_diploma_descripcion: record.tipo_diploma_descripcion
      }));

      return {
        success: true,
        message: 'Reporte de diplomas generado exitosamente',
        timestamp: new Date().toISOString(),
        data: {
          total_diplomas: diplomas.length,
          diplomas
        }
      };
    } catch (error) {
      console.error('❌ Repository: Error en getDiplomaReport:', error);
      throw new Error('Error al generar reporte de diplomas');
    }
  }

  // =====================================================
  // REPORTES DE RESULTADOS DE COMPETENCIAS
  // =====================================================

  /**
   * Obtiene reporte de resultados de competencias usando vista_resultados_competencia
   */
  async getCompetitionResultsReport(): Promise<CompetitionResultsResponse> {
    try {
      const query = `
        SELECT 
          id_actividad,
          id_usuario,
          competencia_nombre,
          participante_nombre,
          email_usuario,
          posicion_resultado,
          puntuacion_resultado,
          descripcion_proyecto_resultado,
          foto_proyecto_path_resultado,
          fecha_resultado,
          observaciones_resultado,
          fecha_inicio_actividad,
          lugar_actividad,
          categoria_nombre,
          tiene_diploma_generado
        FROM vista_resultados_competencia
        ORDER BY posicion_resultado ASC, puntuacion_resultado DESC
      `;

      const result = await executeQuery(query);

      const resultados = result.rows.map((record: any) => ({
        id_actividad: record.id_actividad,
        id_usuario: record.id_usuario,
        competencia_nombre: record.competencia_nombre,
        participante_nombre: record.participante_nombre,
        email_usuario: record.email_usuario,
        posicion_resultado: record.posicion_resultado,
        puntuacion_resultado: record.puntuacion_resultado,
        descripcion_proyecto_resultado: record.descripcion_proyecto_resultado,
        foto_proyecto_path_resultado: record.foto_proyecto_path_resultado,
        fecha_resultado: record.fecha_resultado,
        observaciones_resultado: record.observaciones_resultado,
        fecha_inicio_actividad: record.fecha_inicio_actividad,
        lugar_actividad: record.lugar_actividad,
        categoria_nombre: record.categoria_nombre,
        tiene_diploma_generado: record.tiene_diploma_generado
      }));

      return {
        success: true,
        message: 'Reporte de resultados de competencias generado exitosamente',
        timestamp: new Date().toISOString(),
        data: {
          total_resultados: resultados.length,
          resultados
        }
      };
    } catch (error) {
      console.error('❌ Repository: Error en getCompetitionResultsReport:', error);
      throw new Error('Error al generar reporte de resultados de competencias');
    }
  }
}
