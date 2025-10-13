// =====================================================
// Controladores de Usuarios
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { 
  RegisterUserDto, 
  LoginUserDto, 
  VerifyEmailDto, 
  ForgotPasswordDto, 
  ResetPasswordDto,
  UpdateProfileDto,
  ChangePasswordDto,
  ApiResponse,
  ListUsersDto,
  SearchUsersDto,
  UpdateUserStatusDto,
  UserHistoryDto,
  UpdateAdminPermissionsDto
} from '../types/user.types';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // Registrar nuevo usuario
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: RegisterUserDto = req.body;

      // Validaciones básicas
      if (!userData.tipo_usuario || !userData.nombre_usuario || !userData.apellido_usuario || 
          !userData.email_usuario || !userData.password) {
        const response: ApiResponse = {
          success: false,
          message: 'Todos los campos obligatorios deben ser proporcionados',
          errors: [
            { field: 'tipo_usuario', message: 'Tipo de usuario es obligatorio' },
            { field: 'nombre_usuario', message: 'Nombre es obligatorio' },
            { field: 'apellido_usuario', message: 'Apellido es obligatorio' },
            { field: 'email_usuario', message: 'Email es obligatorio' },
            { field: 'password', message: 'Contraseña es obligatoria' }
          ]
        };
        res.status(400).json(response);
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email_usuario)) {
        const response: ApiResponse = {
          success: false,
          message: 'Formato de email inválido',
          errors: [{ field: 'email_usuario', message: 'Formato de email inválido' }]
        };
        res.status(400).json(response);
        return;
      }

      // Validar dominio según tipo de usuario
      if (userData.tipo_usuario === 'interno' && !userData.email_usuario.endsWith('@miumg.edu.gt')) {
        const response: ApiResponse = {
          success: false,
          message: 'Para usuarios internos, debe usar un email de UMG (@miumg.edu.gt)',
          errors: [{ field: 'email_usuario', message: 'Para usuarios internos, debe usar un email de UMG (@miumg.edu.gt)' }]
        };
        res.status(400).json(response);
        return;
      }

      if (userData.tipo_usuario === 'externo' && !userData.email_usuario.endsWith('.edu.gt')) {
        const response: ApiResponse = {
          success: false,
          message: 'Para usuarios externos, debe usar un email educativo (.edu.gt)',
          errors: [{ field: 'email_usuario', message: 'Para usuarios externos, debe usar un email educativo (.edu.gt)' }]
        };
        res.status(400).json(response);
        return;
      }

      // Validar longitud de contraseña
      if (userData.password.length < 8) {
        const response: ApiResponse = {
          success: false,
          message: 'La contraseña debe tener al menos 8 caracteres',
          errors: [{ field: 'password', message: 'La contraseña debe tener al menos 8 caracteres' }]
        };
        res.status(400).json(response);
        return;
      }

      const result = await this.userService.registerUser(userData);
      
      if (result.success) {
        res.status(201).json({
          success: true,
          message: result.message,
          data: {
            id_usuario: result.id_usuario,
            codigo_qr: result.codigo_qr
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('Error en register controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env['NODE_ENV'] === 'development' ? (error as Error).message : undefined
      });
    }
  };

  // Autenticar usuario
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const loginData: LoginUserDto = req.body;

      // Validaciones básicas
      if (!loginData.email_usuario || !loginData.password) {
        const response: ApiResponse = {
          success: false,
          message: 'Email y contraseña son obligatorios',
          errors: [
            { field: 'email_usuario', message: 'Email es obligatorio' },
            { field: 'password', message: 'Contraseña es obligatoria' }
          ]
        };
        res.status(400).json(response);
        return;
      }

      const result = await this.userService.loginUser(loginData);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: {
            user: result.user,
            token: result.token
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('Error en login controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Verificar email
  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const verifyData: VerifyEmailDto = req.body;

      if (!verifyData.token_verificacion) {
        const response: ApiResponse = {
          success: false,
          message: 'Token de verificación es obligatorio',
          errors: [{ field: 'token_verificacion', message: 'Token de verificación es obligatorio' }]
        };
        res.status(400).json(response);
        return;
      }

      const result = await this.userService.verifyEmail(verifyData);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: {
            id_usuario: result.id_usuario,
            email_usuario: result.email_usuario
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('Error en verifyEmail controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Solicitar recuperación de contraseña
  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const forgotData: ForgotPasswordDto = req.body;

      if (!forgotData.email_usuario) {
        const response: ApiResponse = {
          success: false,
          message: 'Email es obligatorio',
          errors: [{ field: 'email_usuario', message: 'Email es obligatorio' }]
        };
        res.status(400).json(response);
        return;
      }

      const result = await this.userService.forgotPassword(forgotData);
      
      res.status(200).json({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      console.error('Error en forgotPassword controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Resetear contraseña
  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const resetData: ResetPasswordDto = req.body;

      if (!resetData.token_recuperacion || !resetData.new_password) {
        const response: ApiResponse = {
          success: false,
          message: 'Token y nueva contraseña son obligatorios',
          errors: [
            { field: 'token_recuperacion', message: 'Token de recuperación es obligatorio' },
            { field: 'new_password', message: 'Nueva contraseña es obligatoria' }
          ]
        };
        res.status(400).json(response);
        return;
      }

      if (resetData.new_password.length < 8) {
        const response: ApiResponse = {
          success: false,
          message: 'La nueva contraseña debe tener al menos 8 caracteres',
          errors: [{ field: 'new_password', message: 'La nueva contraseña debe tener al menos 8 caracteres' }]
        };
        res.status(400).json(response);
        return;
      }

      const result = await this.userService.resetPassword(resetData);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('Error en resetPassword controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Obtener perfil de usuario
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id_usuario;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const result = await this.userService.getUserProfile(userId);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.data
        });
      } else {
        res.status(404).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('Error en getProfile controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Actualizar perfil de usuario
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id_usuario;
      const updateData: UpdateProfileDto = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const result = await this.userService.updateUserProfile(userId, updateData);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('Error en updateProfile controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Cambiar contraseña
  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id_usuario;
      const changeData: ChangePasswordDto = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (!changeData.current_password || !changeData.new_password) {
        const response: ApiResponse = {
          success: false,
          message: 'Contraseña actual y nueva contraseña son obligatorias',
          errors: [
            { field: 'current_password', message: 'Contraseña actual es obligatoria' },
            { field: 'new_password', message: 'Nueva contraseña es obligatoria' }
          ]
        };
        res.status(400).json(response);
        return;
      }

      if (changeData.new_password.length < 8) {
        const response: ApiResponse = {
          success: false,
          message: 'La nueva contraseña debe tener al menos 8 caracteres',
          errors: [{ field: 'new_password', message: 'La nueva contraseña debe tener al menos 8 caracteres' }]
        };
        res.status(400).json(response);
        return;
      }

      const result = await this.userService.changePassword(userId, changeData);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('Error en changePassword controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Obtener tipos de usuario
  getUserTypes = async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.userService.getUserTypes();
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('Error en getUserTypes controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Enviar correo de confirmación
  sendConfirmationEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email_usuario } = req.body;

      if (!email_usuario) {
        res.status(400).json({
          success: false,
          message: 'El email es requerido'
        });
        return;
      }

      const result = await this.userService.sendConfirmationEmail(email_usuario);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('Error en sendConfirmationEmail controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };



  // =====================================================
  // MÉTODOS PARA ADMINISTRADORES
  // =====================================================

  // Obtener lista de administradores
  getAdmins = async (_req: Request, res: Response): Promise<void> => {
    try {
      console.log('👑 [UserController] Obteniendo lista de administradores');
      
      const admins = await this.userService.getAdmins();
      
      res.json({
        success: true,
        message: 'Administradores obtenidos exitosamente',
        data: admins
      });
    } catch (error) {
      console.error('❌ [UserController] Error al obtener administradores:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Obtener permisos de un usuario
  getUserPermissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params['userId'];
      const requestingUserId = (req as any).user?.id_usuario;
      console.log('🔐 [UserController] Obteniendo permisos de usuario:', userId, 'por usuario:', requestingUserId);
      
      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario requerido'
        });
        return;
      }

      // Verificar que el usuario solo pueda acceder a sus propios permisos (a menos que sea admin)
      if (userId !== requestingUserId) {
        const isAdmin = await this.userService.isUserAdmin(requestingUserId);
        if (!isAdmin) {
          res.status(403).json({
            success: false,
            message: 'No tienes permisos para acceder a los permisos de otro usuario'
          });
          return;
        }
      }

      const permissions = await this.userService.getUserPermissions(userId);
      
      res.json({
        success: true,
        message: 'Permisos obtenidos exitosamente',
        data: {
          id_usuario: userId,
          permisos: permissions
        }
      });
    } catch (error) {
      console.error('❌ [UserController] Error al obtener permisos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Promover usuario a administrador
  promoteToAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params['userId'];
      const { rol_administrador, permisos, observaciones } = req.body;
      const asignadoPor = req.user?.id_usuario;
      
      console.log('⬆️ [UserController] Promoviendo usuario a administrador:', { userId, rol_administrador, permisos });
      
      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario requerido'
        });
        return;
      }

      if (!asignadoPor) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const result = await this.userService.promoteToAdmin(
        userId, 
        rol_administrador || 'admin', 
        permisos || [], 
        asignadoPor, 
        observaciones
      );
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('❌ [UserController] Error al promover a administrador:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Quitar permisos de administrador
  demoteFromAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params['userId'];
      console.log('⬇️ [UserController] Quitando permisos de administrador:', userId);
      
      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario requerido'
        });
        return;
      }

      const result = await this.userService.demoteFromAdmin(userId);
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('❌ [UserController] Error al quitar permisos de administrador:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Obtener estadísticas del sistema
  getSystemStats = async (_req: Request, res: Response): Promise<void> => {
    try {
      console.log('📊 [UserController] Obteniendo estadísticas del sistema');
      
      const stats = await this.userService.getSystemStats();
      
      res.json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: stats
      });
    } catch (error) {
      console.error('❌ [UserController] Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // =====================================================
  // ENDPOINTS PARA GESTIÓN DE USUARIOS (ADMIN)
  // =====================================================

  // Listar usuarios con filtros
  listUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: ListUsersDto = {
        tipo_usuario: req.query['tipo_usuario'] as string || undefined,
        estado_usuario: req.query['estado_usuario'] === 'true' ? true : req.query['estado_usuario'] === 'false' ? false : undefined,
        busqueda: req.query['busqueda'] as string || undefined,
        rol_administrador: req.query['rol_administrador'] as string || undefined,
        limite: req.query['limite'] ? parseInt(req.query['limite'] as string) : 50,
        offset: req.query['offset'] ? parseInt(req.query['offset'] as string) : 0
      };

      const result = await this.userService.listUsers(filters);
      
      // Siempre devolver 200, incluso si no hay usuarios
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ [UserController] Error al listar usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Buscar usuarios
  searchUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const searchData: SearchUsersDto = {
        termino_busqueda: req.query['termino_busqueda'] as string,
        tipo_usuario: req.query['tipo_usuario'] as string || undefined,
        estado_usuario: req.query['estado_usuario'] === 'true' ? true : req.query['estado_usuario'] === 'false' ? false : undefined,
        limite: req.query['limite'] ? parseInt(req.query['limite'] as string) : 50,
        offset: req.query['offset'] ? parseInt(req.query['offset'] as string) : 0
      };

      if (!searchData.termino_busqueda) {
        res.status(400).json({
          success: false,
          message: 'Término de búsqueda requerido'
        });
        return;
      }

      const result = await this.userService.searchUsers(searchData);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('❌ [UserController] Error al buscar usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Cambiar estado de usuario
  updateUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const idUsuario = req.params['id'];
      const statusData: UpdateUserStatusDto = req.body;

      if (!idUsuario) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario requerido'
        });
        return;
      }

      if (typeof statusData.estado_usuario !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'Estado de usuario debe ser un valor booleano'
        });
        return;
      }

      const result = await this.userService.updateUserStatus(idUsuario, statusData);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('❌ [UserController] Error al actualizar estado de usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Eliminar usuario
  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const idUsuario = req.params['id'];

      if (!idUsuario) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario requerido'
        });
        return;
      }

      const result = await this.userService.deleteUser(idUsuario);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('❌ [UserController] Error al eliminar usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Obtener historial de usuario
  getUserHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const idUsuario = req.params['id'];
      const historyData: UserHistoryDto = {
        fecha_desde: req.query['fecha_desde'] as string,
        fecha_hasta: req.query['fecha_hasta'] as string,
        tipo_actividad: req.query['tipo_actividad'] as string,
        limite: req.query['limite'] ? parseInt(req.query['limite'] as string) : 50,
        offset: req.query['offset'] ? parseInt(req.query['offset'] as string) : 0
      };

      if (!idUsuario) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario requerido'
        });
        return;
      }

      const result = await this.userService.getUserHistory(idUsuario, historyData);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('❌ [UserController] Error al obtener historial de usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Actualizar permisos de administrador
  updateAdminPermissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const idUsuario = req.params['userId'];
      const permissionsData: UpdateAdminPermissionsDto = req.body;

      if (!idUsuario) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario requerido'
        });
        return;
      }

      if (!permissionsData.permisos_administrador || !Array.isArray(permissionsData.permisos_administrador)) {
        res.status(400).json({
          success: false,
          message: 'Permisos de administrador requeridos y deben ser un array'
        });
        return;
      }

      const result = await this.userService.updateAdminPermissions(idUsuario, permissionsData);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('❌ [UserController] Error al actualizar permisos de administrador:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
}
