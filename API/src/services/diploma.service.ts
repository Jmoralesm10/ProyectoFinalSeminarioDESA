// =====================================================
// Servicio para diplomas
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { DiplomaRepository } from '../repositories/diploma.repository';
import { EmailService } from './email.service';
import { PDFService, DiplomaPDFData } from './pdf.service';
import {
  ConsultarDiplomasDto,
  GenerarDiplomasActividadDto,
  GenerarDiplomasCongresoDto,
  RegistrarResultadosCompetenciaDto,
  ActualizarDiplomaDto,
  ConsultarDiplomasResponse,
  GenerarDiplomasResponse,
  RegistrarResultadosResponse,
  ResultadosCompetenciaResponse,
  EstadisticasDiplomasResponse,
  PlantillasDiplomaResponse,
  DiplomaEmailData
} from '../types/diploma.types';

export class DiplomaService {
  private diplomaRepository: DiplomaRepository;
  private emailService: EmailService;
  private pdfService: PDFService;

  constructor() {
    this.diplomaRepository = new DiplomaRepository();
    this.emailService = new EmailService();
    this.pdfService = new PDFService();
  }

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
      // Validar que al menos un ganador sea proporcionado
      if (!datos.primer_lugar_usuario && !datos.segundo_lugar_usuario && !datos.tercer_lugar_usuario) {
        return {
          success: false,
          message: 'Debe proporcionar al menos un ganador',
          total_resultados_registrados: 0,
          detalles_resultados: []
        };
      }

      return await this.diplomaRepository.registrarResultadosCompetencia(
        idActividad,
        datos,
        registradoPorUsuario
      );
    } catch (error) {
      console.error('Error en registrarResultadosCompetencia service:', error);
      return {
        success: false,
        message: 'Error interno al registrar resultados de competencia',
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
      return await this.diplomaRepository.consultarResultadosCompetencia(idActividad);
    } catch (error) {
      console.error('Error en consultarResultadosCompetencia service:', error);
      return {
        success: false,
        message: 'Error interno al consultar resultados de competencia',
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
      const resultado = await this.diplomaRepository.generarDiplomasActividad(
        idActividad,
        datos,
        generadoPorUsuario
      );

      // Si la generación fue exitosa, enviar diplomas por correo
      if (resultado.success && resultado.total_diplomas_generados > 0) {
        await this.enviarDiplomasPorCorreo(idActividad, resultado.detalles_diplomas);
      }

      return resultado;
    } catch (error) {
      console.error('Error en generarDiplomasActividad service:', error);
      return {
        success: false,
        message: 'Error interno al generar diplomas de actividad',
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
      const resultado = await this.diplomaRepository.generarDiplomasCongreso(
        datos,
        generadoPorUsuario
      );

      // Si la generación fue exitosa, enviar diplomas por correo
      if (resultado.success && resultado.total_diplomas_generados > 0) {
        await this.enviarDiplomasCongresoPorCorreo(resultado.detalles_diplomas);
      }

      return resultado;
    } catch (error) {
      console.error('Error en generarDiplomasCongreso service:', error);
      return {
        success: false,
        message: 'Error interno al generar diplomas del congreso',
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
      return await this.diplomaRepository.consultarDiplomas(filters);
    } catch (error) {
      console.error('Error en consultarDiplomas service:', error);
      return {
        success: false,
        message: 'Error interno al consultar diplomas',
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
      return await this.diplomaRepository.obtenerEstadisticasDiplomas();
    } catch (error) {
      console.error('Error en obtenerEstadisticasDiplomas service:', error);
      return {
        success: false,
        message: 'Error interno al obtener estadísticas de diplomas',
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

  /**
   * Obtener plantillas de diplomas disponibles
   */
  async obtenerPlantillasDisponibles(): Promise<PlantillasDiplomaResponse> {
    try {
      return await this.diplomaRepository.obtenerPlantillasDisponibles();
    } catch (error) {
      console.error('Error en obtenerPlantillasDisponibles service:', error);
      return {
        success: false,
        message: 'Error interno al obtener plantillas de diplomas',
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
    datos: ActualizarDiplomaDto
  ): Promise<{ success: boolean; message: string }> {
    try {
      return await this.diplomaRepository.actualizarDiploma(
        idUsuario,
        idActividad,
        tipoDiploma,
        datos
      );
    } catch (error) {
      console.error('Error en actualizarDiploma service:', error);
      return {
        success: false,
        message: 'Error interno al actualizar diploma'
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
      return await this.diplomaRepository.marcarDiplomaDescargado(
        idUsuario,
        idActividad,
        tipoDiploma
      );
    } catch (error) {
      console.error('Error en marcarDiplomaDescargado service:', error);
      return {
        success: false,
        message: 'Error interno al marcar diploma como descargado'
      };
    }
  }

  /**
   * Reenviar diploma por correo electrónico
   */
  async reenviarDiplomaPorCorreo(
    idUsuario: string,
    idActividad: number | null,
    tipoDiploma: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Obtener información del diploma
      const diplomasResult = await this.diplomaRepository.consultarDiplomas({
        id_usuario: idUsuario,
        id_actividad: idActividad || undefined,
        tipo_diploma: tipoDiploma,
        limite: 1
      });

      if (!diplomasResult.success || diplomasResult.diplomas.length === 0) {
        return {
          success: false,
          message: 'Diploma no encontrado'
        };
      }

      const diploma = diplomasResult.diplomas[0];
      
      if (!diploma) {
        return {
          success: false,
          message: 'Diploma no encontrado'
        };
      }
      
      // Preparar datos para el email
      const emailData: DiplomaEmailData = {
        usuario: {
          nombre: diploma.nombre_completo.split(' ')[0] || '',
          apellido: diploma.nombre_completo.split(' ').slice(1).join(' ') || '',
          email: diploma.email_usuario
        },
        diploma: {
          nombre: diploma.nombre_diploma,
          tipo: diploma.tipo_diploma,
          actividad: diploma.nombre_actividad,
          posicion: diploma.posicion_diploma,
          fecha_generacion: diploma.fecha_generacion_diploma
        },
        archivo_path: diploma.archivo_path_diploma
      };

      // Enviar email
      const emailResult = await this.emailService.sendDiplomaEmail(emailData);

      if (emailResult.success) {
        // Actualizar estado de envío
        await this.diplomaRepository.actualizarEstadoEnvioDiploma(
          idUsuario,
          idActividad,
          tipoDiploma,
          true
        );

        return {
          success: true,
          message: 'Diploma reenviado exitosamente por correo electrónico'
        };
      } else {
        return {
          success: false,
          message: 'Error al enviar diploma por correo: ' + emailResult.message
        };
      }
    } catch (error) {
      console.error('Error en reenviarDiplomaPorCorreo service:', error);
      return {
        success: false,
        message: 'Error interno al reenviar diploma por correo'
      };
    }
  }

  // =====================================================
  // MÉTODOS PRIVADOS PARA ENVÍO DE EMAILS
  // =====================================================

  /**
   * Enviar diplomas por correo después de generarlos
   */
  private async enviarDiplomasPorCorreo(idActividad: number, detallesDiplomas: any[]): Promise<void> {
    try {
      if (!detallesDiplomas || detallesDiplomas.length === 0) {
        return;
      }

      // Obtener información completa de los diplomas generados
      const diplomasCompletos = await this.obtenerDiplomasParaEnvio(idActividad, detallesDiplomas);

      // Enviar emails en lotes
      const resultadoEnvio = await this.emailService.sendMultipleDiplomas(diplomasCompletos);

      // Actualizar estado de envío en la base de datos
      await this.actualizarEstadoEnvioDiplomas(diplomasCompletos, resultadoEnvio);

      console.log(`📧 Diplomas de actividad ${idActividad}: ${resultadoEnvio.diplomas_enviados} enviados, ${resultadoEnvio.diplomas_fallidos} fallidos`);
    } catch (error) {
      console.error('Error al enviar diplomas por correo:', error);
    }
  }

  /**
   * Enviar diplomas del congreso por correo después de generarlos
   */
  private async enviarDiplomasCongresoPorCorreo(detallesDiplomas: any[]): Promise<void> {
    try {
      if (!detallesDiplomas || detallesDiplomas.length === 0) {
        return;
      }

      // Obtener información completa de los diplomas generados
      const diplomasCompletos = await this.obtenerDiplomasCongresoParaEnvio(detallesDiplomas);

      // Enviar emails en lotes
      const resultadoEnvio = await this.emailService.sendMultipleDiplomas(diplomasCompletos);

      // Actualizar estado de envío en la base de datos
      await this.actualizarEstadoEnvioDiplomas(diplomasCompletos, resultadoEnvio);

      console.log(`📧 Diplomas del congreso: ${resultadoEnvio.diplomas_enviados} enviados, ${resultadoEnvio.diplomas_fallidos} fallidos`);
    } catch (error) {
      console.error('Error al enviar diplomas del congreso por correo:', error);
    }
  }

  /**
   * Obtener información completa de diplomas para envío
   */
  private async obtenerDiplomasParaEnvio(idActividad: number, detallesDiplomas: any[]): Promise<DiplomaEmailData[]> {
    const diplomasCompletos: DiplomaEmailData[] = [];

    for (const detalle of detallesDiplomas) {
      try {
        const diplomasResult = await this.diplomaRepository.consultarDiplomas({
          id_usuario: detalle.usuario_id,
          id_actividad: idActividad,
          tipo_diploma: 'participacion',
          limite: 1
        });

        if (diplomasResult.success && diplomasResult.diplomas.length > 0) {
          const diploma = diplomasResult.diplomas[0];
          
          if (diploma) {
            // Generar PDF dinámicamente
            const pdfData: DiplomaPDFData = {
              nombreCompleto: diploma.nombre_completo || 'Usuario',
              actividad: diploma.nombre_actividad || 'Actividad',
              tipoDiploma: (diploma.tipo_diploma as any) || 'participacion',
              fechaGeneracion: diploma.fecha_generacion_diploma || new Date().toISOString(),
              posicion: diploma.posicion_diploma || undefined
            };

            const pdfPath = await this.pdfService.generateDiplomaPDF(pdfData);

            diplomasCompletos.push({
              usuario: {
                nombre: diploma.nombre_completo.split(' ')[0] || '',
                apellido: diploma.nombre_completo.split(' ').slice(1).join(' ') || '',
                email: diploma.email_usuario
              },
              diploma: {
                nombre: diploma.nombre_diploma,
                tipo: diploma.tipo_diploma,
                actividad: diploma.nombre_actividad,
                posicion: diploma.posicion_diploma,
                fecha_generacion: diploma.fecha_generacion_diploma
              },
              archivo_path: pdfPath
            });
          }
        }
      } catch (error) {
        console.error(`Error al obtener diploma para envío (usuario: ${detalle.usuario_id}):`, error);
      }
    }

    return diplomasCompletos;
  }

  /**
   * Obtener información completa de diplomas del congreso para envío
   */
  private async obtenerDiplomasCongresoParaEnvio(detallesDiplomas: any[]): Promise<DiplomaEmailData[]> {
    const diplomasCompletos: DiplomaEmailData[] = [];

    for (const detalle of detallesDiplomas) {
      try {
        const diplomasResult = await this.diplomaRepository.consultarDiplomas({
          id_usuario: detalle.usuario_id,
          tipo_diploma: 'congreso_general',
          limite: 1
        });

        if (diplomasResult.success && diplomasResult.diplomas.length > 0) {
          const diploma = diplomasResult.diplomas[0];
          
          if (diploma) {
            // Generar PDF dinámicamente para diploma del congreso
            const pdfData: DiplomaPDFData = {
              nombreCompleto: diploma.nombre_completo || 'Usuario',
              actividad: 'Congreso de Tecnología 2024',
              tipoDiploma: 'congreso_general',
              fechaGeneracion: diploma.fecha_generacion_diploma || new Date().toISOString()
            };

            const pdfPath = await this.pdfService.generateDiplomaPDF(pdfData);

            diplomasCompletos.push({
              usuario: {
                nombre: diploma.nombre_completo.split(' ')[0] || '',
                apellido: diploma.nombre_completo.split(' ').slice(1).join(' ') || '',
                email: diploma.email_usuario
              },
              diploma: {
                nombre: diploma.nombre_diploma,
                tipo: diploma.tipo_diploma,
                fecha_generacion: diploma.fecha_generacion_diploma
              },
              archivo_path: pdfPath
            });
          }
        }
      } catch (error) {
        console.error(`Error al obtener diploma del congreso para envío (usuario: ${detalle.usuario_id}):`, error);
      }
    }

    return diplomasCompletos;
  }

  /**
   * Actualizar estado de envío de diplomas en la base de datos
   */
  private async actualizarEstadoEnvioDiplomas(diplomasCompletos: DiplomaEmailData[], resultadoEnvio: any): Promise<void> {
    for (const diploma of diplomasCompletos) {
      try {
        const fueEnviado = resultadoEnvio.detalles_envio?.some((detalle: any) => 
          detalle.email === diploma.usuario.email && detalle.success === true
        ) || false;

        // Determinar tipo de diploma y actividad
        const tipoDiploma = diploma.diploma.tipo;
        const idActividad = diploma.diploma.actividad ? 
          await this.obtenerIdActividadPorNombre(diploma.diploma.actividad) : null;

        await this.diplomaRepository.actualizarEstadoEnvioDiploma(
          await this.obtenerIdUsuarioPorEmail(diploma.usuario.email),
          idActividad,
          tipoDiploma,
          fueEnviado
        );
      } catch (error) {
        console.error(`Error al actualizar estado de envío para ${diploma.usuario.email}:`, error);
      }
    }
  }

  /**
   * Obtener ID de usuario por email
   */
  private async obtenerIdUsuarioPorEmail(email: string): Promise<string> {
    try {
      const result = await this.diplomaRepository.consultarDiplomas({
        limite: 1
      });
      
      const diploma = result.diplomas.find(d => d.email_usuario === email);
      return diploma?.id_usuario || '';
    } catch (error) {
      console.error('Error al obtener ID de usuario por email:', error);
      return '';
    }
  }

  /**
   * Obtener ID de actividad por nombre
   */
  private async obtenerIdActividadPorNombre(nombreActividad: string): Promise<number | null> {
    try {
      const result = await this.diplomaRepository.consultarDiplomas({
        limite: 1
      });
      
      const diploma = result.diplomas.find(d => d.nombre_actividad === nombreActividad);
      return diploma?.id_actividad || null;
    } catch (error) {
      console.error('Error al obtener ID de actividad por nombre:', error);
      return null;
    }
  }
}
