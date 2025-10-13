// =====================================================
// Tipos para el sistema de asistencia
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

// DTO para registrar asistencia general
export interface RegisterGeneralAttendanceDto {
  codigo_qr_usuario: string;
}

// DTO para registrar asistencia a actividad específica
export interface RegisterActivityAttendanceDto {
  codigo_qr_usuario: string;
  id_actividad: number;
}

// DTO para consultar asistencia de usuario
export interface QueryUserAttendanceDto {
  codigo_qr_usuario?: string;
  id_usuario?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

// Respuesta de registro de asistencia general
export interface GeneralAttendanceResponse {
  success: boolean;
  message: string;
  id_usuario?: string;
  nombre_completo?: string;
  fecha_asistencia?: string;
  hora_ingreso?: string;
}

// Respuesta de registro de asistencia a actividad
export interface ActivityAttendanceResponse {
  success: boolean;
  message: string;
  id_usuario?: string;
  id_actividad?: number;
  nombre_completo?: string;
  nombre_actividad?: string;
  fecha_asistencia?: string;
}

// Registro individual de asistencia
export interface AttendanceRecord {
  success: boolean;
  message: string;
  id_usuario: string;
  nombre_completo: string;
  email_usuario: string;
  tipo_consulta: 'general' | 'actividad';
  fecha_asistencia: string;
  hora_asistencia: string;
  id_actividad?: number;
  nombre_actividad?: string;
  tipo_actividad?: string;
  lugar_actividad?: string;
}

// Respuesta de consulta de asistencia
export interface UserAttendanceResponse {
  success: boolean;
  message: string;
  records: AttendanceRecord[];
  total_records: number;
}

// DTO para generar reportes de asistencia
export interface AttendanceReportDto {
  fecha_desde?: string;
  fecha_hasta?: string;
  id_actividad?: number;
  tipo_actividad?: string;
  solo_asistieron?: boolean;
}

// Estadísticas de asistencia
export interface AttendanceStats {
  total_usuarios_registrados: number;
  total_asistencia_general: number;
  total_asistencia_actividades: number;
  porcentaje_asistencia_general: number;
  actividades_mas_populares: Array<{
    id_actividad: number;
    nombre_actividad: string;
    total_asistentes: number;
  }>;
}

// Respuesta de estadísticas
export interface AttendanceStatsResponse {
  success: boolean;
  message: string;
  stats?: AttendanceStats;
}
