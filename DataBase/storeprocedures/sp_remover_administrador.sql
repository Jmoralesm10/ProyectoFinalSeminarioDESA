-- =====================================================
-- Procedimiento: sp_remover_administrador
-- Descripción: Remueve o desactiva un administrador del sistema
-- Autor: Sistema de Gestión del Congreso de Tecnología
-- Fecha: 2025
-- =====================================================

CREATE OR REPLACE FUNCTION sp_remover_administrador(
    p_id_usuario UUID,                    -- ID del usuario administrador a remover
    p_rol_administrador VARCHAR(50),      -- Rol específico a remover
    p_removido_por_usuario UUID,          -- ID del usuario que hace la remoción
    p_razon_remocion TEXT DEFAULT NULL,   -- Razón de la remoción
    p_desactivar_en_lugar_de_eliminar BOOLEAN DEFAULT TRUE -- Si desactivar en lugar de eliminar
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    id_usuario UUID,
    rol_administrador VARCHAR(50),
    nombre_completo TEXT,
    accion_realizada TEXT
) AS $$
DECLARE
    v_nombre_completo TEXT;
    v_administrador_existe BOOLEAN := FALSE;
    v_removidor_existe BOOLEAN := FALSE;
    v_es_super_admin BOOLEAN := FALSE;
BEGIN
    -- Validar parámetros de entrada
    IF p_id_usuario IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'El ID de usuario es obligatorio' as message,
            NULL::UUID as id_usuario,
            NULL::VARCHAR(50) as rol_administrador,
            NULL::TEXT as nombre_completo,
            NULL::TEXT as accion_realizada;
        RETURN;
    END IF;
    
    IF p_rol_administrador IS NULL OR TRIM(p_rol_administrador) = '' THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'El rol de administrador es obligatorio' as message,
            NULL::UUID as id_usuario,
            NULL::VARCHAR(50) as rol_administrador,
            NULL::TEXT as nombre_completo,
            NULL::TEXT as accion_realizada;
        RETURN;
    END IF;
    
    IF p_removido_por_usuario IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'El ID del usuario que remueve es obligatorio' as message,
            NULL::UUID as id_usuario,
            NULL::VARCHAR(50) as rol_administrador,
            NULL::TEXT as nombre_completo,
            NULL::TEXT as accion_realizada;
        RETURN;
    END IF;
    
    -- Verificar que el administrador a remover existe
    SELECT 
        u.nombre_usuario || ' ' || u.apellido_usuario,
        a.estado_administrador,
        a.rol_administrador
    INTO 
        v_nombre_completo,
        v_administrador_existe,
        v_es_super_admin
    FROM tb_administradores a
    JOIN tb_usuarios u ON a.id_usuario = u.id_usuario
    WHERE a.id_usuario = p_id_usuario 
    AND a.rol_administrador = p_rol_administrador;
    
    IF v_nombre_completo IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'Administrador no encontrado' as message,
            NULL::UUID as id_usuario,
            NULL::VARCHAR(50) as rol_administrador,
            NULL::TEXT as nombre_completo,
            NULL::TEXT as accion_realizada;
        RETURN;
    END IF;
    
    IF NOT v_administrador_existe THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'El administrador ya está inactivo' as message,
            NULL::UUID as id_usuario,
            NULL::VARCHAR(50) as rol_administrador,
            NULL::TEXT as nombre_completo,
            NULL::TEXT as accion_realizada;
        RETURN;
    END IF;
    
    -- Verificar que el removidor existe y tiene permisos
    SELECT EXISTS(
        SELECT 1 FROM tb_administradores a 
        WHERE a.id_usuario = p_removido_por_usuario 
        AND a.estado_administrador = TRUE
        AND (a.rol_administrador = 'super_admin' OR 'gestion_administradores' = ANY(a.permisos_administrador))
    ) INTO v_removidor_existe;
    
    IF NOT v_removidor_existe THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'No tiene permisos para remover administradores' as message,
            NULL::UUID as id_usuario,
            NULL::VARCHAR(50) as rol_administrador,
            NULL::TEXT as nombre_completo,
            NULL::TEXT as accion_realizada;
        RETURN;
    END IF;
    
    -- No permitir que un super_admin se remueva a sí mismo
    IF p_id_usuario = p_removido_por_usuario AND v_es_super_admin AND p_rol_administrador = 'super_admin' THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'Un super administrador no puede remover su propio rol de super_admin' as message,
            NULL::UUID as id_usuario,
            NULL::VARCHAR(50) as rol_administrador,
            NULL::TEXT as nombre_completo,
            NULL::TEXT as accion_realizada;
        RETURN;
    END IF;
    
    -- Realizar la remoción
    IF p_desactivar_en_lugar_de_eliminar THEN
        -- Desactivar el administrador
        UPDATE tb_administradores 
        SET 
            estado_administrador = FALSE,
            fecha_ultima_actividad_administrador = CURRENT_TIMESTAMP,
            observaciones_administrador = COALESCE(observaciones_administrador || ' | ', '') || 
                'Removido el ' || CURRENT_TIMESTAMP || 
                CASE WHEN p_razon_remocion IS NOT NULL THEN ': ' || p_razon_remocion ELSE '' END
        WHERE id_usuario = p_id_usuario 
        AND rol_administrador = p_rol_administrador;
        
        RETURN QUERY SELECT 
            TRUE as success,
            'Administrador desactivado exitosamente' as message,
            p_id_usuario as id_usuario,
            p_rol_administrador as rol_administrador,
            v_nombre_completo as nombre_completo,
            'desactivado' as accion_realizada;
    ELSE
        -- Eliminar el registro
        DELETE FROM tb_administradores 
        WHERE id_usuario = p_id_usuario 
        AND rol_administrador = p_rol_administrador;
        
        RETURN QUERY SELECT 
            TRUE as success,
            'Administrador eliminado exitosamente' as message,
            p_id_usuario as id_usuario,
            p_rol_administrador as rol_administrador,
            v_nombre_completo as nombre_completo,
            'eliminado' as accion_realizada;
    END IF;
        
EXCEPTION
    WHEN OTHERS THEN
        -- En caso de error, retornar información del error
        RETURN QUERY SELECT 
            FALSE as success,
            'Error al remover administrador: ' || SQLERRM as message,
            NULL::UUID as id_usuario,
            NULL::VARCHAR(50) as rol_administrador,
            NULL::TEXT as nombre_completo,
            NULL::TEXT as accion_realizada;
END;
$$ LANGUAGE plpgsql;

-- Comentarios sobre el procedimiento
COMMENT ON FUNCTION sp_remover_administrador(UUID, VARCHAR, UUID, TEXT, BOOLEAN) IS 
'Remueve o desactiva un administrador del sistema. Valida permisos y previene auto-remoción de super_admin.';

-- Ejemplos de uso:
-- SELECT * FROM sp_remover_administrador('uuid-usuario', 'admin', 'uuid-removidor', 'Falta de actividad', TRUE);
-- SELECT * FROM sp_remover_administrador('uuid-usuario', 'moderador', 'uuid-removidor', NULL, FALSE);
