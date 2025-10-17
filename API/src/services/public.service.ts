// =====================================================
// Servicios Públicos
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { executeQuery } from '../config/database';
import {
  ConsultarFaqDto,
  ConsultarFaqResponse,
  ConsultarInformacionCongresoResponse,
  ConsultarAgendaCongresoDto,
  ConsultarAgendaCongresoResponse,
  ConsultarPonentesCongresoDto,
  ConsultarPonentesCongresoResponse,
  FaqResponse,
  InformacionCongresoResponse,
  AgendaCongresoResponse,
  PonenteCongresoResponse
} from '../types/public.types';

export class PublicService {
  
  /**
   * Consulta las preguntas frecuentes (FAQ)
   */
  async consultarFaq(filtros: ConsultarFaqDto = {}): Promise<ConsultarFaqResponse> {
    try {
      console.log('📋 [PublicService] Consultando FAQ con filtros:', filtros);

      let query: string;
      let params: any[] = [];

      if (filtros.categoria_faq) {
        // Consultar FAQ por categoría específica
        query = 'SELECT * FROM sp_consultar_faq($1)';
        params = [filtros.categoria_faq];
      } else {
        // Consultar todas las FAQ
        query = 'SELECT * FROM sp_consultar_faq()';
      }

      const result = await executeQuery(query, params);
      
      if (!result || !result.rows || !Array.isArray(result.rows)) {
        return {
          success: false,
          message: 'Error al consultar las preguntas frecuentes',
          total_registros: 0,
          faqs: []
        };
      }

      const faqs: FaqResponse[] = result.rows.map((faq: any) => ({
        id_faq: faq.id_faq,
        pregunta_faq: faq.pregunta_faq,
        respuesta_faq: faq.respuesta_faq,
        categoria_faq: faq.categoria_faq,
        orden_faq: faq.orden_faq,
        fecha_creacion_faq: faq.fecha_creacion_faq,
        fecha_actualizacion_faq: faq.fecha_actualizacion_faq
      }));

      return {
        success: true,
        message: `FAQ consultadas exitosamente${filtros.categoria_faq ? ` para la categoría: ${filtros.categoria_faq}` : ''}`,
        total_registros: faqs.length,
        faqs: faqs,
        categoria_filtro: filtros.categoria_faq || undefined
      };

    } catch (error) {
      console.error('❌ [PublicService] Error al consultar FAQ:', error);
      return {
        success: false,
        message: 'Error interno al consultar las preguntas frecuentes',
        total_registros: 0,
        faqs: []
      };
    }
  }

  /**
   * Consulta la información general del congreso
   */
  async consultarInformacionCongreso(): Promise<ConsultarInformacionCongresoResponse> {
    try {
      console.log('🏛️ [PublicService] Consultando información del congreso');

      const query = 'SELECT * FROM sp_consultar_informacion_congreso()';
      const result = await executeQuery(query);
      
      console.log('🔍 [PublicService] Resultado de executeQuery:', {
        tipo: typeof result,
        esArray: Array.isArray(result),
        tieneRows: result && result.rows !== undefined,
        rowsEsArray: result && Array.isArray(result.rows),
        result: result
      });
      
      if (!result) {
        return {
          success: false,
          message: 'Error al consultar la información del congreso',
          informacion: null
        };
      }

      // Manejar tanto arrays como objetos
      let data;
      if (Array.isArray(result)) {
        data = result;
      } else if (result.rows && Array.isArray(result.rows)) {
        data = result.rows;
      } else if (result.rows && !Array.isArray(result.rows)) {
        // Si rows es un objeto, convertirlo a array
        data = [result.rows];
      } else {
        // Si result es directamente un objeto
        data = [result];
      }

      if (data.length === 0) {
        return {
          success: true,
          message: 'No hay información del congreso disponible',
          informacion: null
        };
      }

      const info = data[0];
      const informacion: InformacionCongresoResponse = {
        id_informacion: info.id_informacion,
        titulo_informacion: info.titulo_informacion,
        descripcion_informacion: info.descripcion_informacion,
        fecha_inicio_informacion: info.fecha_inicio_informacion,
        fecha_fin_informacion: info.fecha_fin_informacion,
        lugar_informacion: info.lugar_informacion,
        informacion_carrera_informacion: info.informacion_carrera_informacion,
        fecha_creacion_informacion: info.fecha_creacion_informacion,
        fecha_actualizacion_informacion: info.fecha_actualizacion_informacion
      };

      return {
        success: true,
        message: 'Información del congreso obtenida exitosamente',
        informacion: informacion
      };

    } catch (error) {
      console.error('❌ [PublicService] Error al consultar información del congreso:', error);
      return {
        success: false,
        message: 'Error interno al consultar la información del congreso',
        informacion: null
      };
    }
  }

  /**
   * Obtiene las categorías de FAQ disponibles
   */
  async obtenerCategoriasFaq(): Promise<{ success: boolean; message: string; categorias: string[] }> {
    try {
      console.log('📂 [PublicService] Obteniendo categorías de FAQ');

      const query = `
        SELECT DISTINCT categoria_faq 
        FROM vista_faq_publica 
        ORDER BY categoria_faq
      `;
      
      const result = await executeQuery(query);
      
      if (!result || !result.rows || !Array.isArray(result.rows)) {
        return {
          success: false,
          message: 'Error al obtener las categorías de FAQ',
          categorias: []
        };
      }

      const categorias = result.rows.map((row: any) => row.categoria_faq);

      return {
        success: true,
        message: 'Categorías de FAQ obtenidas exitosamente',
        categorias: categorias
      };

    } catch (error) {
      console.error('❌ [PublicService] Error al obtener categorías de FAQ:', error);
      return {
        success: false,
        message: 'Error interno al obtener las categorías de FAQ',
        categorias: []
      };
    }
  }

  /**
   * Consulta la agenda del congreso
   */
  async consultarAgendaCongreso(filtros: ConsultarAgendaCongresoDto = {}): Promise<ConsultarAgendaCongresoResponse> {
    try {
      console.log('📅 [PublicService] Consultando agenda del congreso con filtros:', filtros);

      let query: string;
      let params: any[] = [];

      if (filtros.dia_agenda && filtros.tipo_actividad) {
        // Consultar por día y tipo de actividad
        query = 'SELECT * FROM sp_consultar_agenda_congreso($1, $2)';
        params = [filtros.dia_agenda, filtros.tipo_actividad];
      } else if (filtros.dia_agenda) {
        // Consultar solo por día
        query = 'SELECT * FROM sp_consultar_agenda_congreso($1, NULL)';
        params = [filtros.dia_agenda];
      } else if (filtros.tipo_actividad) {
        // Consultar solo por tipo de actividad
        query = 'SELECT * FROM sp_consultar_agenda_congreso(NULL, $1)';
        params = [filtros.tipo_actividad];
      } else {
        // Consultar toda la agenda
        query = 'SELECT * FROM sp_consultar_agenda_congreso()';
      }

      const result = await executeQuery(query, params);
      
      console.log('🔍 [PublicService] Resultado agenda executeQuery:', {
        tipo: typeof result,
        esArray: Array.isArray(result),
        tieneRows: result && result.rows !== undefined,
        rowsEsArray: result && Array.isArray(result.rows)
      });
      
      if (!result) {
        return {
          success: false,
          message: 'Error al consultar la agenda del congreso',
          total_registros: 0,
          agenda: []
        };
      }

      // Manejar tanto arrays como objetos
      let data;
      if (Array.isArray(result)) {
        data = result;
      } else if (result.rows && Array.isArray(result.rows)) {
        data = result.rows;
      } else if (result.rows && !Array.isArray(result.rows)) {
        data = [result.rows];
      } else {
        data = [result];
      }

      const agenda: AgendaCongresoResponse[] = data.map((item: any) => ({
        id_agenda: item.id_agenda,
        id_informacion: item.id_informacion,
        dia_agenda: item.dia_agenda,
        hora_inicio_agenda: item.hora_inicio_agenda,
        hora_fin_agenda: item.hora_fin_agenda,
        titulo_actividad_agenda: item.titulo_actividad_agenda,
        descripcion_actividad_agenda: item.descripcion_actividad_agenda,
        tipo_actividad_agenda: item.tipo_actividad_agenda,
        ponente_agenda: item.ponente_agenda,
        orden_agenda: item.orden_agenda,
        fecha_creacion_agenda: item.fecha_creacion_agenda,
        fecha_actualizacion_agenda: item.fecha_actualizacion_agenda
      }));

      return {
        success: true,
        message: `Agenda consultada exitosamente${filtros.dia_agenda || filtros.tipo_actividad ? ' con filtros aplicados' : ''}`,
        total_registros: agenda.length,
        agenda: agenda,
        filtros_aplicados: {
          dia_agenda: filtros.dia_agenda,
          tipo_actividad: filtros.tipo_actividad
        }
      };

    } catch (error) {
      console.error('❌ [PublicService] Error al consultar agenda del congreso:', error);
      return {
        success: false,
        message: 'Error interno al consultar la agenda del congreso',
        total_registros: 0,
        agenda: []
      };
    }
  }

  /**
   * Consulta los ponentes del congreso
   */
  async consultarPonentesCongreso(filtros: ConsultarPonentesCongresoDto = {}): Promise<ConsultarPonentesCongresoResponse> {
    try {
      console.log('👥 [PublicService] Consultando ponentes del congreso con filtros:', filtros);

      let query: string;
      let params: any[] = [];

      if (filtros.especialidad && filtros.empresa) {
        // Consultar por especialidad y empresa
        query = 'SELECT * FROM sp_consultar_ponentes_congreso($1, $2)';
        params = [filtros.especialidad, filtros.empresa];
      } else if (filtros.especialidad) {
        // Consultar solo por especialidad
        query = 'SELECT * FROM sp_consultar_ponentes_congreso($1, NULL)';
        params = [filtros.especialidad];
      } else if (filtros.empresa) {
        // Consultar solo por empresa
        query = 'SELECT * FROM sp_consultar_ponentes_congreso(NULL, $1)';
        params = [filtros.empresa];
      } else {
        // Consultar todos los ponentes
        query = 'SELECT * FROM sp_consultar_ponentes_congreso()';
      }

      const result = await executeQuery(query, params);
      
      console.log('🔍 [PublicService] Resultado ponentes executeQuery:', {
        tipo: typeof result,
        esArray: Array.isArray(result),
        tieneRows: result && result.rows !== undefined,
        rowsEsArray: result && Array.isArray(result.rows)
      });
      
      if (!result) {
        return {
          success: false,
          message: 'Error al consultar los ponentes del congreso',
          total_registros: 0,
          ponentes: []
        };
      }

      // Manejar tanto arrays como objetos
      let data;
      if (Array.isArray(result)) {
        data = result;
      } else if (result.rows && Array.isArray(result.rows)) {
        data = result.rows;
      } else if (result.rows && !Array.isArray(result.rows)) {
        data = [result.rows];
      } else {
        data = [result];
      }

      const ponentes: PonenteCongresoResponse[] = data.map((ponente: any) => ({
        id_ponente: ponente.id_ponente,
        id_informacion: ponente.id_informacion,
        nombre_ponente: ponente.nombre_ponente,
        apellido_ponente: ponente.apellido_ponente,
        nombre_completo_ponente: ponente.nombre_completo_ponente,
        titulo_academico_ponente: ponente.titulo_academico_ponente,
        cargo_ponente: ponente.cargo_ponente,
        empresa_ponente: ponente.empresa_ponente,
        especialidad_ponente: ponente.especialidad_ponente,
        foto_ponente_path: ponente.foto_ponente_path,
        email_ponente: ponente.email_ponente,
        linkedin_ponente: ponente.linkedin_ponente,
        twitter_ponente: ponente.twitter_ponente,
        fecha_creacion_ponente: ponente.fecha_creacion_ponente,
        fecha_actualizacion_ponente: ponente.fecha_actualizacion_ponente
      }));

      return {
        success: true,
        message: `Ponentes consultados exitosamente${filtros.especialidad || filtros.empresa ? ' con filtros aplicados' : ''}`,
        total_registros: ponentes.length,
        ponentes: ponentes,
        filtros_aplicados: {
          especialidad: filtros.especialidad,
          empresa: filtros.empresa
        }
      };

    } catch (error) {
      console.error('❌ [PublicService] Error al consultar ponentes del congreso:', error);
      return {
        success: false,
        message: 'Error interno al consultar los ponentes del congreso',
        total_registros: 0,
        ponentes: []
      };
    }
  }

  /**
   * Obtiene estadísticas públicas del congreso
   */
  async obtenerEstadisticasPublicas(): Promise<{ success: boolean; message: string; estadisticas: any }> {
    try {
      console.log('📊 [PublicService] Obteniendo estadísticas públicas');

      const query = `
        SELECT 
          (SELECT COUNT(*) FROM vista_faq_publica) as total_faq,
          (SELECT COUNT(DISTINCT categoria_faq) FROM vista_faq_publica) as total_categorias_faq,
          (SELECT COUNT(*) FROM tb_actividades WHERE estado_actividad = true) as total_actividades,
          (SELECT COUNT(*) FROM tb_usuarios WHERE estado_usuario = true) as total_usuarios_registrados,
          (SELECT COUNT(*) FROM vista_agenda_congreso_publica) as total_actividades_agenda,
          (SELECT COUNT(DISTINCT dia_agenda) FROM vista_agenda_congreso_publica) as total_dias_congreso,
          (SELECT COUNT(*) FROM vista_ponentes_congreso_publica) as total_ponentes,
          (SELECT COUNT(DISTINCT especialidad_ponente) FROM vista_ponentes_congreso_publica) as total_especialidades
      `;
      
      const result = await executeQuery(query);
      
      if (!result || !result.rows || result.rows.length === 0) {
        return {
          success: false,
          message: 'Error al obtener las estadísticas públicas',
          estadisticas: null
        };
      }

      const stats = result.rows[0];

      return {
        success: true,
        message: 'Estadísticas públicas obtenidas exitosamente',
        estadisticas: {
          total_faq: parseInt(stats.total_faq) || 0,
          total_categorias_faq: parseInt(stats.total_categorias_faq) || 0,
          total_actividades: parseInt(stats.total_actividades) || 0,
          total_usuarios_registrados: parseInt(stats.total_usuarios_registrados) || 0,
          total_actividades_agenda: parseInt(stats.total_actividades_agenda) || 0,
          total_dias_congreso: parseInt(stats.total_dias_congreso) || 0,
          total_ponentes: parseInt(stats.total_ponentes) || 0,
          total_especialidades: parseInt(stats.total_especialidades) || 0
        }
      };

    } catch (error) {
      console.error('❌ [PublicService] Error al obtener estadísticas públicas:', error);
      return {
        success: false,
        message: 'Error interno al obtener las estadísticas públicas',
        estadisticas: null
      };
    }
  }

  /**
   * Obtener diplomas de un usuario específico (endpoint temporal)
   */
  async obtenerDiplomasUsuario(userId: string): Promise<any> {
    try {
      console.log('🎓 [PublicService] Obteniendo diplomas para usuario:', userId);
      
      // Primero verificar si el usuario existe
      console.log('🔍 [PublicService] Verificando si el usuario existe...');
      const userCheck = await executeQuery(
        'SELECT id_usuario, nombre_usuario, apellido_usuario FROM tb_usuarios WHERE id_usuario = $1',
        [userId]
      );
      
      if (userCheck.rows.length === 0) {
        console.log('❌ [PublicService] Usuario no encontrado');
        return {
          success: false,
          message: 'Usuario no encontrado',
          diplomas: []
        };
      }
      
      console.log('✅ [PublicService] Usuario encontrado:', userCheck.rows[0]);
      
      // Verificar diplomas básicos
      console.log('🔍 [PublicService] Verificando diplomas básicos...');
      const diplomasCheck = await executeQuery(
        'SELECT id_usuario, id_actividad, tipo_diploma, nombre_diploma FROM tb_diplomas WHERE id_usuario = $1',
        [userId]
      );
      
      console.log(`📊 [PublicService] Diplomas encontrados: ${diplomasCheck.rows.length}`);
      diplomasCheck.rows.forEach((diploma: any, index: number) => {
        console.log(`   ${index + 1}. Usuario: ${diploma.id_usuario}, Actividad: ${diploma.id_actividad}, Tipo: ${diploma.tipo_diploma}`);
      });
      
      // Consulta corregida - la tabla tb_diplomas NO tiene id_diploma
      const query = `
        SELECT 
          d.id_usuario,
          d.id_actividad,
          d.tipo_diploma,
          u.nombre_usuario,
          u.apellido_usuario,
          u.email_usuario,
          a.nombre_actividad as actividad_nombre,
          a.tipo_actividad,
          d.nombre_diploma,
          d.plantilla_path_diploma,
          d.archivo_path_diploma,
          d.fecha_generacion_diploma,
          d.fecha_descarga_diploma,
          d.enviado_email_diploma,
          d.fecha_envio_email_diploma,
          d.observaciones_diploma,
          rc.posicion_resultado,
          rc.puntuacion_resultado
        FROM tb_diplomas d
        JOIN tb_usuarios u ON d.id_usuario = u.id_usuario
        LEFT JOIN tb_actividades a ON d.id_actividad = a.id_actividad
        LEFT JOIN tb_resultados_competencia rc ON d.id_usuario = rc.id_usuario AND d.id_actividad = rc.id_actividad
        WHERE d.id_usuario = $1
        ORDER BY d.fecha_generacion_diploma DESC
        LIMIT 100
      `;

      console.log('📝 [PublicService] Ejecutando consulta completa...');
      const result = await executeQuery(query, [userId]);

      if (!result || !result.rows || !Array.isArray(result.rows)) {
        return {
          success: false,
          message: 'Error al consultar los diplomas del usuario',
          diplomas: []
        };
      }

      const diplomas = result.rows.map((diploma: any) => ({
        // Generar un ID único basado en la clave primaria compuesta
        id_diploma: `${diploma.id_usuario}|||${diploma.id_actividad}|||${diploma.tipo_diploma}`,
        id_usuario: diploma.id_usuario,
        id_actividad: diploma.id_actividad,
        nombre_completo: `${diploma.nombre_usuario} ${diploma.apellido_usuario}`,
        email_usuario: diploma.email_usuario,
        actividad_nombre: diploma.actividad_nombre,
        tipo_actividad: diploma.tipo_actividad,
        tipo_diploma: diploma.tipo_diploma,
        nombre_diploma: diploma.nombre_diploma,
        plantilla_path_diploma: diploma.plantilla_path_diploma,
        archivo_path_diploma: diploma.archivo_path_diploma,
        fecha_generacion_diploma: diploma.fecha_generacion_diploma,
        fecha_descarga_diploma: diploma.fecha_descarga_diploma,
        enviado_email_diploma: diploma.enviado_email_diploma,
        fecha_envio_email_diploma: diploma.fecha_envio_email_diploma,
        generado_por_nombre: 'Sistema',
        observaciones_diploma: diploma.observaciones_diploma,
        posicion_resultado: diploma.posicion_resultado,
        puntuacion_resultado: diploma.puntuacion_resultado,
        tipo_diploma_descripcion: diploma.tipo_diploma === 'participacion' ? '📜 Participación' : 
                                 diploma.tipo_diploma === 'congreso_general' ? '🏆 Congreso General' : 
                                 diploma.tipo_diploma
      }));

      return {
        success: true,
        message: `Diplomas consultados exitosamente para el usuario`,
        diplomas: diplomas,
        total_registros: diplomas.length
      };
    } catch (error) {
      console.error('❌ [PublicService] Error al obtener diplomas del usuario:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Generar archivo PDF para un diploma específico
   */
  async generarPDFDiploma(diplomaId: string, userId: string): Promise<any> {
    try {
      console.log('🎓 [PublicService] Generando PDF para diploma:', diplomaId, 'usuario:', userId);
      
          // Obtener información del diploma
          // El diplomaId viene como "usuario|||actividad|||tipo", necesitamos parsearlo
          const [userIdFromId, actividadId, tipoDiploma] = diplomaId.split('|||');
          
          if (userIdFromId !== userId) {
            return {
              success: false,
              message: 'El diploma no pertenece al usuario especificado'
            };
          }
          
          const diplomaQuery = `
            SELECT 
              d.id_usuario,
              d.id_actividad,
              d.tipo_diploma,
              d.nombre_diploma,
              d.observaciones_diploma,
              u.nombre_usuario,
              u.apellido_usuario,
              a.nombre_actividad,
              a.tipo_actividad,
              rc.posicion_resultado,
              rc.puntuacion_resultado
            FROM tb_diplomas d
            JOIN tb_usuarios u ON d.id_usuario = u.id_usuario
            LEFT JOIN tb_actividades a ON d.id_actividad = a.id_actividad
            LEFT JOIN tb_resultados_competencia rc ON d.id_usuario = rc.id_usuario AND d.id_actividad = rc.id_actividad
            WHERE d.id_usuario = $1 AND d.id_actividad = $2 AND d.tipo_diploma = $3
          `;

      const diplomaResult = await executeQuery(diplomaQuery, [userId, actividadId, tipoDiploma]);

      if (!diplomaResult || !diplomaResult.rows || diplomaResult.rows.length === 0) {
        return {
          success: false,
          message: 'Diploma no encontrado o no tienes permisos para accederlo'
        };
      }

      const diploma = diplomaResult.rows[0];

      // Importar PDFService
      const { PDFService } = await import('./pdf.service');
      const pdfService = new PDFService();

      // Preparar datos para el PDF
      const pdfData = {
        nombreCompleto: `${diploma.nombre_usuario} ${diploma.apellido_usuario}`,
        actividad: diploma.nombre_actividad,
        tipoDiploma: diploma.tipo_diploma as 'participacion' | 'primer_lugar' | 'segundo_lugar' | 'tercer_lugar' | 'congreso_general',
        fechaGeneracion: new Date().toISOString(),
        posicion: diploma.posicion_resultado,
        descripcionProyecto: diploma.observaciones_diploma
      };

      // Generar PDF
      const filePath = await pdfService.generateDiplomaPDF(pdfData);

          // Actualizar el registro del diploma con la ruta del archivo
          const updateQuery = `
            UPDATE tb_diplomas 
            SET archivo_path_diploma = $1, fecha_generacion_diploma = CURRENT_TIMESTAMP
            WHERE id_usuario = $2 AND id_actividad = $3 AND tipo_diploma = $4
          `;

          await executeQuery(updateQuery, [filePath, userId, actividadId, tipoDiploma]);

      return {
        success: true,
        message: 'PDF generado exitosamente',
        filePath: filePath,
        fileName: filePath.split('/').pop() || filePath.split('\\').pop()
      };

    } catch (error) {
      console.error('❌ [PublicService] Error al generar PDF del diploma:', error);
      return {
        success: false,
        message: 'Error al generar el PDF del diploma'
      };
    }
  }
}
