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
}
