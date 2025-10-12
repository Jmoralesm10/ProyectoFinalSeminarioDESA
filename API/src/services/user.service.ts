// =====================================================
// Servicios de Usuarios
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { EmailService } from './email.service';
import { 
  RegisterUserDto, 
  LoginUserDto, 
  VerifyEmailDto, 
  ForgotPasswordDto, 
  ResetPasswordDto,
  UpdateProfileDto,
  ChangePasswordDto,
  AuthResponse,
  RegisterResponse,
  VerifyEmailResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  JwtPayload
} from '../types/user.types';

export class UserService {
  private userRepository: UserRepository;
  private emailService: EmailService;

  constructor() {
    this.userRepository = new UserRepository();
    this.emailService = new EmailService();
  }

  // Generar JWT token
  private generateToken(payload: JwtPayload): string {
    const secret = process.env['JWT_SECRET'] || 'fallback-secret';
    
    return jwt.sign(payload, secret, { expiresIn: '7d' });
  }

  // Registrar nuevo usuario
  async registerUser(userData: RegisterUserDto): Promise<RegisterResponse> {
    try {
      // Validar que el email no exista
      const emailCheck = await this.userRepository.emailExists(userData.email_usuario);
      if (emailCheck.success && emailCheck.existe) {
        return {
          success: false,
          message: 'El email ya está registrado en el sistema'
        };
      }

      // Validar tipo de usuario
      if (!['externo', 'interno'].includes(userData.tipo_usuario)) {
        return {
          success: false,
          message: 'Tipo de usuario inválido'
        };
      }

      // Validar campos requeridos por tipo de usuario
      if (userData.tipo_usuario === 'externo' && !userData.colegio_usuario) {
        return {
          success: false,
          message: 'El colegio es obligatorio para estudiantes externos'
        };
      }

      // Llamar al stored procedure
      const result = await this.userRepository.registerUser(
        userData.tipo_usuario,
        userData.nombre_usuario,
        userData.apellido_usuario,
        userData.email_usuario,
        userData.password,
        userData.telefono_usuario,
        userData.colegio_usuario
      );

      if (result.success) {
        // Intentar enviar correo de confirmación (no crítico para el registro)
        try {
          const userResult = await this.userRepository.getUserByEmail(userData.email_usuario);
          
          if (userResult.success && userResult.id_usuario) {
            // Crear objeto de usuario para el correo (usando 'any' para evitar problemas de tipos)
            const userForEmail: any = {
              id_usuario: userResult.id_usuario,
              nombre_usuario: userResult.nombre_usuario,
              apellido_usuario: userResult.apellido_usuario,
              email_usuario: userResult.email_usuario,
              telefono_usuario: userResult.telefono_usuario,
              colegio_usuario: userResult.colegio_usuario,
              codigo_qr_usuario: userResult.codigo_qr_usuario,
              email_verificado_usuario: userResult.email_verificado_usuario,
              ultimo_acceso_usuario: userResult.ultimo_acceso_usuario,
              estado_usuario: userResult.estado_usuario,
              fecha_inscripcion_usuario: userResult.fecha_inscripcion_usuario,
              tipo_usuario: userResult.tipo_usuario
            };

            // Enviar correo de confirmación de inscripción
            await this.emailService.sendRegistrationConfirmation(userForEmail);
            console.log('✅ Correo de confirmación enviado a:', userData.email_usuario);
          }
        } catch (emailError) {
          console.error('❌ Error enviando correo de confirmación (no crítico):', emailError);
          // No fallar el registro si el correo falla
        }
        
        return {
          success: true,
          message: result.message,
          id_usuario: result.id_usuario,
          codigo_qr: result.codigo_qr
        };
      } else {
        return {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      console.error('Error en registerUser service:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // Autenticar usuario
  async loginUser(loginData: LoginUserDto): Promise<AuthResponse> {
    try {
      const result = await this.userRepository.authenticateUser(
        loginData.email_usuario,
        loginData.password
      );

      if (result.success) {
        // Generar JWT token
        const tokenPayload: JwtPayload = {
          id_usuario: result.id_usuario,
          email_usuario: result.email_usuario,
          tipo_usuario: result.tipo_usuario
        };

        const token = this.generateToken(tokenPayload);

        // Obtener datos completos del usuario
        const userResult = await this.userRepository.getUserById(result.id_usuario);
        
        let user = undefined;
        if (userResult.success) {
          user = {
            id_usuario: userResult.id_usuario,
            nombre_usuario: userResult.nombre_usuario,
            apellido_usuario: userResult.apellido_usuario,
            email_usuario: userResult.email_usuario,
            telefono_usuario: userResult.telefono_usuario,
            colegio_usuario: userResult.colegio_usuario,
            codigo_qr_usuario: userResult.codigo_qr_usuario,
            email_verificado_usuario: userResult.email_verificado_usuario,
            ultimo_acceso_usuario: userResult.ultimo_acceso_usuario,
            estado_usuario: userResult.estado_usuario,
            fecha_inscripcion_usuario: userResult.fecha_inscripcion_usuario,
            tipo_usuario: {
              id_tipo_usuario: 0, // Se puede obtener del SP si es necesario
              nombre_tipo_usuario: userResult.tipo_usuario,
              descripcion_tipo_usuario: '',
              estado_tipo_usuario: true,
              fecha_creacion: new Date()
            }
          };
        }

        return {
          success: true,
          message: result.message,
          user: user as any,
          token
        };
      } else {
        return {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      console.error('Error en loginUser service:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // Verificar email
  async verifyEmail(verifyData: VerifyEmailDto): Promise<VerifyEmailResponse> {
    try {
      const result = await this.userRepository.verifyEmail(verifyData.token_verificacion);
      
      return {
        success: result.success,
        message: result.message,
        id_usuario: result.id_usuario,
        email_usuario: result.email_usuario
      };
    } catch (error) {
      console.error('Error en verifyEmail service:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // Solicitar recuperación de contraseña
  async forgotPassword(forgotData: ForgotPasswordDto): Promise<ForgotPasswordResponse> {
    try {
      const result = await this.userRepository.requestPasswordReset(forgotData.email_usuario);
      
      if (result.success) {
        // TODO: Enviar email con token de recuperación
        // await this.sendPasswordResetEmail(forgotData.email_usuario, result.token_recuperacion);
        
        return {
          success: true,
          message: result.message
        };
      } else {
        return {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      console.error('Error en forgotPassword service:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // Resetear contraseña
  async resetPassword(resetData: ResetPasswordDto): Promise<ResetPasswordResponse> {
    try {
      const result = await this.userRepository.resetPassword(
        resetData.token_recuperacion,
        resetData.new_password
      );

      return {
        success: result.success,
        message: result.message
      };
    } catch (error) {
      console.error('Error en resetPassword service:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // Obtener perfil de usuario
  async getUserProfile(userId: string) {
    try {
      const result = await this.userRepository.getUserById(userId);
      
      if (result.success) {
        return {
          success: true,
          message: result.message,
          data: {
            id_usuario: result.id_usuario,
            nombre_usuario: result.nombre_usuario,
            apellido_usuario: result.apellido_usuario,
            email_usuario: result.email_usuario,
            telefono_usuario: result.telefono_usuario,
            colegio_usuario: result.colegio_usuario,
            codigo_qr_usuario: result.codigo_qr_usuario,
            email_verificado_usuario: result.email_verificado_usuario,
            ultimo_acceso_usuario: result.ultimo_acceso_usuario,
            estado_usuario: result.estado_usuario,
            fecha_inscripcion_usuario: result.fecha_inscripcion_usuario,
            tipo_usuario: result.tipo_usuario
          }
        };
      } else {
        return {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      console.error('Error en getUserProfile service:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // Actualizar perfil de usuario
  async updateUserProfile(userId: string, updateData: UpdateProfileDto) {
    try {
      const result = await this.userRepository.updateUserProfile(
        userId,
        updateData.nombre_usuario,
        updateData.apellido_usuario,
        updateData.telefono_usuario,
        updateData.colegio_usuario
      );
      
      if (result.success) {
        return {
          success: true,
          message: result.message,
          data: {
            id_usuario: result.id_usuario,
            nombre_usuario: result.nombre_usuario,
            apellido_usuario: result.apellido_usuario,
            email_usuario: result.email_usuario,
            telefono_usuario: result.telefono_usuario,
            colegio_usuario: result.colegio_usuario,
            tipo_usuario: result.tipo_usuario
          }
        };
      } else {
        return {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      console.error('Error en updateUserProfile service:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // Cambiar contraseña
  async changePassword(userId: string, changeData: ChangePasswordDto) {
    try {
      const result = await this.userRepository.changePassword(
        userId,
        changeData.current_password,
        changeData.new_password
      );

      return {
        success: result.success,
        message: result.message
      };
    } catch (error) {
      console.error('Error en changePassword service:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // Obtener tipos de usuario
  async getUserTypes() {
    try {
      const result = await this.userRepository.getUserTypes();
      
      if (result && result.length > 0) {
        return {
          success: true,
          message: 'Tipos de usuario obtenidos exitosamente',
          data: result.map(tipo => ({
            id_tipo_usuario: tipo.id_tipo_usuario,
            nombre_tipo_usuario: tipo.nombre_tipo_usuario,
            descripcion_tipo_usuario: tipo.descripcion_tipo_usuario,
            estado_tipo_usuario: tipo.estado_tipo_usuario,
            fecha_creacion: tipo.fecha_creacion
          }))
        };
      } else {
        return {
          success: false,
          message: 'No se encontraron tipos de usuario'
        };
      }
    } catch (error) {
      console.error('Error en getUserTypes service:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // Verificar token JWT
  async verifyToken(token: string): Promise<JwtPayload | null> {
    try {
      const secret = process.env['JWT_SECRET'] || 'fallback-secret';
      const decoded = jwt.verify(token, secret) as JwtPayload;
      return decoded;
    } catch (error) {
      console.error('Error verificando token:', error);
      return null;
    }
  }

  // Enviar correo de confirmación
  async sendConfirmationEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Buscar el usuario por email
      const userResult = await this.userRepository.getUserByEmail(email);
      
      if (!userResult.success || !userResult.id_usuario) {
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }

      // Crear objeto de usuario para el correo
      const userForEmail: any = {
        id_usuario: userResult.id_usuario,
        nombre_usuario: userResult.nombre_usuario,
        apellido_usuario: userResult.apellido_usuario,
        email_usuario: userResult.email_usuario,
        telefono_usuario: userResult.telefono_usuario,
        colegio_usuario: userResult.colegio_usuario,
        codigo_qr_usuario: userResult.codigo_qr_usuario,
        email_verificado_usuario: userResult.email_verificado_usuario,
        ultimo_acceso_usuario: userResult.ultimo_acceso_usuario,
        estado_usuario: userResult.estado_usuario,
        fecha_inscripcion_usuario: userResult.fecha_inscripcion_usuario,
        tipo_usuario: userResult.tipo_usuario
      };

      // Enviar correo de confirmación
      const emailSent = await this.emailService.sendRegistrationConfirmation(userForEmail);
      
      if (emailSent) {
        return {
          success: true,
          message: 'Correo de confirmación enviado exitosamente'
        };
      } else {
        return {
          success: false,
          message: 'Error al enviar el correo de confirmación'
        };
      }
    } catch (error) {
      console.error('Error en sendConfirmationEmail service:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }
}
