// =====================================================
// Tipos TypeScript para Gestión de Actividades
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

export interface Activity {
  id_actividad: number;
  id_categoria: number;
  nombre_actividad: string;
  descripcion_actividad?: string | undefined;
  tipo_actividad: 'taller' | 'competencia';
  fecha_inicio_actividad: Date;
  fecha_fin_actividad: Date;
  fecha_limite_inscripcion?: Date | undefined;
  duracion_estimada_minutos?: number | undefined;
  cupo_maximo_actividad: number;
  cupo_disponible_actividad: number;
  lugar_actividad?: string | undefined;
  ponente_actividad?: string | undefined;
  requisitos_actividad?: string | undefined;
  nivel_requerido?: string | undefined;
  edad_minima?: number | undefined;
  edad_maxima?: number | undefined;
  materiales_requeridos?: string | undefined;
  costo_actividad: number;
  moneda_costo: string;
  permite_inscripciones: boolean;
  requiere_aprobacion: boolean;
  categoria_nombre: string;
  estado_actividad: boolean;
  fecha_creacion_actividad: Date;
}

export interface ActivityCategory {
  id_categoria: number;
  nombre_categoria: string;
  descripcion_categoria?: string;
  estado_categoria: boolean;
  fecha_creacion_categoria: Date;
}

export interface ActivityInscription {
  id_usuario: string;
  id_actividad: number;
  fecha_inscripcion: Date;
  estado_inscripcion: 'confirmada' | 'cancelada' | 'en_espera';
  observaciones_inscripcion?: string | undefined;
  nombre_actividad?: string | undefined;
  nombre_usuario?: string | undefined;
}

// DTOs para requests
export interface CreateActivityDto {
  id_categoria: number;
  nombre_actividad: string;
  tipo_actividad: 'taller' | 'competencia';
  fecha_inicio_actividad: string; // ISO string
  fecha_fin_actividad: string; // ISO string
  cupo_maximo_actividad: number;
  descripcion_actividad?: string;
  fecha_limite_inscripcion?: string; // ISO string
  duracion_estimada_minutos?: number;
  lugar_actividad?: string;
  ponente_actividad?: string;
  requisitos_actividad?: string;
  nivel_requerido?: string;
  edad_minima?: number;
  edad_maxima?: number;
  materiales_requeridos?: string;
  costo_actividad?: number;
  moneda_costo?: string;
  permite_inscripciones?: boolean;
  requiere_aprobacion?: boolean;
}

export interface UpdateActivityDto {
  id_categoria?: number;
  nombre_actividad?: string;
  tipo_actividad?: 'taller' | 'competencia';
  fecha_inicio_actividad?: string; // ISO string
  fecha_fin_actividad?: string; // ISO string
  cupo_maximo_actividad?: number;
  descripcion_actividad?: string;
  fecha_limite_inscripcion?: string; // ISO string
  duracion_estimada_minutos?: number;
  lugar_actividad?: string;
  ponente_actividad?: string;
  requisitos_actividad?: string;
  nivel_requerido?: string;
  edad_minima?: number;
  edad_maxima?: number;
  materiales_requeridos?: string;
  costo_actividad?: number;
  moneda_costo?: string;
  permite_inscripciones?: boolean;
  requiere_aprobacion?: boolean;
  estado_actividad?: boolean;
}

export interface InscribeActivityDto {
  id_actividad: number;
  observaciones_inscripcion?: string;
}

export interface ListActivitiesDto {
  tipo_actividad?: 'taller' | 'competencia' | undefined;
  id_categoria?: number | undefined;
  solo_disponibles?: boolean;
  solo_activas?: boolean;
  limite?: number;
  offset?: number;
}

// Response interfaces para stored procedures
export interface SpListActivitiesResponse {
  success: boolean;
  message: string;
  id_actividad: number;
  nombre_actividad: string;
  descripcion_actividad?: string;
  tipo_actividad: string;
  fecha_inicio_actividad: Date;
  fecha_fin_actividad: Date;
  fecha_limite_inscripcion?: Date;
  duracion_estimada_minutos?: number;
  cupo_maximo_actividad: number;
  cupo_disponible_actividad: number;
  lugar_actividad?: string;
  ponente_actividad?: string;
  requisitos_actividad?: string;
  nivel_requerido?: string;
  edad_minima?: number;
  edad_maxima?: number;
  materiales_requeridos?: string;
  costo_actividad: number;
  moneda_costo: string;
  permite_inscripciones: boolean;
  requiere_aprobacion: boolean;
  categoria_nombre: string;
  estado_actividad: boolean;
  fecha_creacion_actividad: Date;
}

export interface SpCreateActivityResponse {
  success: boolean;
  message: string;
  id_actividad: number;
  nombre_actividad: string;
}

export interface SpUpdateActivityResponse {
  success: boolean;
  message: string;
  id_actividad: number;
  nombre_actividad: string;
}

export interface SpInscribeActivityResponse {
  success: boolean;
  message: string;
  id_usuario: string;
  id_actividad: number;
  nombre_actividad: string;
  estado_inscripcion: string;
  fecha_inscripcion: Date;
}

// API Response interfaces
export interface ActivityListResponse {
  success: boolean;
  message: string;
  data?: Activity[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface ActivityResponse {
  success: boolean;
  message: string;
  data?: Activity;
}

export interface ActivityInscriptionResponse {
  success: boolean;
  message: string;
  data?: ActivityInscription;
}

export interface ActivityCategoryListResponse {
  success: boolean;
  message: string;
  data?: ActivityCategory[];
}
