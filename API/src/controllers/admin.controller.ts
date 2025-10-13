// =====================================================
// Controlador de administradores
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import {
  CreateAdminDto,
  UpdateAdminDto,
  AssignAdminDto,
  ListAdminsDto,
  CheckPermissionDto,
  AdminActivityDto,
  AdminStatsDto
} from '../types/admin.types';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  /**
   * POST /api/admin/create
   * Crea un nuevo administrador
   */
  async createAdmin(req: Request, res: Response): Promise<void> {
    try {
      console.log('🎮 [AdminController] Creando administrador:', req.body);

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const data: CreateAdminDto = {
        id_usuario: req.body.id_usuario,
        rol_administrador: req.body.rol_administrador,
        permisos_administrador: req.body.permisos_administrador,
        observaciones_administrador: req.body.observaciones_administrador
      };

      // Validar permisos según el rol
      const validation = this.adminService.validatePermissionsForRole(
        data.rol_administrador, 
        data.permisos_administrador
      );

      if (!validation.valid) {
        res.status(400).json({
          success: false,
          message: validation.message
        });
        return;
      }

      const result = await this.adminService.createAdmin(data, req.user.id_usuario);
      
      res.status(201).json({
        success: true,
        message: 'Administrador creado exitosamente',
        data: result
      });
    } catch (error) {
      console.error('❌ [AdminController] Error al crear administrador:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  /**
   * POST /api/admin/assign
   * Asigna un administrador por email
   */
  async assignAdminByEmail(req: Request, res: Response): Promise<void> {
    try {
      console.log('🎮 [AdminController] Asignando administrador por email:', req.body);

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const data: AssignAdminDto = {
        email_usuario: req.body.email_usuario,
        rol_administrador: req.body.rol_administrador,
        permisos_administrador: req.body.permisos_administrador,
        observaciones_administrador: req.body.observaciones_administrador
      };

      // Validar permisos según el rol
      const validation = this.adminService.validatePermissionsForRole(
        data.rol_administrador, 
        data.permisos_administrador
      );

      if (!validation.valid) {
        res.status(400).json({
          success: false,
          message: validation.message
        });
        return;
      }

      const result = await this.adminService.assignAdminByEmail(data, req.user.id_usuario);
      
      res.status(201).json({
        success: true,
        message: 'Administrador asignado exitosamente',
        data: result
      });
    } catch (error) {
      console.error('❌ [AdminController] Error al asignar administrador:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  /**
   * PUT /api/admin/:id
   * Actualiza un administrador
   */
  async updateAdmin(req: Request, res: Response): Promise<void> {
    try {
      console.log('🎮 [AdminController] Actualizando administrador:', req.params['id'], req.body);

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const idUsuario = req.params['id'] as string;
      const data: UpdateAdminDto = {
        rol_administrador: req.body.rol_administrador,
        permisos_administrador: req.body.permisos_administrador,
        estado_administrador: req.body.estado_administrador,
        observaciones_administrador: req.body.observaciones_administrador
      };

      // Validar permisos si se está cambiando el rol
      if (data.rol_administrador && data.permisos_administrador) {
        const validation = this.adminService.validatePermissionsForRole(
          data.rol_administrador, 
          data.permisos_administrador
        );

        if (!validation.valid) {
          res.status(400).json({
            success: false,
            message: validation.message
          });
          return;
        }
      }

      const result = await this.adminService.updateAdmin(idUsuario, data, req.user.id_usuario);
      
      res.status(200).json({
        success: true,
        message: 'Administrador actualizado exitosamente',
        data: result
      });
    } catch (error) {
      console.error('❌ [AdminController] Error al actualizar administrador:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/admin/list
   * Lista administradores con filtros
   */
  async listAdmins(req: Request, res: Response): Promise<void> {
    try {
      console.log('🎮 [AdminController] Listando administradores:', req.query);

      const data: ListAdminsDto = {
        rol_administrador: req.query['rol_administrador'] as any,
        estado_administrador: req.query['estado_administrador'] === 'true' ? true : 
                             req.query['estado_administrador'] === 'false' ? false : undefined,
        limite: req.query['limite'] ? parseInt(req.query['limite'] as string) : undefined,
        offset: req.query['offset'] ? parseInt(req.query['offset'] as string) : undefined
      };

      const result = await this.adminService.listAdmins(data);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('❌ [AdminController] Error al listar administradores:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/admin/:id
   * Obtiene un administrador por ID
   */
  async getAdminById(req: Request, res: Response): Promise<void> {
    try {
      console.log('🎮 [AdminController] Obteniendo administrador por ID:', req.params['id']);

      const idUsuario = req.params['id'] as string;
      const result = await this.adminService.getAdminById(idUsuario);
      
      if (result) {
        res.status(200).json({
          success: true,
          message: 'Administrador obtenido exitosamente',
          data: result
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Administrador no encontrado'
        });
      }
    } catch (error) {
      console.error('❌ [AdminController] Error al obtener administrador:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/admin/check-permissions
   * Verifica permisos de un usuario
   */
  async checkUserPermissions(req: Request, res: Response): Promise<void> {
    try {
      console.log('🎮 [AdminController] Verificando permisos:', req.query);

      const data: CheckPermissionDto = {
        id_usuario: req.query['id_usuario'] as string,
        operacion: req.query['operacion'] as string
      };

      if (!data.id_usuario || !data.operacion) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario y operación son requeridos'
        });
        return;
      }

      const result = await this.adminService.checkUserPermissions(data);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ [AdminController] Error al verificar permisos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * POST /api/admin/log-activity
   * Registra actividad de administrador
   */
  async logAdminActivity(req: Request, res: Response): Promise<void> {
    try {
      console.log('🎮 [AdminController] Registrando actividad de administrador:', req.body);

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const data: AdminActivityDto = {
        id_usuario: req.user.id_usuario,
        accion: req.body.accion,
        detalles: req.body.detalles,
        ip_address: req.ip || undefined,
        user_agent: req.get('User-Agent') || undefined
      };

      const result = await this.adminService.logAdminActivity(data);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ [AdminController] Error al registrar actividad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/admin/stats
   * Obtiene estadísticas de administradores
   */
  async getAdminStats(req: Request, res: Response): Promise<void> {
    try {
      console.log('🎮 [AdminController] Obteniendo estadísticas de administradores:', req.query);

      const data: AdminStatsDto = {
        fecha_desde: req.query['fecha_desde'] as string,
        fecha_hasta: req.query['fecha_hasta'] as string,
        rol_administrador: req.query['rol_administrador'] as any
      };

      const result = await this.adminService.getAdminStats(data);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('❌ [AdminController] Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * DELETE /api/admin/:id
   * Elimina un administrador
   */
  async deleteAdmin(req: Request, res: Response): Promise<void> {
    try {
      console.log('🎮 [AdminController] Eliminando administrador:', req.params['id']);

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const idUsuario = req.params['id'] as string;
      const result = await this.adminService.deleteAdmin(idUsuario, req.user.id_usuario);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('❌ [AdminController] Error al eliminar administrador:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/admin/permissions
   * Obtiene permisos disponibles
   */
  async getAvailablePermissions(_req: Request, res: Response): Promise<void> {
    try {
      console.log('🎮 [AdminController] Obteniendo permisos disponibles');

      const permissions = this.adminService.getAvailablePermissions();
      
      res.status(200).json({
        success: true,
        message: 'Permisos obtenidos exitosamente',
        data: {
          permissions: permissions
        }
      });
    } catch (error) {
      console.error('❌ [AdminController] Error al obtener permisos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/admin/roles
   * Obtiene roles disponibles
   */
  async getAvailableRoles(_req: Request, res: Response): Promise<void> {
    try {
      console.log('🎮 [AdminController] Obteniendo roles disponibles');

      const roles = this.adminService.getAvailableRoles();
      
      res.status(200).json({
        success: true,
        message: 'Roles obtenidos exitosamente',
        data: {
          roles: roles
        }
      });
    } catch (error) {
      console.error('❌ [AdminController] Error al obtener roles:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
