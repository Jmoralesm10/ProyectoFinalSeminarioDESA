// =====================================================
// Repositorio de administradores
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { executeQuery } from '../config/database';
import {
  CreateAdminDto,
  UpdateAdminDto,
  AssignAdminDto,
  AdminResponse,
  ListAdminsDto,
  CheckPermissionDto,
  AdminActivityDto,
  AdminStatsDto,
  AdminStats
} from '../types/admin.types';

export class AdminRepository {
  constructor() {
    // No necesita inicialización especial
  }

  /**
   * Crea un nuevo administrador
   */
  async createAdmin(data: CreateAdminDto, assignedBy: string): Promise<AdminResponse> {
    try {
      console.log('📋 [AdminRepository] Creando administrador:', data);
      
      const query = `
        INSERT INTO tb_administradores (
          id_usuario, 
          rol_administrador, 
          permisos_administrador, 
          estado_administrador,
          asignado_por_usuario,
          observaciones_administrador
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const result = await executeQuery(query, [
        data.id_usuario,
        data.rol_administrador,
        data.permisos_administrador,
        true,
        assignedBy,
        data.observaciones_administrador || null
      ]);
      
      console.log('📋 [AdminRepository] Administrador creado:', result[0]);
      
      // Obtener información completa del usuario
      const userQuery = `
        SELECT u.id_usuario, u.nombre_usuario, u.apellido_usuario, u.email_usuario
        FROM tb_usuarios u
        WHERE u.id_usuario = $1
      `;
      
      const userResult = await executeQuery(userQuery, [data.id_usuario]);
      const user = userResult[0];
      
      return {
        id_usuario: result[0].id_usuario,
        nombre_usuario: user.nombre_usuario,
        apellido_usuario: user.apellido_usuario,
        email_usuario: user.email_usuario,
        rol_administrador: result[0].rol_administrador,
        permisos_administrador: result[0].permisos_administrador,
        estado_administrador: result[0].estado_administrador,
        fecha_asignacion_administrador: result[0].fecha_asignacion_administrador,
        fecha_ultima_actividad_administrador: result[0].fecha_ultima_actividad_administrador,
        observaciones_administrador: result[0].observaciones_administrador
      };
    } catch (error) {
      console.error('❌ [AdminRepository] Error al crear administrador:', error);
      throw error;
    }
  }

  /**
   * Asigna un administrador por email
   */
  async assignAdminByEmail(data: AssignAdminDto, assignedBy: string): Promise<AdminResponse> {
    try {
      console.log('📋 [AdminRepository] Asignando administrador por email:', data);
      
      // Primero obtener el ID del usuario por email
      const userQuery = `
        SELECT id_usuario FROM tb_usuarios 
        WHERE email_usuario = $1 AND estado_usuario = true
      `;
      
      const userResult = await executeQuery(userQuery, [data.email_usuario]);
      
      if (userResult.length === 0) {
        throw new Error('Usuario no encontrado o inactivo');
      }
      
      const userId = userResult[0].id_usuario;
      
      // Crear el administrador
      const createData: CreateAdminDto = {
        id_usuario: userId,
        rol_administrador: data.rol_administrador,
        permisos_administrador: data.permisos_administrador,
        observaciones_administrador: data.observaciones_administrador || undefined
      };
      
      return await this.createAdmin(createData, assignedBy);
    } catch (error) {
      console.error('❌ [AdminRepository] Error al asignar administrador:', error);
      throw error;
    }
  }

  /**
   * Actualiza un administrador
   */
  async updateAdmin(idUsuario: string, data: UpdateAdminDto): Promise<AdminResponse> {
    try {
      console.log('📋 [AdminRepository] Actualizando administrador:', { idUsuario, data });
      
      const updateFields = [];
      const values = [];
      let paramCount = 1;
      
      if (data.rol_administrador !== undefined) {
        updateFields.push(`rol_administrador = $${paramCount++}`);
        values.push(data.rol_administrador);
      }
      
      if (data.permisos_administrador !== undefined) {
        updateFields.push(`permisos_administrador = $${paramCount++}`);
        values.push(data.permisos_administrador);
      }
      
      if (data.estado_administrador !== undefined) {
        updateFields.push(`estado_administrador = $${paramCount++}`);
        values.push(data.estado_administrador);
      }
      
      if (data.observaciones_administrador !== undefined) {
        updateFields.push(`observaciones_administrador = $${paramCount++}`);
        values.push(data.observaciones_administrador);
      }
      
      if (updateFields.length === 0) {
        throw new Error('No hay campos para actualizar');
      }
      
      updateFields.push(`fecha_ultima_actividad_administrador = CURRENT_TIMESTAMP`);
      values.push(idUsuario);
      
      const query = `
        UPDATE tb_administradores 
        SET ${updateFields.join(', ')}
        WHERE id_usuario = $${paramCount}
        RETURNING *
      `;
      
      const result = await executeQuery(query, values);
      
      if (result.length === 0) {
        throw new Error('Administrador no encontrado');
      }
      
      // Obtener información completa del usuario
      const userQuery = `
        SELECT u.id_usuario, u.nombre_usuario, u.apellido_usuario, u.email_usuario
        FROM tb_usuarios u
        WHERE u.id_usuario = $1
      `;
      
      const userResult = await executeQuery(userQuery, [idUsuario]);
      const user = userResult[0];
      
      return {
        id_usuario: result[0].id_usuario,
        nombre_usuario: user.nombre_usuario,
        apellido_usuario: user.apellido_usuario,
        email_usuario: user.email_usuario,
        rol_administrador: result[0].rol_administrador,
        permisos_administrador: result[0].permisos_administrador,
        estado_administrador: result[0].estado_administrador,
        fecha_asignacion_administrador: result[0].fecha_asignacion_administrador,
        fecha_ultima_actividad_administrador: result[0].fecha_ultima_actividad_administrador,
        observaciones_administrador: result[0].observaciones_administrador
      };
    } catch (error) {
      console.error('❌ [AdminRepository] Error al actualizar administrador:', error);
      throw error;
    }
  }

  /**
   * Lista administradores con filtros
   */
  async listAdmins(data: ListAdminsDto): Promise<AdminResponse[]> {
    try {
      console.log('📋 [AdminRepository] Listando administradores:', data);
      
      let whereConditions = [];
      let values = [];
      let paramCount = 1;
      
      if (data.rol_administrador) {
        whereConditions.push(`a.rol_administrador = $${paramCount++}`);
        values.push(data.rol_administrador);
      }
      
      if (data.estado_administrador !== undefined) {
        whereConditions.push(`a.estado_administrador = $${paramCount++}`);
        values.push(data.estado_administrador);
      }
      
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      let limitClause = '';
      if (data.limite) {
        limitClause = `LIMIT $${paramCount++}`;
        values.push(data.limite);
      }
      
      let offsetClause = '';
      if (data.offset) {
        offsetClause = `OFFSET $${paramCount++}`;
        values.push(data.offset);
      }
      
      const query = `
        SELECT 
          a.id_usuario,
          u.nombre_usuario,
          u.apellido_usuario,
          u.email_usuario,
          a.rol_administrador,
          a.permisos_administrador,
          a.estado_administrador,
          a.fecha_asignacion_administrador,
          a.fecha_ultima_actividad_administrador,
          a.observaciones_administrador
        FROM tb_administradores a
        JOIN tb_usuarios u ON a.id_usuario = u.id_usuario
        ${whereClause}
        ORDER BY a.fecha_asignacion_administrador DESC
        ${limitClause}
        ${offsetClause}
      `;
      
      const result = await executeQuery(query, values);
      
      return result.map((row: any) => ({
        id_usuario: row.id_usuario,
        nombre_usuario: row.nombre_usuario,
        apellido_usuario: row.apellido_usuario,
        email_usuario: row.email_usuario,
        rol_administrador: row.rol_administrador,
        permisos_administrador: row.permisos_administrador,
        estado_administrador: row.estado_administrador,
        fecha_asignacion_administrador: row.fecha_asignacion_administrador,
        fecha_ultima_actividad_administrador: row.fecha_ultima_actividad_administrador,
        observaciones_administrador: row.observaciones_administrador
      }));
    } catch (error) {
      console.error('❌ [AdminRepository] Error al listar administradores:', error);
      throw error;
    }
  }

  /**
   * Obtiene un administrador por ID de usuario
   */
  async getAdminById(idUsuario: string): Promise<AdminResponse | null> {
    try {
      console.log('📋 [AdminRepository] Obteniendo administrador por ID:', idUsuario);
      
      const query = `
        SELECT 
          a.id_usuario,
          u.nombre_usuario,
          u.apellido_usuario,
          u.email_usuario,
          a.rol_administrador,
          a.permisos_administrador,
          a.estado_administrador,
          a.fecha_asignacion_administrador,
          a.fecha_ultima_actividad_administrador,
          a.observaciones_administrador
        FROM tb_administradores a
        JOIN tb_usuarios u ON a.id_usuario = u.id_usuario
        WHERE a.id_usuario = $1
      `;
      
      const result = await executeQuery(query, [idUsuario]);
      
      if (result.length === 0) {
        return null;
      }
      
      const row = result[0];
      return {
        id_usuario: row.id_usuario,
        nombre_usuario: row.nombre_usuario,
        apellido_usuario: row.apellido_usuario,
        email_usuario: row.email_usuario,
        rol_administrador: row.rol_administrador,
        permisos_administrador: row.permisos_administrador,
        estado_administrador: row.estado_administrador,
        fecha_asignacion_administrador: row.fecha_asignacion_administrador,
        fecha_ultima_actividad_administrador: row.fecha_ultima_actividad_administrador,
        observaciones_administrador: row.observaciones_administrador
      };
    } catch (error) {
      console.error('❌ [AdminRepository] Error al obtener administrador:', error);
      throw error;
    }
  }

  /**
   * Verifica si un usuario es administrador
   */
  async isUserAdmin(idUsuario: string): Promise<boolean> {
    try {
      const query = `
        SELECT EXISTS(
          SELECT 1 FROM tb_administradores 
          WHERE id_usuario = $1 AND estado_administrador = true
        )
      `;
      
      const result = await executeQuery(query, [idUsuario]);
      return result[0].exists;
    } catch (error) {
      console.error('❌ [AdminRepository] Error al verificar si es administrador:', error);
      throw error;
    }
  }

  /**
   * Verifica permisos de un usuario
   */
  async checkUserPermissions(data: CheckPermissionDto): Promise<{ hasPermission: boolean; role?: string; permissions?: string[] }> {
    try {
      console.log('📋 [AdminRepository] Verificando permisos:', data);
      
      const query = `
        SELECT 
          a.rol_administrador,
          a.permisos_administrador,
          a.estado_administrador
        FROM tb_administradores a
        WHERE a.id_usuario = $1
      `;
      
      const result = await executeQuery(query, [data.id_usuario]);
      
      if (result.length === 0) {
        return { hasPermission: false };
      }
      
      const admin = result[0];
      
      if (!admin.estado_administrador) {
        return { hasPermission: false };
      }
      
      // Verificar permisos específicos según la operación
      let hasPermission = false;
      
      switch (data.operacion) {
        case 'gestion_usuarios':
          hasPermission = admin.permisos_administrador.includes('gestion_usuarios');
          break;
        case 'gestion_actividades':
          hasPermission = admin.permisos_administrador.includes('gestion_actividades');
          break;
        case 'gestion_administradores':
          hasPermission = admin.permisos_administrador.includes('gestion_administradores');
          break;
        case 'ver_reportes':
          hasPermission = admin.permisos_administrador.includes('ver_reportes');
          break;
        case 'gestion_sistema':
          hasPermission = admin.permisos_administrador.includes('gestion_sistema');
          break;
        case 'gestion_asistencia':
          hasPermission = admin.permisos_administrador.includes('gestion_asistencia');
          break;
        case 'gestion_diplomas':
          hasPermission = admin.permisos_administrador.includes('gestion_diplomas');
          break;
        case 'gestion_pagos':
          hasPermission = admin.permisos_administrador.includes('gestion_pagos');
          break;
        default:
          hasPermission = false;
      }
      
      return {
        hasPermission,
        role: admin.rol_administrador,
        permissions: admin.permisos_administrador
      };
    } catch (error) {
      console.error('❌ [AdminRepository] Error al verificar permisos:', error);
      throw error;
    }
  }

  /**
   * Registra actividad de administrador
   */
  async logAdminActivity(data: AdminActivityDto): Promise<void> {
    try {
      console.log('📋 [AdminRepository] Registrando actividad de administrador:', data);
      
      const query = `
        INSERT INTO tb_logs_sistema (
          id_usuario,
          accion_log,
          detalles_log,
          ip_address_log,
          user_agent_log
        ) VALUES ($1, $2, $3, $4, $5)
      `;
      
      await executeQuery(query, [
        data.id_usuario,
        data.accion,
        data.detalles ? JSON.stringify(data.detalles) : null,
        data.ip_address || null,
        data.user_agent || null
      ]);
      
      // Actualizar última actividad del administrador
      const updateQuery = `
        UPDATE tb_administradores 
        SET fecha_ultima_actividad_administrador = CURRENT_TIMESTAMP
        WHERE id_usuario = $1
      `;
      
      await executeQuery(updateQuery, [data.id_usuario]);
    } catch (error) {
      console.error('❌ [AdminRepository] Error al registrar actividad:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de administradores
   */
  async getAdminStats(data: AdminStatsDto): Promise<AdminStats> {
    try {
      console.log('📋 [AdminRepository] Obteniendo estadísticas de administradores:', data);
      
      // Estadísticas generales
      const statsQuery = `
        SELECT 
          COUNT(*) as total_administradores,
          COUNT(CASE WHEN estado_administrador = true THEN 1 END) as administradores_activos,
          COUNT(CASE WHEN rol_administrador = 'admin' THEN 1 END) as admin_count,
          COUNT(CASE WHEN rol_administrador = 'super_admin' THEN 1 END) as super_admin_count,
          COUNT(CASE WHEN rol_administrador = 'moderador' THEN 1 END) as moderador_count
        FROM tb_administradores
      `;
      
      const statsResult = await executeQuery(statsQuery);
      const stats = statsResult[0];
      
      // Actividades recientes
      const activitiesQuery = `
        SELECT 
          l.id_usuario,
          u.nombre_usuario || ' ' || u.apellido_usuario as nombre_completo,
          l.accion_log as accion,
          l.fecha_log as fecha_actividad
        FROM tb_logs_sistema l
        JOIN tb_usuarios u ON l.id_usuario = u.id_usuario
        WHERE l.id_usuario IN (SELECT id_usuario FROM tb_administradores WHERE estado_administrador = true)
        ORDER BY l.fecha_log DESC
        LIMIT 10
      `;
      
      const activitiesResult = await executeQuery(activitiesQuery);
      
      return {
        total_administradores: parseInt(stats.total_administradores),
        administradores_activos: parseInt(stats.administradores_activos),
        administradores_por_rol: {
          admin: parseInt(stats.admin_count),
          super_admin: parseInt(stats.super_admin_count),
          moderador: parseInt(stats.moderador_count)
        },
        actividades_recientes: activitiesResult.map((row: any) => ({
          id_usuario: row.id_usuario,
          nombre_completo: row.nombre_completo,
          accion: row.accion,
          fecha_actividad: row.fecha_actividad
        }))
      };
    } catch (error) {
      console.error('❌ [AdminRepository] Error al obtener estadísticas:', error);
      throw error;
    }
  }

  /**
   * Elimina un administrador
   */
  async deleteAdmin(idUsuario: string): Promise<boolean> {
    try {
      console.log('📋 [AdminRepository] Eliminando administrador:', idUsuario);
      
      const query = `
        DELETE FROM tb_administradores 
        WHERE id_usuario = $1
      `;
      
      const result = await executeQuery(query, [idUsuario]);
      return result.length > 0;
    } catch (error) {
      console.error('❌ [AdminRepository] Error al eliminar administrador:', error);
      throw error;
    }
  }
}
