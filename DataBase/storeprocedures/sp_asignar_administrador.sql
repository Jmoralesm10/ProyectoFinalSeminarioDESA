-- =====================================================
-- Procedimiento: sp_asignar_administrador
-- Descripción: Asigna un rol de administrador a un usuario existente
-- Autor: Sistema de Gestión del Congreso de Tecnología
-- Fecha: 2025
-- =====================================================

CREATE OR REPLACE FUNCTION sp_asignar_administrador(
    p_id_usuario UUID,                    -- ID del usuario a asignar como administrador
    p_rol_administrador VARCHAR(50),      -- Rol a asignar
    p_permisos_administrador TEXT[],      -- Array de permisos específicos
    p_asignado_por_usuario UUID,          -- ID del usuario que hace la asignación
    p_observaciones_administrador TEXT DEFAULT NULL -- Observaciones opcionales
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    id_usuario UUID,
    rol_administrador VARCHAR(50),
    nombre_completo TEXT
) AS $$
DECLARE
    v_nombre_completo TEXT;
    v_usuario_existe BOOLEAN := FALSE;
    v_ya_es_administrador BOOLEAN := FALSE;
    v_asignador_existe BOOLEAN := FALSE;
BEGIN
    -- Validar parámetros de entrada
    IF p_id_usuario IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'El ID de usuario es obligatorio' as message,
            NULL::UUID as id_usuario,
            NULL::VARCHAR(50) as rol_administrador,
            NULL::TEXT as nombre_completo;
        RETURN;
    END IF;
    
    IF p_rol_administrador IS NULL OR TRIM(p_rol_administrador) = '' THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'El rol de administrador es obligatorio' as message,
            NULL::UUID as id_usuario,
            NULL::VARCHAR(50) as rol_administrador,
            NULL::TEXT as nombre_completo;
        RETURN;
    END IF;
    
    IF p_rol_administrador NOT IN ('admin', 'super_admin', 'moderador') THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'Rol de administrador inválido. Use: admin, super_admin o moderador' as message,
            NULL::UUID as id_usuario,
            NULL::VARCHAR(50) as rol_administrador,
            NULL::TEXT as nombre_completo;
        RETURN;
    END IF;
    
    -- Verificar que el usuario existe y está activo
    SELECT u.nombre_usuario || ' ' || u.apellido_usuario, u.estado_usuario
    INTO v_nombre_completo, v_usuario_existe
    FROM tb_usuarios u
    WHERE u.id_usuario = p_id_usuario;
    
    IF v_nombre_completo IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'Usuario no encontrado' as message,
            NULL::UUID as id_usuario,
            NULL::VARCHAR(50) as rol_administrador,
            NULL::TEXT as nombre_completo;
        RETURN;
    END IF;
    
    IF NOT v_usuario_existe THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'El usuario está inactivo' as message,
            NULL::UUID as id_usuario,
            NULL::VARCHAR(50) as rol_administrador,
            NULL::TEXT as nombre_completo;
        RETURN;
    END IF;
    
    -- Verificar que el usuario no tenga ya este rol específico
    SELECT EXISTS(
        SELECT 1 FROM tb_administradores a 
        WHERE a.id_usuario = p_id_usuario 
        AND a.rol_administrador = p_rol_administrador 
        AND a.estado_administrador = TRUE
    ) INTO v_ya_es_administrador;
    
    IF v_ya_es_administrador THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'El usuario ya tiene este rol de administrador' as message,
            NULL::UUID as id_usuario,
            NULL::VARCHAR(50) as rol_administrador,
            NULL::TEXT as nombre_completo;
        RETURN;
    END IF;
    
    -- Verificar que el asignador existe y es administrador (si se proporciona)
    IF p_asignado_por_usuario IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1 FROM tb_administradores a 
            WHERE a.id_usuario = p_asignado_por_usuario 
            AND a.estado_administrador = TRUE
            AND (a.rol_administrador = 'super_admin' OR 'gestion_administradores' = ANY(a.permisos_administrador))
        ) INTO v_asignador_existe;
        
        IF NOT v_asignador_existe THEN
            RETURN QUERY SELECT 
                FALSE as success,
                'El usuario asignador no tiene permisos para asignar administradores' as message,
                NULL::UUID as id_usuario,
                NULL::VARCHAR(50) as rol_administrador,
                NULL::TEXT as nombre_completo;
            RETURN;
        END IF;
    END IF;
    
    -- Asignar el rol de administrador
    INSERT INTO tb_administradores (
        id_usuario,
        rol_administrador,
        permisos_administrador,
        estado_administrador,
        asignado_por_usuario,
        observaciones_administrador
    ) VALUES (
        p_id_usuario,
        p_rol_administrador,
        p_permisos_administrador,
        TRUE,
        p_asignado_por_usuario,
        p_observaciones_administrador
    );
    
    -- Retornar éxito
    RETURN QUERY SELECT 
        TRUE as success,
        'Administrador asignado exitosamente' as message,
        p_id_usuario as id_usuario,
        p_rol_administrador as rol_administrador,
        v_nombre_completo as nombre_completo;
        
EXCEPTION
    WHEN OTHERS THEN
        -- En caso de error, retornar información del error
        RETURN QUERY SELECT 
            FALSE as success,
            'Error al asignar administrador: ' || SQLERRM as message,
            NULL::UUID as id_usuario,
            NULL::VARCHAR(50) as rol_administrador,
            NULL::TEXT as nombre_completo;
END;
$$ LANGUAGE plpgsql;

-- Comentarios sobre el procedimiento
COMMENT ON FUNCTION sp_asignar_administrador(UUID, VARCHAR, TEXT[], UUID, TEXT) IS 
'Asigna un rol de administrador a un usuario existente. Valida que el usuario esté activo, 
no sea ya administrador y que el asignador exista.';

-- Ejemplo de uso:
-- SELECT * FROM sp_asignar_administrador(
--     'uuid-del-usuario', 
--     'admin', 
--     ARRAY['gestion_usuarios', 'ver_reportes'], 
--     'uuid-del-usuario-asignador',
--     'Asignado para gestionar usuarios'
-- );
