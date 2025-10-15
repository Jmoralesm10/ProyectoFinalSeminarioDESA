// =====================================================
// Tipos para Endpoints Públicos
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

// =====================================================
// DTOs DE ENTRADA
// =====================================================

export interface ConsultarFaqDto {
  categoria_faq?: string | undefined;
}

// =====================================================
// DTOs DE RESPUESTA
// =====================================================

export interface FaqResponse {
  id_faq: number;
  pregunta_faq: string;
  respuesta_faq: string;
  categoria_faq: string;
  orden_faq: number;
  fecha_creacion_faq: string;
  fecha_actualizacion_faq: string;
}

export interface InformacionCongresoResponse {
  id_informacion: number;
  titulo_informacion: string;
  descripcion_informacion: string;
  fecha_inicio_informacion: string;
  fecha_fin_informacion: string;
  lugar_informacion: string;
  informacion_carrera_informacion: string;
  fecha_creacion_informacion: string;
  fecha_actualizacion_informacion: string;
}

export interface AgendaCongresoResponse {
  id_agenda: number;
  id_informacion: number;
  dia_agenda: number;
  hora_inicio_agenda: string;
  hora_fin_agenda: string;
  titulo_actividad_agenda: string;
  descripcion_actividad_agenda: string;
  tipo_actividad_agenda: string;
  ponente_agenda: string;
  orden_agenda: number;
  fecha_creacion_agenda: string;
  fecha_actualizacion_agenda: string;
}

export interface PonenteCongresoResponse {
  id_ponente: number;
  id_informacion: number;
  nombre_ponente: string;
  apellido_ponente: string;
  nombre_completo_ponente: string;
  titulo_academico_ponente: string;
  cargo_ponente: string;
  empresa_ponente: string;
  especialidad_ponente: string;
  foto_ponente_path: string;
  email_ponente: string;
  linkedin_ponente: string;
  twitter_ponente: string;
  fecha_creacion_ponente: string;
  fecha_actualizacion_ponente: string;
}

// =====================================================
// RESPUESTAS DE API
// =====================================================

export interface ConsultarFaqResponse {
  success: boolean;
  message: string;
  total_registros: number;
  faqs: FaqResponse[];
  categoria_filtro?: string | undefined;
}

export interface ConsultarInformacionCongresoResponse {
  success: boolean;
  message: string;
  informacion: InformacionCongresoResponse | null;
}

export interface ConsultarAgendaCongresoDto {
  dia_agenda?: number | undefined;
  tipo_actividad?: string | undefined;
}

export interface ConsultarAgendaCongresoResponse {
  success: boolean;
  message: string;
  total_registros: number;
  agenda: AgendaCongresoResponse[];
  filtros_aplicados?: {
    dia_agenda?: number | undefined;
    tipo_actividad?: string | undefined;
  };
}

export interface ConsultarPonentesCongresoDto {
  especialidad?: string | undefined;
  empresa?: string | undefined;
}

export interface ConsultarPonentesCongresoResponse {
  success: boolean;
  message: string;
  total_registros: number;
  ponentes: PonenteCongresoResponse[];
  filtros_aplicados?: {
    especialidad?: string | undefined;
    empresa?: string | undefined;
  };
}

// =====================================================
// RESPUESTA GENÉRICA PÚBLICA
// =====================================================

export interface PublicApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}
