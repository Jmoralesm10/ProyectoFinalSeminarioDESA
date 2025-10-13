// =====================================================
// Servicios de Usuarios
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { EmailService } from './email.service';
import { executeQuery } from '../config/database';
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
  JwtPayload,
  ListUsersDto,
  SearchUsersDto,
  UpdateUserStatusDto,
  UserHistoryDto,
  UpdateAdminPermissionsDto,
  ListUsersResponse,
  SearchUsersResponse,
  UserHistoryResponse,
  UpdateUserStatusResponse,
  DeleteUserResponse,
  UpdateAdminPermissionsResponse
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

      
      if (result.success && result.id_usuario) {
        // Obtener el código QR del usuario recién creado
        let qrResult = null;
        try {
          qrResult = await this.userRepository.getUserQRCode(result.id_usuario);
        } catch (qrError) {
          console.error('❌ Error obteniendo código QR (no crítico):', qrError);
        }

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
              codigo_qr_usuario: qrResult?.codigo_qr_usuario || userResult.codigo_qr_usuario,
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
        
        const finalResponse = {
          success: true,
          message: result.message,
          id_usuario: result.id_usuario,
          codigo_qr: qrResult?.codigo_qr_usuario
        };
        
        return finalResponse;
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
        const userResult = await this.userRepository.getUserByEmail(result.email_usuario);
        
        
        let user = undefined;
        if (userResult.success) {
          // Obtener información del tipo de usuario desde la base de datos
          const tipoUsuarioQuery = `
            SELECT 
              tu.id_tipo_usuario,
              tu.nombre_tipo_usuario,
              tu.descripcion_tipo_usuario,
              tu.estado_tipo_usuario,
              tu.fecha_creacion
            FROM tb_tipos_usuario tu
            WHERE tu.id_tipo_usuario = $1
          `;
          
          // Primero necesitamos obtener el id_tipo_usuario del usuario
          const userDetailsQuery = `
            SELECT 
              u.id_tipo_usuario,
              u.es_administrador,
              u.permisos_especiales
            FROM tb_usuarios u
            WHERE u.id_usuario = $1
          `;
          
          const userDetailsResult = await executeQuery(userDetailsQuery, [userResult.id_usuario]);
          const userDetails = userDetailsResult.rows[0];
          
           const tipoUsuarioResult = await executeQuery(tipoUsuarioQuery, [userDetails.id_tipo_usuario]);
          
          const tipoUsuario = tipoUsuarioResult.rows[0] || {
            id_tipo_usuario: userDetails.id_tipo_usuario,
            nombre_tipo_usuario: userResult.tipo_usuario,
            descripcion_tipo_usuario: '',
            estado_tipo_usuario: true,
            fecha_creacion: new Date()
          };
          

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
            es_administrador: userDetails.es_administrador || false,
            permisos_especiales: userDetails.permisos_especiales || null,
            tipo_usuario: tipoUsuario
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

  /**
   * Verifica si un usuario es administrador
   */
  async isUserAdmin(userId: string): Promise<boolean> {
    try {
      console.log('🔐 [UserService] Verificando si usuario es administrador:', userId);

      const query = `
        SELECT 
          u.es_administrador,
          u.id_tipo_usuario,
          tu.nombre_tipo_usuario
        FROM tb_usuarios u
        LEFT JOIN tb_tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
        WHERE u.id_usuario = $1
      `;
      
      const result = await executeQuery(query, [userId]);
      
      if (result && result.length > 0) {
        const user = result[0];
        const isAdmin = user.es_administrador === true || user.nombre_tipo_usuario === 'administrador';
        console.log('🔐 [UserService] Usuario es administrador:', isAdmin);
        console.log('🔐 [UserService] Datos del usuario:', {
          es_administrador: user.es_administrador,
          id_tipo_usuario: user.id_tipo_usuario,
          nombre_tipo_usuario: user.nombre_tipo_usuario
        });
        return isAdmin;
      }
      
      console.log('🔐 [UserService] Usuario no encontrado');
      return false;
    } catch (error) {
      console.error('❌ [UserService] Error al verificar si usuario es administrador:', error);
      return false;
    }
  }

  /**
   * Verifica si un usuario tiene un permiso específico
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      console.log('🔐 [UserService] hasPermission - Verificando permiso:', permission, 'para usuario:', userId);
      
      // Obtener permisos del usuario usando la misma lógica que getUserPermissions
      const permissions = await this.getUserPermissions(userId);
      console.log('🔐 [UserService] hasPermission - Permisos obtenidos:', permissions);
      
      // Verificar si tiene el permiso específico
      const hasPermission = permissions[permission] === true;
      console.log('🔐 [UserService] hasPermission - Tiene permiso específico:', hasPermission);
      
      // Super admin tiene acceso a todo
      if (permissions.rol_administrador === 'super_admin') {
        console.log('🔐 [UserService] hasPermission - Super admin detectado, acceso total concedido');
        return true;
      }
      
      console.log('🔐 [UserService] hasPermission - Resultado final:', hasPermission);
      return hasPermission;
    } catch (error) {
      console.error('Error al verificar permiso:', error);
      return false;
    }
  }

  /**
   * Obtiene los permisos de un usuario
   */
  async getUserPermissions(userId: string): Promise<any> {
    try {
      console.log('🔐 [UserService] Obteniendo permisos del usuario:', userId);

      // Obtener permisos desde tb_administradores
      const adminQuery = `
        SELECT 
          a.permisos_administrador,
          a.rol_administrador
        FROM tb_administradores a
        WHERE a.id_usuario = $1 AND a.estado_administrador = true
      `;
      
      const adminResult = await executeQuery(adminQuery, [userId]);
      console.log('🔐 [UserService] Resultado de consulta tb_administradores:', adminResult);
      
      if (adminResult && adminResult.rows && adminResult.rows.length > 0) {
        const adminData = adminResult.rows[0];
        console.log('🔐 [UserService] Datos de administrador encontrados:', adminData);
        
        // Convertir permisos de array a objeto
        let permisos: any = {};
        
        if (adminData.permisos_administrador && Array.isArray(adminData.permisos_administrador)) {
          // Si es un array de strings, convertir a objeto
          adminData.permisos_administrador.forEach((permiso: any) => {
            if (typeof permiso === 'string') {
              permisos[permiso] = true;
            } else if (typeof permiso === 'object') {
              // Si es un objeto, agregar sus propiedades
              Object.assign(permisos, permiso);
            }
          });
        }
        
        // Agregar información del rol
        permisos.rol_administrador = adminData.rol_administrador;
        permisos.nivel_admin = adminData.rol_administrador === 'super_admin' ? 'super' : 'admin';
        permisos.acceso_admin = true;
        
        console.log('🔐 [UserService] Permisos procesados:', permisos);
        return permisos;
      }
      
      console.log('🔐 [UserService] Usuario no es administrador');
      
      // Si no está en tb_administradores, verificar si es admin por tipo_usuario
      const userQuery = `
        SELECT 
          u.es_administrador,
          u.permisos_especiales,
          tu.nombre_tipo_usuario
        FROM tb_usuarios u
        LEFT JOIN tb_tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
        WHERE u.id_usuario = $1
      `;
      
      const userResult = await executeQuery(userQuery, [userId]);
      
      if (userResult && userResult.rows && userResult.rows.length > 0) {
        const userData = userResult.rows[0];
        
        if (userData.es_administrador || userData.nombre_tipo_usuario === 'administrador') {
          console.log('🔐 [UserService] Usuario es admin por tipo_usuario');
          
          // Procesar permisos_especiales si existen
          let permisos: any = {};
          
          if (userData.permisos_especiales && Array.isArray(userData.permisos_especiales)) {
            userData.permisos_especiales.forEach((permiso: any) => {
              if (typeof permiso === 'string') {
                permisos[permiso] = true;
              } else if (typeof permiso === 'object') {
                Object.assign(permisos, permiso);
              }
            });
          }
          
          permisos.acceso_admin = true;
          permisos.nivel_admin = 'admin';
          permisos.rol_administrador = 'admin';
          
          console.log('🔐 [UserService] Permisos desde permisos_especiales:', permisos);
          return permisos;
        }
      }
      
      console.log('🔐 [UserService] Usuario no es administrador');
      return {};
    } catch (error) {
      console.error('❌ [UserService] Error al obtener permisos:', error);
      return {};
    }
  }

  /**
   * Obtiene información de administradores
   */
  async getAdmins(): Promise<any[]> {
    try {
      console.log('🔐 [UserService] Obteniendo lista de administradores');

      const query = 'SELECT * FROM vista_administradores';
      const result = await executeQuery(query);
      
      return result.map((admin: any) => ({
        id_usuario: admin.id_usuario,
        nombre_usuario: admin.nombre_usuario,
        apellido_usuario: admin.apellido_usuario,
        email_usuario: admin.email_usuario,
        telefono_usuario: admin.telefono_usuario,
        es_administrador: admin.es_administrador,
        permisos_especiales: admin.permisos_especiales,
        rol_administrador: admin.rol_administrador,
        permisos_administrador: admin.permisos_administrador,
        estado_administrador: admin.estado_administrador,
        fecha_asignacion: admin.fecha_asignacion_administrador,
        fecha_ultima_actividad: admin.fecha_ultima_actividad_administrador,
        observaciones: admin.observaciones_administrador,
        estado_usuario: admin.estado_usuario,
        fecha_inscripcion: admin.fecha_inscripcion_usuario,
        ultimo_acceso: admin.ultimo_acceso_usuario
      }));
    } catch (error) {
      console.error('❌ [UserService] Error al obtener administradores:', error);
      return [];
    }
  }

  // Promover usuario a administrador
  async promoteToAdmin(idUsuario: string, rolAdmin: string = 'admin', permisos: string[] = [], asignadoPor: string, observaciones?: string): Promise<{ success: boolean; message: string }> {
    try {
      
      // Permisos por defecto según el rol
      let permisosDefault: string[] = [];
      if (permisos.length === 0) {
        switch (rolAdmin) {
          case 'super_admin':
            permisosDefault = ['gestionar_usuarios', 'gestionar_actividades', 'gestionar_administradores', 'ver_reportes', 'gestionar_asistencia', 'gestionar_sistema'];
            break;
          case 'admin':
            permisosDefault = ['gestionar_usuarios', 'gestionar_actividades', 'ver_reportes', 'gestionar_asistencia'];
            break;
          case 'moderador':
            permisosDefault = ['gestionar_usuarios', 'gestionar_actividades', 'ver_reportes'];
            break;
          default:
            permisosDefault = ['gestionar_usuarios', 'gestionar_actividades', 'ver_reportes'];
        }
      } else {
        permisosDefault = permisos;
      }

      const query = 'SELECT promover_a_administrador($1, $2, $3, $4, $5) as resultado';
      const result = await executeQuery(query, [idUsuario, rolAdmin, permisosDefault, asignadoPor, observaciones || null]);
      
      if (result[0]?.resultado) {
        return {
          success: true,
          message: 'Usuario promovido a administrador exitosamente'
        };
      } else {
        return {
          success: false,
          message: 'Error al promover usuario a administrador'
        };
      }
    } catch (error) {
      console.error('❌ [UserService] Error al promover a administrador:', error);
      return {
        success: false,
        message: 'Error al promover usuario a administrador'
      };
    }
  }

  // Quitar permisos de administrador
  async demoteFromAdmin(idUsuario: string): Promise<{ success: boolean; message: string }> {
    try {
      
      const query = 'SELECT quitar_administrador($1) as resultado';
      const result = await executeQuery(query, [idUsuario]);
      
      if (result[0]?.resultado) {
        return {
          success: true,
          message: 'Permisos de administrador removidos exitosamente'
        };
      } else {
        return {
          success: false,
          message: 'Error al quitar permisos de administrador'
        };
      }
    } catch (error) {
      console.error('❌ [UserService] Error al quitar permisos de administrador:', error);
      return {
        success: false,
        message: 'Error al quitar permisos de administrador'
      };
    }
  }

  // Obtener estadísticas del sistema
  async getSystemStats(): Promise<any> {
    try {
      
      const statsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM tb_usuarios WHERE estado_usuario = true) as total_usuarios,
          (SELECT COUNT(*) FROM tb_administradores WHERE estado_administrador = true) as total_administradores,
          (SELECT COUNT(*) FROM tb_actividades WHERE estado_actividad = true) as total_actividades,
          (SELECT COUNT(*) FROM tb_asistencia_general) as total_asistencia_general,
          (SELECT COUNT(*) FROM tb_asistencia_actividad) as total_asistencia_actividades
      `;
      
      const result = await executeQuery(statsQuery);
      const stats = result[0];
      
      return {
        total_usuarios: parseInt(stats.total_usuarios) || 0,
        total_administradores: parseInt(stats.total_administradores) || 0,
        total_actividades: parseInt(stats.total_actividades) || 0,
        total_asistencia_general: parseInt(stats.total_asistencia_general) || 0,
        total_asistencia_actividades: parseInt(stats.total_asistencia_actividades) || 0,
        porcentaje_asistencia: stats.total_usuarios > 0 
          ? Math.round(((parseInt(stats.total_asistencia_general) || 0) / stats.total_usuarios) * 100)
          : 0
      };
    } catch (error) {
      console.error('❌ [UserService] Error al obtener estadísticas:', error);
      return {
        total_usuarios: 0,
        total_administradores: 0,
        total_actividades: 0,
        total_asistencia_general: 0,
        total_asistencia_actividades: 0,
        porcentaje_asistencia: 0
      };
    }
  }

  // =====================================================
  // MÉTODOS PARA GESTIÓN DE USUARIOS (ADMIN)
  // =====================================================

  // Listar usuarios con filtros
  async listUsers(filters: ListUsersDto): Promise<ListUsersResponse> {
    try {
      return await this.userRepository.listUsers(filters);
    } catch (error) {
      console.error('❌ [UserService] Error al listar usuarios:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // Buscar usuarios
  async searchUsers(searchData: SearchUsersDto): Promise<SearchUsersResponse> {
    try {
      return await this.userRepository.searchUsers(searchData);
    } catch (error) {
      console.error('❌ [UserService] Error al buscar usuarios:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // Cambiar estado de usuario
  async updateUserStatus(idUsuario: string, statusData: UpdateUserStatusDto): Promise<UpdateUserStatusResponse> {
    try {
      return await this.userRepository.updateUserStatus(idUsuario, statusData);
    } catch (error) {
      console.error('❌ [UserService] Error al actualizar estado de usuario:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // Eliminar usuario
  async deleteUser(idUsuario: string): Promise<DeleteUserResponse> {
    try {
      return await this.userRepository.deleteUser(idUsuario);
    } catch (error) {
      console.error('❌ [UserService] Error al eliminar usuario:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // Obtener historial de usuario
  async getUserHistory(idUsuario: string, historyData: UserHistoryDto): Promise<UserHistoryResponse> {
    try {
      return await this.userRepository.getUserHistory(idUsuario, historyData);
    } catch (error) {
      console.error('❌ [UserService] Error al obtener historial de usuario:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // Actualizar permisos de administrador
  async updateAdminPermissions(idUsuario: string, permissionsData: UpdateAdminPermissionsDto): Promise<UpdateAdminPermissionsResponse> {
    try {
      return await this.userRepository.updateAdminPermissions(idUsuario, permissionsData);
    } catch (error) {
      console.error('❌ [UserService] Error al actualizar permisos de administrador:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }
}
