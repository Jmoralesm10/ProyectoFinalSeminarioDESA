-- =====================================================
-- Procedimiento: sp_cambiar_estado_usuario
-- Descripción: Activa o desactiva un usuario del sistema
-- Autor: Sistema de Gestión del Congreso de Tecnología
-- Fecha: 2025
-- =====================================================

CREATE OR REPLACE FUNCTION sp_cambiar_estado_usuario(
    p_id_usuario UUID,                    -- ID del usuario a modificar
    p_nuevo_estado BOOLEAN,               -- Nuevo estado (TRUE = activo, FALSE = inactivo)
    p_modificado_por_usuario UUID,        -- ID del usuario que hace el cambio
    p_razon_cambio TEXT DEFAULT NULL      -- Razón del cambio de estado
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    id_usuario UUID,
    nombre_completo TEXT,
    estado_anterior BOOLEAN,
    estado_nuevo BOOLEAN,
    fecha_cambio TIMESTAMP
) AS $$
DECLARE
    v_nombre_completo TEXT;
    v_estado_anterior BOOLEAN;
    v_usuario_existe BOOLEAN := FALSE;
    v_modificador_existe BOOLEAN := FALSE;
    v_es_super_admin BOOLEAN := FALSE;
BEGIN
    -- Validar parámetros de entrada
    IF p_id_usuario IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'El ID de usuario es obligatorio' as message,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::BOOLEAN as estado_anterior,
            NULL::BOOLEAN as estado_nuevo,
            NULL::TIMESTAMP as fecha_cambio;
        RETURN;
    END IF;
    
    IF p_nuevo_estado IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'El nuevo estado es obligatorio' as message,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::BOOLEAN as estado_anterior,
            NULL::BOOLEAN as estado_nuevo,
            NULL::TIMESTAMP as fecha_cambio;
        RETURN;
    END IF;
    
    IF p_modificado_por_usuario IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'El ID del usuario que modifica es obligatorio' as message,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::BOOLEAN as estado_anterior,
            NULL::BOOLEAN as estado_nuevo,
            NULL::TIMESTAMP as fecha_cambio;
        RETURN;
    END IF;
    
    -- Verificar que el usuario a modificar existe
    SELECT 
        u.nombre_usuario || ' ' || u.apellido_usuario,
        u.estado_usuario
    INTO 
        v_nombre_completo,
        v_estado_anterior
    FROM tb_usuarios u
    WHERE u.id_usuario = p_id_usuario;
    
    IF v_nombre_completo IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'Usuario no encontrado' as message,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::BOOLEAN as estado_anterior,
            NULL::BOOLEAN as estado_nuevo,
            NULL::TIMESTAMP as fecha_cambio;
        RETURN;
    END IF;
    
    -- Verificar que el estado no sea el mismo
    IF v_estado_anterior = p_nuevo_estado THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'El usuario ya tiene el estado especificado' as message,
            p_id_usuario as id_usuario,
            v_nombre_completo as nombre_completo,
            v_estado_anterior as estado_anterior,
            p_nuevo_estado as estado_nuevo,
            NULL::TIMESTAMP as fecha_cambio;
        RETURN;
    END IF;
    
    -- Verificar que el modificador existe y tiene permisos
    SELECT EXISTS(
        SELECT 1 FROM tb_administradores a 
        WHERE a.id_usuario = p_modificado_por_usuario 
        AND a.estado_administrador = TRUE
        AND (a.rol_administrador = 'super_admin' OR 'gestion_usuarios' = ANY(a.permisos_administrador))
    ) INTO v_modificador_existe;
    
    IF NOT v_modificador_existe THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'No tiene permisos para cambiar el estado de usuarios' as message,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::BOOLEAN as estado_anterior,
            NULL::BOOLEAN as estado_nuevo,
            NULL::TIMESTAMP as fecha_cambio;
        RETURN;
    END IF;
    
    -- Verificar si el usuario a modificar es super_admin
    SELECT EXISTS(
        SELECT 1 FROM tb_administradores a 
        WHERE a.id_usuario = p_id_usuario 
        AND a.rol_administrador = 'super_admin'
        AND a.estado_administrador = TRUE
    ) INTO v_es_super_admin;
    
    -- No permitir desactivar super_admin
    IF v_es_super_admin AND NOT p_nuevo_estado THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'No se puede desactivar un super administrador' as message,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::BOOLEAN as estado_anterior,
            NULL::BOOLEAN as estado_nuevo,
            NULL::TIMESTAMP as fecha_cambio;
        RETURN;
    END IF;
    
    -- Actualizar el estado del usuario
    UPDATE tb_usuarios 
    SET 
        estado_usuario = p_nuevo_estado,
        fecha_actualizacion_usuario = CURRENT_TIMESTAMP
    WHERE id_usuario = p_id_usuario;
    
    -- Si se desactiva, también desactivar roles de administrador
    IF NOT p_nuevo_estado THEN
        UPDATE tb_administradores 
        SET 
            estado_administrador = FALSE,
            fecha_ultima_actividad_administrador = CURRENT_TIMESTAMP,
            observaciones_administrador = COALESCE(observaciones_administrador || ' | ', '') || 
                'Usuario desactivado el ' || CURRENT_TIMESTAMP || 
                CASE WHEN p_razon_cambio IS NOT NULL THEN ': ' || p_razon_cambio ELSE '' END
        WHERE id_usuario = p_id_usuario 
        AND estado_administrador = TRUE;
    END IF;
    
    -- Retornar éxito
    RETURN QUERY SELECT 
        TRUE as success,
        CASE 
            WHEN p_nuevo_estado THEN 'Usuario activado exitosamente'
            ELSE 'Usuario desactivado exitosamente'
        END as message,
        p_id_usuario as id_usuario,
        v_nombre_completo as nombre_completo,
        v_estado_anterior as estado_anterior,
        p_nuevo_estado as estado_nuevo,
        CURRENT_TIMESTAMP as fecha_cambio;
        
EXCEPTION
    WHEN OTHERS THEN
        -- En caso de error, retornar información del error
        RETURN QUERY SELECT 
            FALSE as success,
            'Error al cambiar estado del usuario: ' || SQLERRM as message,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::BOOLEAN as estado_anterior,
            NULL::BOOLEAN as estado_nuevo,
            NULL::TIMESTAMP as fecha_cambio;
END;
$$ LANGUAGE plpgsql;

-- Comentarios sobre el procedimiento
COMMENT ON FUNCTION sp_cambiar_estado_usuario(UUID, BOOLEAN, UUID, TEXT) IS 
'Activa o desactiva un usuario del sistema. Valida permisos y previene desactivación de super_admin.';

-- Ejemplos de uso:
-- SELECT * FROM sp_cambiar_estado_usuario('uuid-usuario', FALSE, 'uuid-admin', 'Violación de términos');
-- SELECT * FROM sp_cambiar_estado_usuario('uuid-usuario', TRUE, 'uuid-admin', 'Problema resuelto');
