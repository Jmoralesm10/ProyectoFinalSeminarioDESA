// =====================================================
// Repositorio de Usuarios
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { executeStoredProcedure } from '../config/database';
import {
  SpRegisterResponse,
  SpAuthResponse,
  SpVerifyEmailResponse,
  SpForgotPasswordResponse,
  SpResetPasswordResponse,
  SpConsultarUsuarioResponse,
  SpVerificarEmailExisteResponse,
  SpActualizarUsuarioResponse,
  SpCambiarPasswordResponse,
  SpConsultarTiposUsuarioResponse,
  SpConsultarQRResponse
} from '../types/user.types';

export class UserRepository {
  
  // Inscribir nuevo usuario usando stored procedure
  async registerUser(
    tipoUsuario: string,
    nombre: string,
    apellido: string,
    email: string,
    password: string,
    telefono?: string,
    colegio?: string
  ): Promise<SpRegisterResponse> {
    try {
      
      const result = await executeStoredProcedure('sp_inscribir_usuario', [
        tipoUsuario,
        nombre,
        apellido,
        email,
        password,
        telefono,
        colegio
      ]);
      
      const finalResult = result && result.length > 0 ? result[0] : result;
      
      return finalResult;
    } catch (error) {
      console.error('❌ Repository: Error en registerUser:', error);
      throw new Error('Error al registrar usuario');
    }
  }

  // Autenticar usuario usando stored procedure
  async authenticateUser(email: string, password: string): Promise<SpAuthResponse> {
    try {
      const result = await executeStoredProcedure('sp_autenticar_usuario', [
        email,
        password
      ]);
      
      return result[0] || result;
    } catch (error) {
      console.error('Error en authenticateUser:', error);
      throw new Error('Error al autenticar usuario');
    }
  }

  // Verificar email usando stored procedure
  async verifyEmail(token: string): Promise<SpVerifyEmailResponse> {
    try {
      const result = await executeStoredProcedure('sp_verificar_email', [token]);
      return result[0] || result;
    } catch (error) {
      console.error('Error en verifyEmail:', error);
      throw new Error('Error al verificar email');
    }
  }

  // Solicitar recuperación de contraseña usando stored procedure
  async requestPasswordReset(email: string): Promise<SpForgotPasswordResponse> {
    try {
      const result = await executeStoredProcedure('sp_solicitar_recuperacion_password', [email]);
      return result[0] || result;
    } catch (error) {
      console.error('Error en requestPasswordReset:', error);
      throw new Error('Error al solicitar recuperación de contraseña');
    }
  }

  // Resetear contraseña usando stored procedure
  async resetPassword(token: string, newPassword: string): Promise<SpResetPasswordResponse> {
    try {
      const result = await executeStoredProcedure('sp_cambiar_password_recuperacion', [
        token,
        newPassword
      ]);
      return result[0] || result;
    } catch (error) {
      console.error('Error en resetPassword:', error);
      throw new Error('Error al resetear contraseña');
    }
  }

  // Obtener usuario por ID usando stored procedure
  async getUserById(id: string): Promise<SpConsultarUsuarioResponse> {
    try {
      const result = await executeStoredProcedure('sp_consultar_usuario', [id]);
      return result[0] || result;
    } catch (error) {
      console.error('Error en getUserById:', error);
      throw new Error('Error al obtener usuario');
    }
  }

  // Obtener usuario por email usando stored procedure
  async getUserByEmail(email: string): Promise<SpConsultarUsuarioResponse> {
    try {
      const result = await executeStoredProcedure('sp_consultar_usuario_por_email', [email]);
      return result[0] || result;
    } catch (error) {
      console.error('Error en getUserByEmail:', error);
      throw new Error('Error al obtener usuario por email');
    }
  }

  // Verificar si el email existe usando stored procedure
  async emailExists(email: string): Promise<SpVerificarEmailExisteResponse> {
    try {
      const result = await executeStoredProcedure('sp_verificar_email_existe', [email]);
      return result[0] || result;
    } catch (error) {
      console.error('Error en emailExists:', error);
      throw new Error('Error al verificar email');
    }
  }

  // Actualizar perfil de usuario usando stored procedure
  async updateUserProfile(
    id: string, 
    nombre?: string, 
    apellido?: string, 
    telefono?: string, 
    colegio?: string
  ): Promise<SpActualizarUsuarioResponse> {
    try {
      const result = await executeStoredProcedure('sp_actualizar_usuario', [
        id,
        nombre,
        apellido,
        telefono,
        colegio
      ]);
      return result[0] || result;
    } catch (error) {
      console.error('Error en updateUserProfile:', error);
      throw new Error('Error al actualizar perfil');
    }
  }

  // Cambiar contraseña usando stored procedure
  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<SpCambiarPasswordResponse> {
    try {
      const result = await executeStoredProcedure('sp_cambiar_password', [
        id,
        currentPassword,
        newPassword
      ]);
      return result[0] || result;
    } catch (error) {
      console.error('Error en changePassword:', error);
      throw new Error('Error al cambiar contraseña');
    }
  }

  // Obtener todos los tipos de usuario usando stored procedure
  async getUserTypes(): Promise<SpConsultarTiposUsuarioResponse[]> {
    try {
      const result = await executeStoredProcedure('sp_consultar_tipos_usuario', []);
      return result[0] || result;
    } catch (error) {
      console.error('Error en getUserTypes:', error);
      throw new Error('Error al obtener tipos de usuario');
    }
  }

  // Consultar código QR de un usuario usando stored procedure
  async getUserQRCode(id_usuario: string): Promise<SpConsultarQRResponse> {
    try {
      
      const result = await executeStoredProcedure('sp_consultar_codigo_qr_usuario', [id_usuario]);
      
      
      return result[0] || result;
    } catch (error) {
      console.error('❌ Repository: Error en getUserQRCode:', error);
      throw new Error('Error al obtener código QR del usuario');
    }
  }
}
