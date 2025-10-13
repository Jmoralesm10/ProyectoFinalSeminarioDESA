-- =====================================================
-- Procedimiento: sp_actualizar_permisos_administrador
-- Descripción: Actualiza los permisos específicos de un administrador
-- Autor: Sistema de Gestión del Congreso de Tecnología
-- Fecha: 2025
-- =====================================================

CREATE OR REPLACE FUNCTION sp_actualizar_permisos_administrador(
    p_id_usuario UUID,                    -- ID del usuario administrador
    p_rol_administrador VARCHAR(50),      -- Rol específico a modificar
    p_nuevos_permisos TEXT[],             -- Array de nuevos permisos
    p_modificado_por_usuario UUID,        -- ID del usuario que hace la modificación
    p_razon_modificacion TEXT DEFAULT NULL -- Razón de la modificación
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    id_usuario UUID,
    rol_administrador VARCHAR(50),
    nombre_completo TEXT,
    permisos_anteriores TEXT[],
    permisos_nuevos TEXT[],
    fecha_modificacion TIMESTAMP
) AS $$
DECLARE
    v_nombre_completo TEXT;
    v_permisos_anteriores TEXT[];
    v_administrador_existe BOOLEAN := FALSE;
    v_modificador_existe BOOLEAN := FALSE;
    v_es_super_admin BOOLEAN := FALSE;
    v_permisos_validos TEXT[] := ARRAY[
        'gestion_usuarios',
        'gestion_actividades', 
        'gestion_administradores',
        'ver_reportes',
        'gestion_sistema',
        'gestion_asistencias',
        'gestion_diplomas',
        'gestion_pagos'
    ];
BEGIN
    -- Validar parámetros de entrada
    IF p_id_usuario IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'El ID de usuario es obligatorio' as message,
            NULL::UUID as id_usuario,
            NULL::VARCHAR(50) as rol_administrador,
            NULL::TEXT as nombre_completo,
            NULL::TEXT[] as permisos_anteriores,
            NULL::TEXT[] as permisos_nuevos,
            NULL::TIMESTAMP as fecha_modificacion;
        RETURN;
    END IF;
    
    IF p_rol_administrador IS NULL OR TRIM(p_rol_administrador) = '' THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'El rol de administrador es obligatorio' as message,
            NULL::UUID as id_usuario,
            NULL::VARCHAR(50) as rol_administrador,
            NULL::TEXT as nombre_completo,
            NULL::TEXT[] as permisos_anteriores,
            NULL::TEXT[] as permisos_nuevos,
            NULL::TIMESTAMP as fecha_modificacion;
        RETURN;
    END IF;
    
    IF p_rol_administrador NOT IN ('admin', 'super_admin', 'moderador') THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'Rol de administrador inválido. Use: admin, super_admin o moderador' as message,
            NULL::UUID as id_usuario,
            NULL::VARCHAR(50) as rol_administrador,
            NULL::TEXT as nombre_completo,
            NULL::TEXT[] as permisos_anteriores,
            NULL::TEXT[] as permisos_nuevos,
            NULL::TIMESTAMP as fecha_modificacion;
        RETURN;
    END IF;
    
    IF p_modificado_por_usuario IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'El ID del usuario que modifica es obligatorio' as message,
            NULL::UUID as id_usuario,
            NULL::VARCHAR(50) as rol_administrador,
            NULL::TEXT as nombre_completo,
            NULL::TEXT[] as permisos_anteriores,
            NULL::TEXT[] as permisos_nuevos,
            NULL::TIMESTAMP as fecha_modificacion;
        RETURN;
    END IF;
    
    -- Verificar que el administrador existe
    SELECT 
        u.nombre_usuario || ' ' || u.apellido_usuario,
        a.permisos_administrador,
        a.estado_administrador
    INTO 
        v_nombre_completo,
        v_permisos_anteriores,
        v_administrador_existe
    FROM tb_usuarios u
    JOIN tb_administradores a ON u.id_usuario = a.id_usuario
    WHERE a.id_usuario = p_id_usuario 
    AND a.rol_administrador = p_rol_administrador;
    
    IF v_nombre_completo IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'Administrador no encontrado' as message,
            NULL::UUID as id_usuario,
            NULL::VARCHAR(50) as rol_administrador,
            NULL::TEXT as nombre_completo,
            NULL::TEXT[] as permisos_anteriores,
            NULL::TEXT[] as permisos_nuevos,
            NULL::TIMESTAMP as fecha_modificacion;
        RETURN;
    END IF;
    
    IF NOT v_administrador_existe THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'El administrador está inactivo' as message,
            NULL::UUID as id_usuario,
            NULL::VARCHAR(50) as rol_administrador,
            NULL::TEXT as nombre_completo,
            NULL::TEXT[] as permisos_anteriores,
            NULL::TEXT[] as permisos_nuevos,
            NULL::TIMESTAMP as fecha_modificacion;
        RETURN;
    END IF;
    
    -- Verificar que el modificador existe y tiene permisos
    SELECT EXISTS(
        SELECT 1 FROM tb_administradores a 
        WHERE a.id_usuario = p_modificado_por_usuario 
        AND a.estado_administrador = TRUE
        AND (a.rol_administrador = 'super_admin' OR 'gestion_administradores' = ANY(a.permisos_administrador))
    ) INTO v_modificador_existe;
    
    IF NOT v_modificador_existe THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'No tiene permisos para modificar permisos de administradores' as message,
            NULL::UUID as id_usuario,
            NULL::VARCHAR(50) as rol_administrador,
            NULL::TEXT as nombre_completo,
            NULL::TEXT[] as permisos_anteriores,
            NULL::TEXT[] as permisos_nuevos,
            NULL::TIMESTAMP as fecha_modificacion;
        RETURN;
    END IF;
    
    -- Verificar si es super_admin
    SELECT EXISTS(
        SELECT 1 FROM tb_administradores a 
        WHERE a.id_usuario = p_id_usuario 
        AND a.rol_administrador = 'super_admin'
        AND a.estado_administrador = TRUE
    ) INTO v_es_super_admin;
    
    -- No permitir modificar permisos de super_admin
    IF v_es_super_admin THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'No se pueden modificar los permisos de un super administrador' as message,
            NULL::UUID as id_usuario,
            NULL::VARCHAR(50) as rol_administrador,
            NULL::TEXT as nombre_completo,
            NULL::TEXT[] as permisos_anteriores,
            NULL::TEXT[] as permisos_nuevos,
            NULL::TIMESTAMP as fecha_modificacion;
        RETURN;
    END IF;
    
    -- Validar permisos (todos deben estar en la lista de permisos válidos)
    IF p_nuevos_permisos IS NOT NULL THEN
        IF NOT (p_nuevos_permisos <@ v_permisos_validos) THEN
            RETURN QUERY SELECT 
                FALSE as success,
                'Algunos permisos no son válidos. Permisos válidos: ' || array_to_string(v_permisos_validos, ', ') as message,
                NULL::UUID as id_usuario,
                NULL::VARCHAR(50) as rol_administrador,
                NULL::TEXT as nombre_completo,
                NULL::TEXT[] as permisos_anteriores,
                NULL::TEXT[] as permisos_nuevos,
                NULL::TIMESTAMP as fecha_modificacion;
            RETURN;
        END IF;
    END IF;
    
    -- Actualizar permisos
    UPDATE tb_administradores 
    SET 
        permisos_administrador = COALESCE(p_nuevos_permisos, permisos_administrador),
        fecha_ultima_actividad_administrador = CURRENT_TIMESTAMP,
        observaciones_administrador = COALESCE(observaciones_administrador || ' | ', '') || 
            'Permisos modificados el ' || CURRENT_TIMESTAMP || 
            CASE WHEN p_razon_modificacion IS NOT NULL THEN ': ' || p_razon_modificacion ELSE '' END
    WHERE id_usuario = p_id_usuario 
    AND rol_administrador = p_rol_administrador;
    
    -- Retornar éxito
    RETURN QUERY SELECT 
        TRUE as success,
        'Permisos actualizados exitosamente' as message,
        p_id_usuario as id_usuario,
        p_rol_administrador as rol_administrador,
        v_nombre_completo as nombre_completo,
        v_permisos_anteriores as permisos_anteriores,
        COALESCE(p_nuevos_permisos, v_permisos_anteriores) as permisos_nuevos,
        CURRENT_TIMESTAMP as fecha_modificacion;
        
EXCEPTION
    WHEN OTHERS THEN
        -- En caso de error, retornar información del error
        RETURN QUERY SELECT 
            FALSE as success,
            'Error al actualizar permisos: ' || SQLERRM as message,
            NULL::UUID as id_usuario,
            NULL::VARCHAR(50) as rol_administrador,
            NULL::TEXT as nombre_completo,
            NULL::TEXT[] as permisos_anteriores,
            NULL::TEXT[] as permisos_nuevos,
            NULL::TIMESTAMP as fecha_modificacion;
END;
$$ LANGUAGE plpgsql;

-- Comentarios sobre el procedimiento
COMMENT ON FUNCTION sp_actualizar_permisos_administrador(UUID, VARCHAR, TEXT[], UUID, TEXT) IS 
'Actualiza los permisos específicos de un administrador. Valida permisos y previene modificación de super_admin.';

-- Ejemplos de uso:
-- SELECT * FROM sp_actualizar_permisos_administrador('uuid-usuario', 'admin', ARRAY['gestion_usuarios', 'ver_reportes'], 'uuid-modificador', 'Actualización de permisos');
-- SELECT * FROM sp_actualizar_permisos_administrador('uuid-usuario', 'moderador', ARRAY['gestion_actividades'], 'uuid-modificador', 'Reducción de permisos');
