// =====================================================
// Tipos TypeScript para Gestión de Usuarios
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

export interface User {
  id_usuario: string;
  id_tipo_usuario: number;
  nombre_usuario: string;
  apellido_usuario: string;
  email_usuario: string;
  telefono_usuario?: string;
  colegio_usuario?: string;
  codigo_qr_usuario?: string;
  email_verificado_usuario: boolean;
  ultimo_acceso_usuario?: Date;
  estado_usuario: boolean;
  fecha_inscripcion_usuario: Date;
  fecha_actualizacion_usuario: Date;
}

export interface UserType {
  id_tipo_usuario: number;
  nombre_tipo_usuario: string;
  descripcion_tipo_usuario?: string;
  estado_tipo_usuario: boolean;
  fecha_creacion: Date;
}

export interface UserWithType extends User {
  tipo_usuario: UserType;
}

// DTOs para requests
export interface RegisterUserDto {
  tipo_usuario: 'externo' | 'interno';
  nombre_usuario: string;
  apellido_usuario: string;
  email_usuario: string;
  password: string;
  telefono_usuario?: string;
  colegio_usuario?: string; // Solo para externos
}

export interface LoginUserDto {
  email_usuario: string;
  password: string;
}

export interface VerifyEmailDto {
  token_verificacion: string;
}

export interface ForgotPasswordDto {
  email_usuario: string;
}

export interface ResetPasswordDto {
  token_recuperacion: string;
  new_password: string;
}

export interface UpdateProfileDto {
  nombre_usuario?: string;
  apellido_usuario?: string;
  telefono_usuario?: string;
  colegio_usuario?: string; // Solo para externos
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
}

// DTOs para responses
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: UserWithType;
  token?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  id_usuario?: string;
  codigo_qr?: string | undefined;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  id_usuario?: string;
  email_usuario?: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// Tipos para JWT
export interface JwtPayload {
  id_usuario: string;
  email_usuario: string;
  tipo_usuario: string;
  iat?: number;
  exp?: number;
}

// Tipos para validación
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
}

// Tipos para stored procedures responses
export interface SpRegisterResponse {
  success: boolean;
  message: string;
  id_usuario: string;
}

export interface SpConsultarQRResponse {
  success: boolean;
  message: string;
  id_usuario?: string;
  codigo_qr_usuario?: string;
  nombre_usuario?: string;
  apellido_usuario?: string;
  email_usuario?: string;
}

export interface SpAuthResponse {
  success: boolean;
  message: string;
  id_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
  email_usuario: string;
  tipo_usuario: string;
  email_verificado: boolean;
  bloqueado_hasta?: Date;
}

export interface SpVerifyEmailResponse {
  success: boolean;
  message: string;
  id_usuario: string;
  email_usuario: string;
}

export interface SpForgotPasswordResponse {
  success: boolean;
  message: string;
  token_recuperacion: string;
}

export interface SpResetPasswordResponse {
  success: boolean;
  message: string;
  id_usuario: string;
  email_usuario: string;
}

export interface SpConsultarUsuarioResponse {
  success: boolean;
  message: string;
  id_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
  email_usuario: string;
  telefono_usuario?: string;
  colegio_usuario?: string;
  codigo_qr_usuario?: string;
  email_verificado_usuario: boolean;
  ultimo_acceso_usuario?: Date;
  estado_usuario: boolean;
  fecha_inscripcion_usuario: Date;
  tipo_usuario: string;
}

export interface SpVerificarEmailExisteResponse {
  success: boolean;
  message: string;
  existe: boolean;
  id_usuario?: string;
  email_verificado?: boolean;
}

export interface SpActualizarUsuarioResponse {
  success: boolean;
  message: string;
  id_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
  email_usuario: string;
  telefono_usuario?: string;
  colegio_usuario?: string;
  tipo_usuario: string;
}

export interface SpCambiarPasswordResponse {
  success: boolean;
  message: string;
  id_usuario: string;
  email_usuario: string;
}

export interface SpConsultarTiposUsuarioResponse {
  success: boolean;
  message: string;
  id_tipo_usuario: number;
  nombre_tipo_usuario: string;
  descripcion_tipo_usuario?: string;
  estado_tipo_usuario: boolean;
  fecha_creacion: Date;
}
