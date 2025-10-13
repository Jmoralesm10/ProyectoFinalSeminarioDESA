// =====================================================
// Tipos para el sistema de administradores
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

// Tipos de roles de administrador
export type AdminRole = 'admin' | 'super_admin' | 'moderador';

// Tipos de permisos
export type AdminPermission = 
  | 'gestion_usuarios'
  | 'gestion_actividades'
  | 'gestion_administradores'
  | 'ver_reportes'
  | 'gestion_sistema'
  | 'gestion_asistencia'
  | 'gestion_diplomas'
  | 'gestion_pagos';

// DTO para crear administrador
export interface CreateAdminDto {
  id_usuario: string;
  rol_administrador: AdminRole;
  permisos_administrador: AdminPermission[];
  observaciones_administrador?: string | undefined;
}

// DTO para actualizar administrador
export interface UpdateAdminDto {
  rol_administrador?: AdminRole;
  permisos_administrador?: AdminPermission[];
  estado_administrador?: boolean;
  observaciones_administrador?: string;
}

// DTO para asignar administrador
export interface AssignAdminDto {
  email_usuario: string;
  rol_administrador: AdminRole;
  permisos_administrador: AdminPermission[];
  observaciones_administrador?: string;
}

// Respuesta de administrador
export interface AdminResponse {
  id_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
  email_usuario: string;
  rol_administrador: AdminRole;
  permisos_administrador: AdminPermission[];
  estado_administrador: boolean;
  fecha_asignacion_administrador: string;
  fecha_ultima_actividad_administrador?: string;
  observaciones_administrador?: string;
}

// DTO para verificar permisos
export interface CheckPermissionDto {
  id_usuario: string;
  operacion: string;
}

// Respuesta de verificación de permisos
export interface PermissionCheckResponse {
  success: boolean;
  message: string;
  has_permission: boolean;
  user_role?: AdminRole;
  user_permissions?: AdminPermission[];
}

// DTO para listar administradores
export interface ListAdminsDto {
  rol_administrador?: AdminRole | undefined;
  estado_administrador?: boolean | undefined;
  limite?: number | undefined;
  offset?: number | undefined;
}

// Respuesta de lista de administradores
export interface ListAdminsResponse {
  success: boolean;
  message: string;
  admins: AdminResponse[];
  total_admins: number;
  current_page: number;
  total_pages: number;
}

// DTO para actividad de administrador
export interface AdminActivityDto {
  id_usuario: string;
  accion: string;
  detalles?: any;
  ip_address?: string | undefined;
  user_agent?: string | undefined;
}

// Respuesta de actividad de administrador
export interface AdminActivityResponse {
  success: boolean;
  message: string;
  activity_logged: boolean;
}

// DTO para estadísticas de administradores
export interface AdminStatsDto {
  fecha_desde?: string;
  fecha_hasta?: string;
  rol_administrador?: AdminRole;
}

// Estadísticas de administradores
export interface AdminStats {
  total_administradores: number;
  administradores_activos: number;
  administradores_por_rol: {
    admin: number;
    super_admin: number;
    moderador: number;
  };
  actividades_recientes: Array<{
    id_usuario: string;
    nombre_completo: string;
    accion: string;
    fecha_actividad: string;
  }>;
}

// Respuesta de estadísticas
export interface AdminStatsResponse {
  success: boolean;
  message: string;
  stats?: AdminStats;
}
