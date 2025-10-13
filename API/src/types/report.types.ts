// =====================================================
// Tipos para Reportes del Sistema de Congreso
// =====================================================

// Tipos base para reportes
export interface BaseReportResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

// =====================================================
// REPORTES DE ASISTENCIA
// =====================================================

export interface AttendanceReportFilters {
  tipo_reporte?: 'general' | 'actividades' | 'completo';
  fecha_desde?: string | undefined;
  fecha_hasta?: string | undefined;
  id_actividad?: number | undefined;
  limite?: number | undefined;
  offset?: number | undefined;
}

export interface AttendanceReportItem {
  id_usuario: string;
  nombre_completo: string;
  email_usuario: string;
  tipo_usuario: string;
  fecha_asistencia: string;
  hora_asistencia: string;
  id_actividad?: number;
  nombre_actividad: string;
  tipo_actividad: string;
  lugar_actividad: string;
  categoria_actividad: string;
}

export interface AttendanceReportResponse extends BaseReportResponse {
  data: {
    tipo_reporte: string;
    total_registros: number;
    fecha_desde: string;
    fecha_hasta: string;
    registros: AttendanceReportItem[];
    paginacion: {
      pagina_actual: number;
      total_paginas: number;
      limite: number;
      offset: number;
    };
  };
}

// =====================================================
// ESTADÍSTICAS DEL SISTEMA
// =====================================================

export interface StatisticsFilters {
  fecha_desde?: string | undefined;
  fecha_hasta?: string | undefined;
  tipo_estadisticas?: 'completo' | 'usuarios' | 'actividades' | 'asistencias' | 'administradores';
}

export interface UserStatistics {
  total_usuarios: number;
  usuarios_activos: number;
  usuarios_inactivos: number;
  usuarios_por_tipo: Record<string, number>;
  usuarios_por_colegio: Record<string, number>;
  emails_verificados: number;
  emails_no_verificados: number;
}

export interface ActivityStatistics {
  total_actividades: number;
  actividades_activas: number;
  total_inscripciones: number;
  inscripciones_confirmadas: number;
  inscripciones_pendientes: number;
  actividades_por_tipo: Record<string, number>;
  actividades_mas_populares: Array<{
    id_actividad: number;
    nombre_actividad: string;
    total_inscripciones: number;
  }>;
}

export interface AttendanceStatistics {
  total_asistencias_generales: number;
  total_asistencias_actividades: number;
  usuarios_con_asistencia: number;
  asistencias_por_dia: Record<string, number>;
  actividades_con_mas_asistencia: Array<{
    id_actividad: number;
    nombre_actividad: string;
    total_asistencias: number;
  }>;
}

export interface AdminStatistics {
  total_administradores: number;
  administradores_activos: number;
  administradores_por_rol: Record<string, number>;
  permisos_mas_comunes: Record<string, number>;
}

export interface TrendsData {
  crecimiento_usuarios: {
    periodo_actual: number;
    periodo_anterior: number;
    porcentaje_cambio: number;
  };
  actividad_reciente: {
    usuarios_activos_ultimos_7_dias: number;
    inscripciones_ultimos_7_dias: number;
  };
}

export interface StatisticsResponse extends BaseReportResponse {
  data: {
    estadisticas_generales: {
      fecha_consulta: string;
      periodo_consulta: {
        desde: string;
        hasta: string;
      };
      sistema_info: {
        version: string;
        ultima_actualizacion: string;
      };
    };
    estadisticas_usuarios?: UserStatistics;
    estadisticas_actividades?: ActivityStatistics;
    estadisticas_asistencias?: AttendanceStatistics;
    estadisticas_administradores?: AdminStatistics;
    tendencias?: TrendsData;
  };
}

// =====================================================
// REPORTES DE INSCRIPCIONES
// =====================================================

export interface RegistrationReportFilters {
  fecha_desde?: string | undefined;
  fecha_hasta?: string | undefined;
  id_actividad?: number | undefined;
  estado_inscripcion?: 'confirmada' | 'pendiente' | 'cancelada' | undefined;
  limite?: number | undefined;
  offset?: number | undefined;
}

export interface RegistrationReportItem {
  id_usuario: string;
  id_actividad: number;
  nombre_completo: string;
  email_usuario: string;
  codigo_qr_usuario: string;
  actividad_nombre: string;
  tipo_actividad: string;
  fecha_inicio_actividad: string;
  lugar_actividad: string;
  categoria_nombre: string;
  fecha_inscripcion: string;
  estado_inscripcion: string;
  observaciones_inscripcion?: string;
}

export interface RegistrationReportResponse extends BaseReportResponse {
  data: {
    total_registros: number;
    registros: RegistrationReportItem[];
    paginacion: {
      pagina_actual: number;
      total_paginas: number;
      limite: number;
      offset: number;
    };
  };
}

// =====================================================
// REPORTES POR ACTIVIDAD
// =====================================================

export interface ActivityReportItem {
  id_actividad: number;
  nombre_actividad: string;
  tipo_actividad: string;
  fecha_inicio_actividad: string;
  lugar_actividad: string;
  categoria_nombre: string;
  total_inscritos: number;
  total_asistentes: number;
  porcentaje_asistencia: number;
  cupo_maximo_actividad: number;
  cupos_disponibles: number;
}

export interface ActivityReportResponse extends BaseReportResponse {
  data: {
    total_actividades: number;
    actividades: ActivityReportItem[];
  };
}

// =====================================================
// REPORTES POR COLEGIO
// =====================================================

export interface SchoolReportItem {
  colegio: string;
  total_usuarios: number;
  usuarios_activos: number;
  usuarios_externos: number;
  usuarios_internos: number;
  emails_verificados: number;
  total_inscripciones: number;
  total_asistencias_generales: number;
}

export interface SchoolReportResponse extends BaseReportResponse {
  data: {
    total_colegios: number;
    colegios: SchoolReportItem[];
  };
}

// =====================================================
// REPORTES DE USUARIOS MÁS ACTIVOS
// =====================================================

export interface MostActiveUserItem {
  id_usuario: string;
  nombre_completo: string;
  email_usuario: string;
  nombre_tipo_usuario: string;
  colegio_usuario: string;
  total_inscripciones: number;
  total_asistencias_actividades: number;
  total_asistencias_generales: number;
  fecha_inscripcion_usuario: string;
  ultimo_acceso_usuario?: string;
}

export interface MostActiveUsersResponse extends BaseReportResponse {
  data: {
    total_usuarios: number;
    usuarios: MostActiveUserItem[];
  };
}

// =====================================================
// REPORTES DE DIPLOMAS
// =====================================================

export interface DiplomaReportItem {
  id_diploma: string;
  id_usuario: string;
  id_actividad?: number;
  nombre_completo: string;
  email_usuario: string;
  actividad_nombre?: string;
  tipo_actividad?: string;
  nombre_diploma: string;
  plantilla_path_diploma: string;
  archivo_path_diploma?: string;
  fecha_generacion_diploma: string;
  fecha_descarga_diploma?: string;
  enviado_email_diploma: boolean;
  fecha_envio_email_diploma?: string;
}

export interface DiplomaReportResponse extends BaseReportResponse {
  data: {
    total_diplomas: number;
    diplomas: DiplomaReportItem[];
  };
}

// =====================================================
// REPORTES DE RESULTADOS DE COMPETENCIAS
// =====================================================

export interface CompetitionResultItem {
  id_resultado: string;
  id_actividad: number;
  id_usuario: string;
  competencia_nombre: string;
  participante_nombre: string;
  email_usuario: string;
  posicion_resultado: number;
  puntuacion_resultado?: number;
  descripcion_proyecto_resultado?: string;
  foto_proyecto_path_resultado?: string;
  fecha_resultado: string;
  observaciones_resultado?: string;
  fecha_inicio_actividad: string;
  lugar_actividad: string;
}

export interface CompetitionResultsResponse extends BaseReportResponse {
  data: {
    total_resultados: number;
    resultados: CompetitionResultItem[];
  };
}

// =====================================================
// FILTROS COMUNES
// =====================================================

export interface DateRangeFilters {
  fecha_desde?: string | undefined;
  fecha_hasta?: string | undefined;
}

export interface PaginationFilters {
  limite?: number | undefined;
  offset?: number | undefined;
}

export interface ActivityFilters {
  id_actividad?: number | undefined;
  tipo_actividad?: 'taller' | 'competencia' | undefined;
  categoria?: string | undefined;
}

export interface UserFilters {
  tipo_usuario?: 'externo' | 'interno' | 'administrador' | undefined;
  estado_usuario?: boolean | undefined;
  colegio?: string | undefined;
}
