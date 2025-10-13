// =====================================================
// Servicio de administradores
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { AdminRepository } from '../repositories/admin.repository';
import {
  CreateAdminDto,
  UpdateAdminDto,
  AssignAdminDto,
  AdminResponse,
  ListAdminsDto,
  ListAdminsResponse,
  CheckPermissionDto,
  PermissionCheckResponse,
  AdminActivityDto,
  AdminActivityResponse,
  AdminStatsDto,
  AdminStatsResponse
} from '../types/admin.types';

export class AdminService {
  private adminRepository: AdminRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
  }

  /**
   * Crea un nuevo administrador
   */
  async createAdmin(data: CreateAdminDto, assignedBy: string): Promise<AdminResponse> {
    try {
      console.log('🎯 [AdminService] Creando administrador:', data);

      // Validar datos de entrada
      if (!data.id_usuario || !data.rol_administrador || !data.permisos_administrador) {
        throw new Error('Datos requeridos faltantes');
      }

      // Verificar que el usuario existe
      const existingAdmin = await this.adminRepository.getAdminById(data.id_usuario);
      if (existingAdmin) {
        throw new Error('El usuario ya es administrador');
      }

      // Crear el administrador
      const result = await this.adminRepository.createAdmin(data, assignedBy);
      
      // Registrar la actividad
      await this.adminRepository.logAdminActivity({
        id_usuario: assignedBy,
        accion: 'crear_administrador',
        detalles: {
          nuevo_admin: data.id_usuario,
          rol: data.rol_administrador,
          permisos: data.permisos_administrador
        }
      });

      console.log('🎯 [AdminService] Administrador creado exitosamente');
      return result;
    } catch (error) {
      console.error('❌ [AdminService] Error al crear administrador:', error);
      throw error;
    }
  }

  /**
   * Asigna un administrador por email
   */
  async assignAdminByEmail(data: AssignAdminDto, assignedBy: string): Promise<AdminResponse> {
    try {
      console.log('🎯 [AdminService] Asignando administrador por email:', data);

      // Validar datos de entrada
      if (!data.email_usuario || !data.rol_administrador || !data.permisos_administrador) {
        throw new Error('Datos requeridos faltantes');
      }

      // Asignar el administrador
      const result = await this.adminRepository.assignAdminByEmail(data, assignedBy);
      
      // Registrar la actividad
      await this.adminRepository.logAdminActivity({
        id_usuario: assignedBy,
        accion: 'asignar_administrador',
        detalles: {
          email_asignado: data.email_usuario,
          rol: data.rol_administrador,
          permisos: data.permisos_administrador
        }
      });

      console.log('🎯 [AdminService] Administrador asignado exitosamente');
      return result;
    } catch (error) {
      console.error('❌ [AdminService] Error al asignar administrador:', error);
      throw error;
    }
  }

  /**
   * Actualiza un administrador
   */
  async updateAdmin(idUsuario: string, data: UpdateAdminDto, updatedBy: string): Promise<AdminResponse> {
    try {
      console.log('🎯 [AdminService] Actualizando administrador:', { idUsuario, data });

      // Verificar que el administrador existe
      const existingAdmin = await this.adminRepository.getAdminById(idUsuario);
      if (!existingAdmin) {
        throw new Error('Administrador no encontrado');
      }

      // Actualizar el administrador
      const result = await this.adminRepository.updateAdmin(idUsuario, data);
      
      // Registrar la actividad
      await this.adminRepository.logAdminActivity({
        id_usuario: updatedBy,
        accion: 'actualizar_administrador',
        detalles: {
          admin_actualizado: idUsuario,
          cambios: data
        }
      });

      console.log('🎯 [AdminService] Administrador actualizado exitosamente');
      return result;
    } catch (error) {
      console.error('❌ [AdminService] Error al actualizar administrador:', error);
      throw error;
    }
  }

  /**
   * Lista administradores con filtros
   */
  async listAdmins(data: ListAdminsDto): Promise<ListAdminsResponse> {
    try {
      console.log('🎯 [AdminService] Listando administradores:', data);

      const admins = await this.adminRepository.listAdmins(data);
      
      // Obtener total de administradores para paginación
      const totalQuery = await this.adminRepository.listAdmins({
        rol_administrador: data.rol_administrador,
        estado_administrador: data.estado_administrador
      });
      
      const totalAdmins = totalQuery.length;
      const currentPage = data.offset ? Math.floor(data.offset / (data.limite || 10)) + 1 : 1;
      const totalPages = data.limite ? Math.ceil(totalAdmins / data.limite) : 1;

      return {
        success: true,
        message: 'Administradores obtenidos exitosamente',
        admins: admins,
        total_admins: totalAdmins,
        current_page: currentPage,
        total_pages: totalPages
      };
    } catch (error) {
      console.error('❌ [AdminService] Error al listar administradores:', error);
      return {
        success: false,
        message: 'Error al obtener administradores',
        admins: [],
        total_admins: 0,
        current_page: 1,
        total_pages: 0
      };
    }
  }

  /**
   * Obtiene un administrador por ID
   */
  async getAdminById(idUsuario: string): Promise<AdminResponse | null> {
    try {
      console.log('🎯 [AdminService] Obteniendo administrador por ID:', idUsuario);

      const result = await this.adminRepository.getAdminById(idUsuario);
      
      if (!result) {
        return null;
      }

      return result;
    } catch (error) {
      console.error('❌ [AdminService] Error al obtener administrador:', error);
      throw error;
    }
  }

  /**
   * Verifica si un usuario es administrador
   */
  async isUserAdmin(idUsuario: string): Promise<boolean> {
    try {
      console.log('🎯 [AdminService] Verificando si usuario es administrador:', idUsuario);

      const result = await this.adminRepository.isUserAdmin(idUsuario);
      return result;
    } catch (error) {
      console.error('❌ [AdminService] Error al verificar si es administrador:', error);
      return false;
    }
  }

  /**
   * Verifica permisos de un usuario
   */
  async checkUserPermissions(data: CheckPermissionDto): Promise<PermissionCheckResponse> {
    try {
      console.log('🎯 [AdminService] Verificando permisos:', data);

      // Verificar si es administrador
      const isAdmin = await this.adminRepository.isUserAdmin(data.id_usuario);
      
      if (!isAdmin) {
        return {
          success: true,
          message: 'Usuario no es administrador',
          has_permission: false
        };
      }

      // Verificar permisos específicos
      const permissionResult = await this.adminRepository.checkUserPermissions(data);
      
      return {
        success: true,
        message: permissionResult.hasPermission ? 'Usuario tiene permisos' : 'Usuario no tiene permisos',
        has_permission: permissionResult.hasPermission,
        user_role: permissionResult.role as any,
        user_permissions: permissionResult.permissions as any
      };
    } catch (error) {
      console.error('❌ [AdminService] Error al verificar permisos:', error);
      return {
        success: false,
        message: 'Error al verificar permisos',
        has_permission: false
      };
    }
  }

  /**
   * Registra actividad de administrador
   */
  async logAdminActivity(data: AdminActivityDto): Promise<AdminActivityResponse> {
    try {
      console.log('🎯 [AdminService] Registrando actividad de administrador:', data);

      await this.adminRepository.logAdminActivity(data);
      
      return {
        success: true,
        message: 'Actividad registrada exitosamente',
        activity_logged: true
      };
    } catch (error) {
      console.error('❌ [AdminService] Error al registrar actividad:', error);
      return {
        success: false,
        message: 'Error al registrar actividad',
        activity_logged: false
      };
    }
  }

  /**
   * Obtiene estadísticas de administradores
   */
  async getAdminStats(data: AdminStatsDto): Promise<AdminStatsResponse> {
    try {
      console.log('🎯 [AdminService] Obteniendo estadísticas de administradores:', data);

      const stats = await this.adminRepository.getAdminStats(data);
      
      return {
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        stats: stats
      };
    } catch (error) {
      console.error('❌ [AdminService] Error al obtener estadísticas:', error);
      return {
        success: false,
        message: 'Error al obtener estadísticas'
      };
    }
  }

  /**
   * Elimina un administrador
   */
  async deleteAdmin(idUsuario: string, deletedBy: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🎯 [AdminService] Eliminando administrador:', idUsuario);

      // Verificar que el administrador existe
      const existingAdmin = await this.adminRepository.getAdminById(idUsuario);
      if (!existingAdmin) {
        return {
          success: false,
          message: 'Administrador no encontrado'
        };
      }

      // Eliminar el administrador
      const result = await this.adminRepository.deleteAdmin(idUsuario);
      
      if (result) {
        // Registrar la actividad
        await this.adminRepository.logAdminActivity({
          id_usuario: deletedBy,
          accion: 'eliminar_administrador',
          detalles: {
            admin_eliminado: idUsuario,
            email_eliminado: existingAdmin.email_usuario
          }
        });

        return {
          success: true,
          message: 'Administrador eliminado exitosamente'
        };
      } else {
        return {
          success: false,
          message: 'Error al eliminar administrador'
        };
      }
    } catch (error) {
      console.error('❌ [AdminService] Error al eliminar administrador:', error);
      return {
        success: false,
        message: 'Error al eliminar administrador'
      };
    }
  }

  /**
   * Obtiene permisos disponibles
   */
  getAvailablePermissions(): string[] {
    return [
      'gestion_usuarios',
      'gestion_actividades',
      'gestion_administradores',
      'ver_reportes',
      'gestion_sistema',
      'gestion_asistencia',
      'gestion_diplomas',
      'gestion_pagos'
    ];
  }

  /**
   * Obtiene roles disponibles
   */
  getAvailableRoles(): string[] {
    return ['admin', 'super_admin', 'moderador'];
  }

  /**
   * Valida permisos según el rol
   */
  validatePermissionsForRole(role: string, permissions: string[]): { valid: boolean; message?: string } {
    const rolePermissions: { [key: string]: string[] } = {
      'super_admin': [
        'gestion_usuarios',
        'gestion_actividades',
        'gestion_administradores',
        'ver_reportes',
        'gestion_sistema',
        'gestion_asistencia',
        'gestion_diplomas',
        'gestion_pagos'
      ],
      'admin': [
        'gestion_usuarios',
        'gestion_actividades',
        'ver_reportes',
        'gestion_asistencia',
        'gestion_diplomas'
      ],
      'moderador': [
        'gestion_usuarios',
        'gestion_actividades',
        'ver_reportes'
      ]
    };

    const allowedPermissions = rolePermissions[role] || [];
    const invalidPermissions = permissions.filter(p => !allowedPermissions.includes(p));

    if (invalidPermissions.length > 0) {
      return {
        valid: false,
        message: `Permisos no válidos para el rol ${role}: ${invalidPermissions.join(', ')}`
      };
    }

    return { valid: true };
  }
}
