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
  SpConsultarQRResponse,
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

export class UserRepository {
  
  // Función auxiliar para mapear tipos de usuario
  private mapUserTypeToId(tipoUsuario: string | undefined): number | null {
    if (!tipoUsuario) return null;
    
    switch (tipoUsuario.toLowerCase()) {
      case 'externo':
        return 1;
      case 'interno':
        return 2;
      case 'administrador':
        // Los administradores en realidad son usuarios de tipo 'interno' (2) 
        // que tienen roles de administrador en tb_administradores
        return 2;
      default:
        // Si es un número, intentar parsearlo
        const parsed = parseInt(tipoUsuario);
        return isNaN(parsed) ? null : parsed;
    }
  }
  
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

  // =====================================================
  // MÉTODOS PARA GESTIÓN DE USUARIOS (ADMIN)
  // =====================================================

  // Listar usuarios con filtros
  async listUsers(filters: ListUsersDto): Promise<ListUsersResponse> {
    try {
      // Convertir tipo_usuario de string a integer si es necesario
      const filtroTipo = this.mapUserTypeToId(filters.tipo_usuario);

      const result = await executeStoredProcedure('sp_listar_usuarios', [
        filtroTipo,                                    // p_filtro_tipo (INTEGER)
        filters.estado_usuario !== undefined ? filters.estado_usuario : null, // p_filtro_estado (BOOLEAN)
        null,                                          // p_filtro_colegio (VARCHAR) - no usado por ahora
        filters.busqueda || null,                      // p_buscar_texto (VARCHAR)
        filters.limite || 50,                          // p_limite (INTEGER)
        filters.offset || 0                            // p_offset (INTEGER)
      ]);

      if (result && result.length > 0) {
        // El primer registro contiene el total de registros
        // const totalRegistros = result[0]?.total_registros || 0; // No se usa después del filtrado
        
        let usuarios = result.map((user: any) => ({
          id_usuario: user.id_usuario,
          id_tipo_usuario: user.id_tipo_usuario,
          nombre_usuario: user.nombre_usuario,
          apellido_usuario: user.apellido_usuario,
          email_usuario: user.email_usuario,
          telefono_usuario: user.telefono_usuario,
          colegio_usuario: user.colegio_usuario,
          estado_usuario: user.estado_usuario,
          email_verificado_usuario: user.email_verificado_usuario,
          fecha_inscripcion_usuario: user.fecha_inscripcion_usuario,
          fecha_actualizacion_usuario: user.fecha_actualizacion_usuario || user.fecha_inscripcion_usuario,
          ultimo_acceso_usuario: user.ultimo_acceso_usuario,
          tipo_usuario: {
            id_tipo_usuario: user.id_tipo_usuario,
            nombre_tipo_usuario: user.nombre_tipo_usuario,
            descripcion_tipo_usuario: '', // No viene en el SP
            estado_tipo_usuario: true,    // Asumir activo
            fecha_creacion: new Date()    // No viene en el SP
          },
          // Información adicional del SP
          total_actividades_inscritas: user.total_actividades_inscritas || 0,
          total_asistencias: user.total_asistencias || 0,
          es_administrador: user.es_administrador || false,
          roles_administrador: user.roles_administrador || []
        }));

        // Filtrar por rol de administrador si se especifica
        if (filters.rol_administrador && filters.rol_administrador.trim() !== '') {
          usuarios = usuarios.filter(usuario => {
            if (filters.rol_administrador === 'admin') {
              // Filtrar usuarios que tengan rol 'admin' (no super_admin)
              return usuario.roles_administrador && 
                     usuario.roles_administrador.includes('admin') && 
                     !usuario.roles_administrador.includes('super_admin');
            } else if (filters.rol_administrador === 'super_admin') {
              // Filtrar usuarios que tengan rol 'super_admin'
              return usuario.roles_administrador && 
                     usuario.roles_administrador.includes('super_admin');
            } else if (filters.rol_administrador === 'usuario') {
              // Filtrar usuarios que NO sean administradores
              return !usuario.es_administrador || 
                     !usuario.roles_administrador || 
                     usuario.roles_administrador.length === 0;
            }
            return true;
          });
        }

        // Verificar si hay usuarios después del filtrado
        if (usuarios.length === 0) {
          return {
            success: true,
            message: 'No se encontraron usuarios con los criterios especificados',
            data: {
              usuarios: [],
              total: 0,
              pagina_actual: 1,
              total_paginas: 0
            }
          };
        }

        return {
          success: true,
          message: 'Usuarios obtenidos exitosamente',
          data: {
            usuarios,
            total: usuarios.length, // Usar la cantidad real después del filtrado
            pagina_actual: Math.floor((filters.offset || 0) / (filters.limite || 50)) + 1,
            total_paginas: Math.ceil(usuarios.length / (filters.limite || 50))
          }
        };
      }

      return {
        success: true,
        message: 'No se encontraron usuarios con los criterios especificados',
        data: {
          usuarios: [],
          total: 0,
          pagina_actual: 1,
          total_paginas: 0
        }
      };
    } catch (error) {
      console.error('❌ Repository: Error en listUsers:', error);
      throw new Error('Error al listar usuarios');
    }
  }

  // Buscar usuarios
  async searchUsers(searchData: SearchUsersDto): Promise<SearchUsersResponse> {
    try {
      // Convertir tipo_usuario de string a integer si es necesario
      const tipoUsuario = this.mapUserTypeToId(searchData.tipo_usuario);

      const result = await executeStoredProcedure('sp_buscar_usuarios', [
        searchData.termino_busqueda,                  // p_criterio_busqueda (VARCHAR)
        'general',                                    // p_tipo_busqueda (VARCHAR) - búsqueda general
        tipoUsuario,                                  // p_tipo_usuario (INTEGER)
        searchData.estado_usuario !== undefined ? searchData.estado_usuario : null, // p_estado_usuario (BOOLEAN)
        false,                                        // p_solo_administradores (BOOLEAN)
        false,                                        // p_solo_con_actividades (BOOLEAN)
        null,                                         // p_fecha_desde (DATE)
        null,                                         // p_fecha_hasta (DATE)
        searchData.limite || 50,                      // p_limite (INTEGER)
        searchData.offset || 0                        // p_offset (INTEGER)
      ]);

      if (result && result.length > 0) {
        const totalResultados = result[0]?.total_resultados || 0;
        
        const usuarios = result.map((user: any) => {
          // Extraer nombre y apellido del nombre_completo
          const nombreCompleto = user.nombre_completo || '';
          const partesNombre = nombreCompleto.split(' ');
          const nombre = partesNombre[0] || '';
          const apellido = partesNombre.slice(1).join(' ') || '';

          return {
            id_usuario: user.id_usuario,
            id_tipo_usuario: user.id_tipo_usuario || 0,
            nombre_usuario: nombre,
            apellido_usuario: apellido,
            email_usuario: user.email_usuario,
            telefono_usuario: user.telefono_usuario,
            colegio_usuario: user.colegio_usuario,
            estado_usuario: user.estado_usuario,
            email_verificado_usuario: user.email_verificado || false,
            fecha_inscripcion_usuario: user.fecha_inscripcion,
            fecha_actualizacion_usuario: user.fecha_inscripcion,
            ultimo_acceso_usuario: user.ultimo_acceso,
            tipo_usuario: {
              id_tipo_usuario: user.id_tipo_usuario || 0,
              nombre_tipo_usuario: user.tipo_usuario || '',
              descripcion_tipo_usuario: '',
              estado_tipo_usuario: true,
              fecha_creacion: new Date()
            },
            // Información adicional del SP
            total_actividades_inscritas: user.total_actividades || 0,
            total_asistencias: user.total_asistencias || 0,
            es_administrador: user.es_administrador || false,
            roles_administrador: user.roles_administrador || [],
            // Campo adicional del SP
            coincidencia_en: user.coincidencia_en || 'general'
          };
        });

        return {
          success: true,
          message: 'Búsqueda completada exitosamente',
          data: {
            usuarios,
            total: totalResultados,
            termino_busqueda: searchData.termino_busqueda
          }
        };
      }

      return {
        success: false,
        message: 'No se encontraron usuarios con el término de búsqueda'
      };
    } catch (error) {
      console.error('❌ Repository: Error en searchUsers:', error);
      throw new Error('Error al buscar usuarios');
    }
  }

  // Cambiar estado de usuario
  async updateUserStatus(idUsuario: string, statusData: UpdateUserStatusDto): Promise<UpdateUserStatusResponse> {
    try {
      const result = await executeStoredProcedure('sp_cambiar_estado_usuario', [
        idUsuario,
        statusData.estado_usuario,
        statusData.motivo || null
      ]);

      if (result && result.length > 0) {
        return {
          success: true,
          message: 'Estado de usuario actualizado exitosamente',
          data: {
            id_usuario: idUsuario,
            estado_anterior: !statusData.estado_usuario,
            estado_nuevo: statusData.estado_usuario,
            fecha_cambio: new Date()
          }
        };
      }

      return {
        success: false,
        message: 'Error al actualizar estado del usuario'
      };
    } catch (error) {
      console.error('❌ Repository: Error en updateUserStatus:', error);
      throw new Error('Error al actualizar estado del usuario');
    }
  }

  // Eliminar usuario
  async deleteUser(idUsuario: string): Promise<DeleteUserResponse> {
    try {
      const result = await executeStoredProcedure('sp_eliminar_usuario', [idUsuario]);

      if (result && result.length > 0) {
        return {
          success: true,
          message: 'Usuario eliminado exitosamente',
          data: {
            id_usuario: idUsuario,
            fecha_eliminacion: new Date()
          }
        };
      }

      return {
        success: false,
        message: 'Error al eliminar usuario'
      };
    } catch (error) {
      console.error('❌ Repository: Error en deleteUser:', error);
      throw new Error('Error al eliminar usuario');
    }
  }

  // Obtener historial de usuario
  async getUserHistory(idUsuario: string, historyData: UserHistoryDto): Promise<UserHistoryResponse> {
    try {
      const result = await executeStoredProcedure('sp_consultar_historial_usuario', [
        idUsuario,
        historyData.fecha_desde || null,
        historyData.fecha_hasta || null,
        historyData.tipo_actividad || null,
        historyData.limite || 50,
        historyData.offset || 0
      ]);

      if (result && result.length > 0) {
        const historyResult = result[0];
        return {
          success: true,
          message: 'Historial de usuario obtenido exitosamente',
          data: {
            usuario: historyResult.usuario,
            actividades_inscritas: historyResult.actividades_inscritas || [],
            asistencias: historyResult.asistencias || [],
            historial_admin: historyResult.historial_admin || []
          }
        };
      }

      return {
        success: false,
        message: 'No se encontró historial para el usuario'
      };
    } catch (error) {
      console.error('❌ Repository: Error en getUserHistory:', error);
      throw new Error('Error al obtener historial del usuario');
    }
  }

  // Actualizar permisos de administrador
  async updateAdminPermissions(idUsuario: string, permissionsData: UpdateAdminPermissionsDto): Promise<UpdateAdminPermissionsResponse> {
    try {
      const result = await executeStoredProcedure('sp_actualizar_permisos_administrador', [
        idUsuario,
        permissionsData.permisos_administrador,
        permissionsData.observaciones || null
      ]);

      if (result && result.length > 0) {
        const updateResult = result[0];
        return {
          success: true,
          message: 'Permisos de administrador actualizados exitosamente',
          data: {
            id_usuario: idUsuario,
            permisos_anteriores: updateResult.permisos_anteriores || [],
            permisos_nuevos: permissionsData.permisos_administrador,
            fecha_actualizacion: new Date()
          }
        };
      }

      return {
        success: false,
        message: 'Error al actualizar permisos de administrador'
      };
    } catch (error) {
      console.error('❌ Repository: Error en updateAdminPermissions:', error);
      throw new Error('Error al actualizar permisos de administrador');
    }
  }
}
