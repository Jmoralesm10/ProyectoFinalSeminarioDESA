-- =====================================================
-- Procedimiento: sp_eliminar_usuario
-- Descripción: Elimina un usuario del sistema (soft delete o hard delete)
-- Autor: Sistema de Gestión del Congreso de Tecnología
-- Fecha: 2025
-- =====================================================

CREATE OR REPLACE FUNCTION sp_eliminar_usuario(
    p_id_usuario UUID,                    -- ID del usuario a eliminar
    p_eliminado_por_usuario UUID,         -- ID del usuario que hace la eliminación
    p_razon_eliminacion TEXT DEFAULT NULL, -- Razón de la eliminación
    p_eliminacion_completa BOOLEAN DEFAULT FALSE, -- TRUE = hard delete, FALSE = soft delete
    p_confirmar_eliminacion BOOLEAN DEFAULT FALSE -- Confirmación de seguridad
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    id_usuario UUID,
    nombre_completo TEXT,
    tipo_eliminacion TEXT,
    fecha_eliminacion TIMESTAMP,
    datos_afectados JSONB
) AS $$
DECLARE
    v_nombre_completo TEXT;
    v_usuario_existe BOOLEAN := FALSE;
    v_eliminador_existe BOOLEAN := FALSE;
    v_es_super_admin BOOLEAN := FALSE;
    v_tiene_actividades BOOLEAN := FALSE;
    v_tiene_asistencias BOOLEAN := FALSE;
    v_datos_afectados JSONB;
    v_total_actividades INTEGER := 0;
    v_total_asistencias INTEGER := 0;
    v_total_administradores INTEGER := 0;
BEGIN
    -- Validar parámetros de entrada
    IF p_id_usuario IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'El ID de usuario es obligatorio' as message,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::TEXT as tipo_eliminacion,
            NULL::TIMESTAMP as fecha_eliminacion,
            NULL::JSONB as datos_afectados;
        RETURN;
    END IF;
    
    IF p_eliminado_por_usuario IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'El ID del usuario que elimina es obligatorio' as message,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::TEXT as tipo_eliminacion,
            NULL::TIMESTAMP as fecha_eliminacion,
            NULL::JSONB as datos_afectados;
        RETURN;
    END IF;
    
    IF NOT p_confirmar_eliminacion THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'Debe confirmar la eliminación estableciendo confirmar_eliminacion = TRUE' as message,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::TEXT as tipo_eliminacion,
            NULL::TIMESTAMP as fecha_eliminacion,
            NULL::JSONB as datos_afectados;
        RETURN;
    END IF;
    
    -- Verificar que el usuario a eliminar existe
    SELECT 
        u.nombre_usuario || ' ' || u.apellido_usuario,
        u.estado_usuario
    INTO 
        v_nombre_completo,
        v_usuario_existe
    FROM tb_usuarios u
    WHERE u.id_usuario = p_id_usuario;
    
    IF v_nombre_completo IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'Usuario no encontrado' as message,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::TEXT as tipo_eliminacion,
            NULL::TIMESTAMP as fecha_eliminacion,
            NULL::JSONB as datos_afectados;
        RETURN;
    END IF;
    
    -- Verificar que el eliminador existe y tiene permisos
    SELECT EXISTS(
        SELECT 1 FROM tb_administradores a 
        WHERE a.id_usuario = p_eliminado_por_usuario 
        AND a.estado_administrador = TRUE
        AND (a.rol_administrador = 'super_admin' OR 'gestion_usuarios' = ANY(a.permisos_administrador))
    ) INTO v_eliminador_existe;
    
    IF NOT v_eliminador_existe THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'No tiene permisos para eliminar usuarios' as message,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::TEXT as tipo_eliminacion,
            NULL::TIMESTAMP as fecha_eliminacion,
            NULL::JSONB as datos_afectados;
        RETURN;
    END IF;
    
    -- Verificar si el usuario a eliminar es super_admin
    SELECT EXISTS(
        SELECT 1 FROM tb_administradores a 
        WHERE a.id_usuario = p_id_usuario 
        AND a.rol_administrador = 'super_admin'
        AND a.estado_administrador = TRUE
    ) INTO v_es_super_admin;
    
    -- No permitir eliminar super_admin
    IF v_es_super_admin THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'No se puede eliminar un super administrador' as message,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::TEXT as tipo_eliminacion,
            NULL::TIMESTAMP as fecha_eliminacion,
            NULL::JSONB as datos_afectados;
        RETURN;
    END IF;
    
    -- Contar datos relacionados
    SELECT COUNT(*) INTO v_total_actividades
    FROM tb_inscripciones_actividad 
    WHERE id_usuario = p_id_usuario;
    
    SELECT COUNT(*) INTO v_total_asistencias
    FROM tb_asistencia_general 
    WHERE id_usuario = p_id_usuario;
    
    SELECT COUNT(*) INTO v_total_administradores
    FROM tb_administradores 
    WHERE id_usuario = p_id_usuario;
    
    v_datos_afectados := jsonb_build_object(
        'actividades_inscritas', v_total_actividades,
        'asistencias_registradas', v_total_asistencias,
        'roles_administrador', v_total_administradores
    );
    
    -- Realizar la eliminación
    IF p_eliminacion_completa THEN
        -- Hard delete - Eliminar completamente
        DELETE FROM tb_usuarios WHERE id_usuario = p_id_usuario;
        
        RETURN QUERY SELECT 
            TRUE as success,
            'Usuario eliminado completamente del sistema' as message,
            p_id_usuario as id_usuario,
            v_nombre_completo as nombre_completo,
            'hard_delete' as tipo_eliminacion,
            CURRENT_TIMESTAMP as fecha_eliminacion,
            v_datos_afectados as datos_afectados;
    ELSE
        -- Soft delete - Marcar como eliminado
        UPDATE tb_usuarios 
        SET 
            estado_usuario = FALSE,
            fecha_actualizacion_usuario = CURRENT_TIMESTAMP,
            -- Agregar campo de eliminación si existe
            observaciones_usuario = COALESCE(observaciones_usuario || ' | ', '') || 
                'ELIMINADO el ' || CURRENT_TIMESTAMP || 
                CASE WHEN p_razon_eliminacion IS NOT NULL THEN ': ' || p_razon_eliminacion ELSE '' END
        WHERE id_usuario = p_id_usuario;
        
        -- Desactivar roles de administrador
        UPDATE tb_administradores 
        SET 
            estado_administrador = FALSE,
            fecha_ultima_actividad_administrador = CURRENT_TIMESTAMP,
            observaciones_administrador = COALESCE(observaciones_administrador || ' | ', '') || 
                'Usuario eliminado el ' || CURRENT_TIMESTAMP || 
                CASE WHEN p_razon_eliminacion IS NOT NULL THEN ': ' || p_razon_eliminacion ELSE '' END
        WHERE id_usuario = p_id_usuario 
        AND estado_administrador = TRUE;
        
        RETURN QUERY SELECT 
            TRUE as success,
            'Usuario marcado como eliminado (soft delete)' as message,
            p_id_usuario as id_usuario,
            v_nombre_completo as nombre_completo,
            'soft_delete' as tipo_eliminacion,
            CURRENT_TIMESTAMP as fecha_eliminacion,
            v_datos_afectados as datos_afectados;
    END IF;
        
EXCEPTION
    WHEN OTHERS THEN
        -- En caso de error, retornar información del error
        RETURN QUERY SELECT 
            FALSE as success,
            'Error al eliminar usuario: ' || SQLERRM as message,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::TEXT as tipo_eliminacion,
            NULL::TIMESTAMP as fecha_eliminacion,
            NULL::JSONB as datos_afectados;
END;
$$ LANGUAGE plpgsql;

-- Comentarios sobre el procedimiento
COMMENT ON FUNCTION sp_eliminar_usuario(UUID, UUID, TEXT, BOOLEAN, BOOLEAN) IS 
'Elimina un usuario del sistema con opción de soft delete o hard delete. Valida permisos y previene eliminación de super_admin.';

-- Ejemplos de uso:
-- SELECT * FROM sp_eliminar_usuario('uuid-usuario', 'uuid-admin', 'Solicitud del usuario', FALSE, TRUE); -- Soft delete
-- SELECT * FROM sp_eliminar_usuario('uuid-usuario', 'uuid-admin', 'Violación grave', TRUE, TRUE); -- Hard delete
