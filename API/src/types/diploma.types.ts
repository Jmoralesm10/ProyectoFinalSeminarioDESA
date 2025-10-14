// =====================================================
// Tipos para el sistema de diplomas
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

// =====================================================
// DTOs PARA REQUEST
// =====================================================

export interface RegistrarResultadosCompetenciaDto {
  primer_lugar_usuario?: string;
  segundo_lugar_usuario?: string;
  tercer_lugar_usuario?: string;
  puntuaciones?: {
    primer_lugar?: number;
    segundo_lugar?: number;
    tercer_lugar?: number;
  };
  descripciones_proyectos?: {
    primer_lugar?: string;
    segundo_lugar?: string;
    tercer_lugar?: string;
  };
  observaciones?: string;
}

export interface GenerarDiplomasActividadDto {
  incluir_participacion?: boolean;
  plantilla_participacion?: string;
}

export interface GenerarDiplomasCongresoDto {
  fecha_desde?: string;
  fecha_hasta?: string;
  plantilla_congreso?: string;
  solo_usuarios_sin_diploma?: boolean;
}

export interface ConsultarDiplomasDto {
  id_usuario?: string | undefined;
  id_actividad?: number | undefined;
  tipo_diploma?: string | undefined;
  fecha_desde?: string | undefined;
  fecha_hasta?: string | undefined;
  solo_no_enviados?: boolean | undefined;
  limite?: number | undefined;
  offset?: number | undefined;
}

export interface ActualizarDiplomaDto {
  nombre_diploma?: string;
  plantilla_path_diploma?: string;
  observaciones_diploma?: string;
}

// =====================================================
// INTERFACES PARA RESPONSE
// =====================================================

export interface DiplomaResponse {
  id_diploma: string; // ID compuesto: usuario_actividad_tipo
  id_usuario: string;
  nombre_completo: string;
  email_usuario: string;
  id_actividad?: number;
  nombre_actividad?: string;
  tipo_actividad?: string;
  tipo_diploma: string;
  nombre_diploma: string;
  posicion_diploma?: number;
  plantilla_path_diploma?: string;
  archivo_path_diploma?: string;
  fecha_generacion_diploma: string;
  fecha_descarga_diploma?: string;
  enviado_email_diploma: boolean;
  fecha_envio_email_diploma?: string;
  generado_por_nombre?: string;
  observaciones_diploma?: string;
}

export interface ConsultarDiplomasResponse {
  success: boolean;
  message: string;
  total_registros: number;
  diplomas: DiplomaResponse[];
  pagina_actual: number;
  total_paginas: number;
}

export interface GenerarDiplomasResponse {
  success: boolean;
  message: string;
  total_diplomas_generados: number;
  diplomas_ganadores?: number;
  diplomas_participacion?: number;
  total_usuarios_con_asistencia?: number;
  detalles_diplomas: any[];
}

export interface RegistrarResultadosResponse {
  success: boolean;
  message: string;
  total_resultados_registrados: number;
  detalles_resultados: any[];
}

export interface GanadorInfo {
  posicion: number;
  usuario_id: string;
  nombre_completo: string;
  email_usuario: string;
  puntuacion?: number;
  descripcion_proyecto?: string;
  foto_proyecto_path?: string;
  fecha_resultado: string;
}

export interface ResultadosCompetenciaResponse {
  success: boolean;
  message: string;
  total_registros: number;
  resultados: GanadorInfo[];
  actividad_info: {
    id_actividad: number;
    nombre_actividad: string;
    tipo_actividad: string;
    fecha_inicio_actividad: string;
    lugar_actividad: string;
    categoria_nombre: string;
  };
}

export interface EstadisticasDiplomas {
  total_diplomas: number;
  total_primer_lugar: number;
  total_segundo_lugar: number;
  total_tercer_lugar: number;
  total_participacion: number;
  total_congreso_general: number;
  total_enviados: number;
  total_pendientes_envio: number;
  total_descargados: number;
  porcentaje_enviados: number;
  porcentaje_descargados: number;
}

export interface EstadisticasDiplomasResponse {
  success: boolean;
  message: string;
  estadisticas: EstadisticasDiplomas;
}

export interface PlantillaDiploma {
  id: string;
  nombre: string;
  tipo: 'participacion' | 'primer_lugar' | 'segundo_lugar' | 'tercer_lugar' | 'congreso_general';
  descripcion: string;
  ruta_plantilla: string;
  es_activa: boolean;
}

export interface PlantillasDiplomaResponse {
  success: boolean;
  message: string;
  plantillas: PlantillaDiploma[];
}

// =====================================================
// INTERFACES PARA EMAIL
// =====================================================

export interface DiplomaEmailData {
  usuario: {
    nombre: string;
    apellido: string;
    email: string;
  };
  diploma: {
    nombre: string;
    tipo: string;
    actividad?: string | undefined;
    posicion?: number | undefined;
    fecha_generacion: string;
  };
  archivo_path?: string | undefined;
}

export interface EnvioDiplomaResponse {
  success: boolean;
  message: string;
  diplomas_enviados: number;
  diplomas_fallidos: number;
  detalles_envio: any[];
  enviados?: number;
  fallidos?: number;
}
