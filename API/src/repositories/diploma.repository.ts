// =====================================================
// Repositorio para diplomas
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { executeQuery } from '../config/database';
import {
  ConsultarDiplomasDto,
  GenerarDiplomasActividadDto,
  GenerarDiplomasCongresoDto,
  RegistrarResultadosCompetenciaDto,
  ConsultarDiplomasResponse,
  GenerarDiplomasResponse,
  RegistrarResultadosResponse,
  ResultadosCompetenciaResponse,
  EstadisticasDiplomasResponse,
  PlantillasDiplomaResponse,
  DiplomaResponse,
  GanadorInfo
} from '../types/diploma.types';

export class DiplomaRepository {
  
  // =====================================================
  // RESULTADOS DE COMPETENCIAS
  // =====================================================

  /**
   * Registrar resultados de una competencia
   */
  async registrarResultadosCompetencia(
    idActividad: number,
    datos: RegistrarResultadosCompetenciaDto,
    registradoPorUsuario: string
  ): Promise<RegistrarResultadosResponse> {
    try {
      // Preparar puntuaciones en formato JSON
      const puntuaciones = datos.puntuaciones ? {
        primer: datos.puntuaciones.primer_lugar || null,
        segundo: datos.puntuaciones.segundo_lugar || null,
        tercer: datos.puntuaciones.tercer_lugar || null
      } : null;

      // Preparar descripciones en formato JSON
      const descripciones = datos.descripciones_proyectos ? {
        primer: datos.descripciones_proyectos.primer_lugar || null,
        segundo: datos.descripciones_proyectos.segundo_lugar || null,
        tercer: datos.descripciones_proyectos.tercer_lugar || null
      } : null;

      const result = await executeQuery(
        'SELECT * FROM sp_registrar_resultados_competencia($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          idActividad,
          registradoPorUsuario,
          datos.primer_lugar_usuario || null,
          datos.segundo_lugar_usuario || null,
          datos.tercer_lugar_usuario || null,
          puntuaciones,
          descripciones,
          datos.observaciones || null
        ]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'No se recibió respuesta del stored procedure',
          total_resultados_registrados: 0,
          detalles_resultados: []
        };
      }

      const firstRow = result.rows[0];
      return {
        success: firstRow.success,
        message: firstRow.message,
        total_resultados_registrados: firstRow.total_resultados_registrados || 0,
        detalles_resultados: firstRow.detalles_resultados || []
      };
    } catch (error) {
      console.error('Error en registrarResultadosCompetencia:', error);
      return {
        success: false,
        message: 'Error al registrar resultados de competencia: ' + (error as Error).message,
        total_resultados_registrados: 0,
        detalles_resultados: []
      };
    }
  }

  /**
   * Consultar resultados de una competencia
   */
  async consultarResultadosCompetencia(idActividad: number): Promise<ResultadosCompetenciaResponse> {
    try {
      const result = await executeQuery(
        'SELECT * FROM vista_resultados_competencia WHERE id_actividad = $1 ORDER BY posicion_resultado',
        [idActividad]
      );

      const actividadResult = await executeQuery(
        'SELECT a.*, ca.nombre_categoria FROM tb_actividades a JOIN tb_categorias_actividad ca ON a.id_categoria = ca.id_categoria WHERE a.id_actividad = $1',
        [idActividad]
      );

      if (actividadResult.rows.length === 0) {
        return {
          success: false,
          message: 'La actividad especificada no existe',
          total_registros: 0,
          resultados: [],
          actividad_info: {
            id_actividad: idActividad,
            nombre_actividad: '',
            tipo_actividad: '',
            fecha_inicio_actividad: '',
            lugar_actividad: '',
            categoria_nombre: ''
          }
        };
      }

      const actividad = actividadResult.rows[0];
      const resultados: GanadorInfo[] = result.rows.map((row: any) => ({
        posicion: row.posicion_resultado,
        usuario_id: row.id_usuario,
        nombre_completo: row.participante_nombre,
        email_usuario: row.email_usuario,
        puntuacion: row.puntuacion_resultado,
        descripcion_proyecto: row.descripcion_proyecto_resultado,
        foto_proyecto_path: row.foto_proyecto_path_resultado,
        fecha_resultado: row.fecha_resultado
      }));

      return {
        success: true,
        message: 'Resultados de competencia obtenidos exitosamente',
        total_registros: resultados.length,
        resultados,
        actividad_info: {
          id_actividad: actividad.id_actividad,
          nombre_actividad: actividad.nombre_actividad,
          tipo_actividad: actividad.tipo_actividad,
          fecha_inicio_actividad: actividad.fecha_inicio_actividad,
          lugar_actividad: actividad.lugar_actividad,
          categoria_nombre: actividad.nombre_categoria
        }
      };
    } catch (error) {
      console.error('Error en consultarResultadosCompetencia:', error);
      return {
        success: false,
        message: 'Error al consultar resultados de competencia: ' + (error as Error).message,
        total_registros: 0,
        resultados: [],
        actividad_info: {
          id_actividad: idActividad,
          nombre_actividad: '',
          tipo_actividad: '',
          fecha_inicio_actividad: '',
          lugar_actividad: '',
          categoria_nombre: ''
        }
      };
    }
  }

  // =====================================================
  // GENERACIÓN DE DIPLOMAS
  // =====================================================

  /**
   * Generar diplomas para una actividad específica
   */
  async generarDiplomasActividad(
    idActividad: number,
    datos: GenerarDiplomasActividadDto,
    generadoPorUsuario: string
  ): Promise<GenerarDiplomasResponse> {
    try {
      const result = await executeQuery(
        'SELECT * FROM sp_generar_diplomas_actividad($1, $2, $3, $4)',
        [
          idActividad,
          generadoPorUsuario,
          datos.incluir_participacion !== false, // Default true
          datos.plantilla_participacion || null
        ]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'No se recibió respuesta del stored procedure',
          total_diplomas_generados: 0,
          detalles_diplomas: []
        };
      }

      const firstRow = result.rows[0];
      return {
        success: firstRow.success,
        message: firstRow.message,
        total_diplomas_generados: firstRow.total_diplomas_generados || 0,
        diplomas_ganadores: firstRow.diplomas_ganadores || 0,
        diplomas_participacion: firstRow.diplomas_participacion || 0,
        detalles_diplomas: firstRow.detalles_diplomas || []
      };
    } catch (error) {
      console.error('Error en generarDiplomasActividad:', error);
      return {
        success: false,
        message: 'Error al generar diplomas de actividad: ' + (error as Error).message,
        total_diplomas_generados: 0,
        detalles_diplomas: []
      };
    }
  }

  /**
   * Generar diplomas del congreso general
   */
  async generarDiplomasCongreso(
    datos: GenerarDiplomasCongresoDto,
    generadoPorUsuario: string
  ): Promise<GenerarDiplomasResponse> {
    try {
      const result = await executeQuery(
        'SELECT * FROM sp_generar_diplomas_congreso($1, $2, $3, $4, $5)',
        [
          generadoPorUsuario,
          datos.fecha_desde || null,
          datos.fecha_hasta || null,
          datos.plantilla_congreso || null,
          datos.solo_usuarios_sin_diploma !== false // Default true
        ]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'No se recibió respuesta del stored procedure',
          total_diplomas_generados: 0,
          detalles_diplomas: []
        };
      }

      const firstRow = result.rows[0];
      return {
        success: firstRow.success,
        message: firstRow.message,
        total_diplomas_generados: firstRow.total_diplomas_generados || 0,
        total_usuarios_con_asistencia: firstRow.total_usuarios_con_asistencia || 0,
        detalles_diplomas: firstRow.detalles_diplomas || []
      };
    } catch (error) {
      console.error('Error en generarDiplomasCongreso:', error);
      return {
        success: false,
        message: 'Error al generar diplomas del congreso: ' + (error as Error).message,
        total_diplomas_generados: 0,
        detalles_diplomas: []
      };
    }
  }

  // =====================================================
  // CONSULTAS DE DIPLOMAS
  // =====================================================

  /**
   * Consultar diplomas con filtros
   */
  async consultarDiplomas(filters: ConsultarDiplomasDto): Promise<ConsultarDiplomasResponse> {
    try {
      const result = await executeQuery(
        'SELECT * FROM sp_consultar_diplomas($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          filters.id_usuario || null,
          filters.id_actividad || null,
          filters.tipo_diploma || null,
          filters.fecha_desde || null,
          filters.fecha_hasta || null,
          filters.solo_no_enviados || false,
          filters.limite || 100,
          filters.offset || 0
        ]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'No se recibió respuesta del stored procedure',
          total_registros: 0,
          diplomas: [],
          pagina_actual: 1,
          total_paginas: 0
        };
      }

      const firstRow = result.rows[0];
      if (!firstRow.success) {
        return {
          success: false,
          message: firstRow.message,
          total_registros: 0,
          diplomas: [],
          pagina_actual: 1,
          total_paginas: 0
        };
      }

      const diplomas: DiplomaResponse[] = result.rows.map((row: any) => ({
        id_diploma: `${row.id_usuario}_${row.id_actividad}_${row.tipo_diploma}`, // ID compuesto
        id_usuario: row.id_usuario,
        nombre_completo: row.nombre_completo,
        email_usuario: row.email_usuario,
        id_actividad: row.id_actividad,
        nombre_actividad: row.nombre_actividad,
        tipo_actividad: row.tipo_actividad,
        tipo_diploma: row.tipo_diploma,
        nombre_diploma: row.nombre_diploma,
        posicion_diploma: row.posicion_diploma,
        plantilla_path_diploma: row.plantilla_path_diploma,
        archivo_path_diploma: row.archivo_path_diploma,
        fecha_generacion_diploma: row.fecha_generacion_diploma,
        fecha_descarga_diploma: row.fecha_descarga_diploma,
        enviado_email_diploma: row.enviado_email_diploma,
        fecha_envio_email_diploma: row.fecha_envio_email_diploma,
        generado_por_nombre: row.generado_por_nombre,
        observaciones_diploma: row.observaciones_diploma
      }));

      const totalRegistros = parseInt(firstRow.total_registros) || 0;
      const limite = filters.limite || 100;
      const totalPaginas = Math.ceil(totalRegistros / limite);
      const paginaActual = Math.floor((filters.offset || 0) / limite) + 1;

      return {
        success: true,
        message: firstRow.message,
        total_registros: totalRegistros,
        diplomas,
        pagina_actual: paginaActual,
        total_paginas: totalPaginas
      };
    } catch (error) {
      console.error('Error en consultarDiplomas:', error);
      return {
        success: false,
        message: 'Error al consultar diplomas: ' + (error as Error).message,
        total_registros: 0,
        diplomas: [],
        pagina_actual: 1,
        total_paginas: 0
      };
    }
  }

  /**
   * Obtener estadísticas de diplomas
   */
  async obtenerEstadisticasDiplomas(): Promise<EstadisticasDiplomasResponse> {
    try {
      const result = await executeQuery('SELECT * FROM vista_estadisticas_diplomas');

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'No se pudieron obtener las estadísticas de diplomas',
          estadisticas: {
            total_diplomas: 0,
            total_primer_lugar: 0,
            total_segundo_lugar: 0,
            total_tercer_lugar: 0,
            total_participacion: 0,
            total_congreso_general: 0,
            total_enviados: 0,
            total_pendientes_envio: 0,
            total_descargados: 0,
            porcentaje_enviados: 0,
            porcentaje_descargados: 0
          }
        };
      }

      const stats = result.rows[0];
      return {
        success: true,
        message: 'Estadísticas de diplomas obtenidas exitosamente',
        estadisticas: {
          total_diplomas: parseInt(stats.total_diplomas) || 0,
          total_primer_lugar: parseInt(stats.total_primer_lugar) || 0,
          total_segundo_lugar: parseInt(stats.total_segundo_lugar) || 0,
          total_tercer_lugar: parseInt(stats.total_tercer_lugar) || 0,
          total_participacion: parseInt(stats.total_participacion) || 0,
          total_congreso_general: parseInt(stats.total_congreso_general) || 0,
          total_enviados: parseInt(stats.total_enviados) || 0,
          total_pendientes_envio: parseInt(stats.total_pendientes_envio) || 0,
          total_descargados: parseInt(stats.total_descargados) || 0,
          porcentaje_enviados: parseFloat(stats.porcentaje_enviados) || 0,
          porcentaje_descargados: parseFloat(stats.porcentaje_descargados) || 0
        }
      };
    } catch (error) {
      console.error('Error en obtenerEstadisticasDiplomas:', error);
      return {
        success: false,
        message: 'Error al obtener estadísticas de diplomas: ' + (error as Error).message,
        estadisticas: {
          total_diplomas: 0,
          total_primer_lugar: 0,
          total_segundo_lugar: 0,
          total_tercer_lugar: 0,
          total_participacion: 0,
          total_congreso_general: 0,
          total_enviados: 0,
          total_pendientes_envio: 0,
          total_descargados: 0,
          porcentaje_enviados: 0,
          porcentaje_descargados: 0
        }
      };
    }
  }

  // =====================================================
  // PLANTILLAS DE DIPLOMAS
  // =====================================================

  /**
   * Obtener plantillas de diplomas disponibles
   */
  async obtenerPlantillasDisponibles(): Promise<PlantillasDiplomaResponse> {
    try {
      // Plantillas predefinidas
      const plantillas = [
        {
          id: 'participacion_generica',
          nombre: 'Participación Genérica',
          tipo: 'participacion' as const,
          descripcion: 'Plantilla genérica para diplomas de participación',
          ruta_plantilla: '/templates/participacion_generica.pdf',
          es_activa: true
        },
        {
          id: 'primer_lugar',
          nombre: 'Primer Lugar',
          tipo: 'primer_lugar' as const,
          descripcion: 'Plantilla especial para primer lugar en competencias',
          ruta_plantilla: '/templates/primer_lugar.pdf',
          es_activa: true
        },
        {
          id: 'segundo_lugar',
          nombre: 'Segundo Lugar',
          tipo: 'segundo_lugar' as const,
          descripcion: 'Plantilla especial para segundo lugar en competencias',
          ruta_plantilla: '/templates/segundo_lugar.pdf',
          es_activa: true
        },
        {
          id: 'tercer_lugar',
          nombre: 'Tercer Lugar',
          tipo: 'tercer_lugar' as const,
          descripcion: 'Plantilla especial para tercer lugar en competencias',
          ruta_plantilla: '/templates/tercer_lugar.pdf',
          es_activa: true
        },
        {
          id: 'congreso_general',
          nombre: 'Congreso General',
          tipo: 'congreso_general' as const,
          descripcion: 'Plantilla para diplomas de participación general al congreso',
          ruta_plantilla: '/templates/congreso_general.pdf',
          es_activa: true
        }
      ];

      return {
        success: true,
        message: 'Plantillas de diploma obtenidas exitosamente',
        plantillas
      };
    } catch (error) {
      console.error('Error en obtenerPlantillasDisponibles:', error);
      return {
        success: false,
        message: 'Error al obtener plantillas de diplomas: ' + (error as Error).message,
        plantillas: []
      };
    }
  }

  // =====================================================
  // GESTIÓN DE DIPLOMAS
  // =====================================================

  /**
   * Actualizar información de un diploma
   */
  async actualizarDiploma(
    idUsuario: string,
    idActividad: number | null,
    tipoDiploma: string,
    datos: any
  ): Promise<{ success: boolean; message: string }> {
    try {
      const result = await executeQuery(
        `UPDATE tb_diplomas 
         SET nombre_diploma = COALESCE($1, nombre_diploma),
             plantilla_path_diploma = COALESCE($2, plantilla_path_diploma),
             observaciones_diploma = COALESCE($3, observaciones_diploma)
         WHERE id_usuario = $4 
         AND (id_actividad = $5 OR (id_actividad IS NULL AND $5 IS NULL))
         AND tipo_diploma = $6
         RETURNING id_usuario`,
        [
          datos.nombre_diploma || null,
          datos.plantilla_path_diploma || null,
          datos.observaciones_diploma || null,
          idUsuario,
          idActividad,
          tipoDiploma
        ]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Diploma no encontrado'
        };
      }

      return {
        success: true,
        message: 'Diploma actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error en actualizarDiploma:', error);
      return {
        success: false,
        message: 'Error al actualizar diploma: ' + (error as Error).message
      };
    }
  }

  /**
   * Marcar diploma como descargado
   */
  async marcarDiplomaDescargado(
    idUsuario: string,
    idActividad: number | null,
    tipoDiploma: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const result = await executeQuery(
        `UPDATE tb_diplomas 
         SET fecha_descarga_diploma = CURRENT_TIMESTAMP
         WHERE id_usuario = $1 
         AND (id_actividad = $2 OR (id_actividad IS NULL AND $2 IS NULL))
         AND tipo_diploma = $3
         RETURNING id_usuario`,
        [idUsuario, idActividad, tipoDiploma]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Diploma no encontrado'
        };
      }

      return {
        success: true,
        message: 'Diploma marcado como descargado exitosamente'
      };
    } catch (error) {
      console.error('Error en marcarDiplomaDescargado:', error);
      return {
        success: false,
        message: 'Error al marcar diploma como descargado: ' + (error as Error).message
      };
    }
  }

  /**
   * Actualizar estado de envío de diploma
   */
  async actualizarEstadoEnvioDiploma(
    idUsuario: string,
    idActividad: number | null,
    tipoDiploma: string,
    enviado: boolean
  ): Promise<{ success: boolean; message: string }> {
    try {
      const result = await executeQuery(
        `UPDATE tb_diplomas 
         SET enviado_email_diploma = $1,
             fecha_envio_email_diploma = CASE WHEN $1 = TRUE THEN CURRENT_TIMESTAMP ELSE NULL END
         WHERE id_usuario = $2 
         AND (id_actividad = $3 OR (id_actividad IS NULL AND $3 IS NULL))
         AND tipo_diploma = $4
         RETURNING id_usuario`,
        [enviado, idUsuario, idActividad, tipoDiploma]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Diploma no encontrado'
        };
      }

      return {
        success: true,
        message: `Diploma marcado como ${enviado ? 'enviado' : 'no enviado'} exitosamente`
      };
    } catch (error) {
      console.error('Error en actualizarEstadoEnvioDiploma:', error);
      return {
        success: false,
        message: 'Error al actualizar estado de envío: ' + (error as Error).message
      };
    }
  }
}
