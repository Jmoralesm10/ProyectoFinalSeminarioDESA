-- =====================================================
-- Procedimiento: sp_verificar_permisos_administrador
-- Descripción: Verifica si un usuario tiene permisos de administrador específicos
-- Autor: Sistema de Gestión del Congreso de Tecnología
-- Fecha: 2025
-- =====================================================

CREATE OR REPLACE FUNCTION sp_verificar_permisos_administrador(
    p_id_usuario UUID,                    -- ID del usuario a verificar
    p_permiso_requerido VARCHAR(100)      -- Permiso específico a verificar
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    es_administrador BOOLEAN,
    rol_administrador VARCHAR(50),
    tiene_permiso BOOLEAN,
    permisos_disponibles TEXT[]
) AS $$
DECLARE
    v_rol_administrador VARCHAR(50);
    v_permisos_disponibles TEXT[];
    v_estado_administrador BOOLEAN;
    v_tiene_permiso BOOLEAN := FALSE;
BEGIN
    -- Validar parámetros de entrada
    IF p_id_usuario IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'El ID de usuario es obligatorio' as message,
            FALSE as es_administrador,
            NULL::VARCHAR(50) as rol_administrador,
            FALSE as tiene_permiso,
            NULL::TEXT[] as permisos_disponibles;
        RETURN;
    END IF;
    
    IF p_permiso_requerido IS NULL OR TRIM(p_permiso_requerido) = '' THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'El permiso requerido es obligatorio' as message,
            FALSE as es_administrador,
            NULL::VARCHAR(50) as rol_administrador,
            FALSE as tiene_permiso,
            NULL::TEXT[] as permisos_disponibles;
        RETURN;
    END IF;
    
    -- Buscar información del administrador (puede tener múltiples roles)
    SELECT 
        a.rol_administrador,
        a.permisos_administrador,
        a.estado_administrador
    INTO 
        v_rol_administrador,
        v_permisos_disponibles,
        v_estado_administrador
    FROM tb_administradores a
    WHERE a.id_usuario = p_id_usuario 
    AND a.estado_administrador = TRUE
    ORDER BY 
        CASE a.rol_administrador 
            WHEN 'super_admin' THEN 1 
            WHEN 'admin' THEN 2 
            WHEN 'moderador' THEN 3 
        END
    LIMIT 1;
    
    -- Verificar si es administrador
    IF v_rol_administrador IS NULL OR NOT v_estado_administrador THEN
        RETURN QUERY SELECT 
            TRUE as success,
            'Usuario no es administrador o está inactivo' as message,
            FALSE as es_administrador,
            NULL::VARCHAR(50) as rol_administrador,
            FALSE as tiene_permiso,
            NULL::TEXT[] as permisos_disponibles;
        RETURN;
    END IF;
    
    -- Verificar si tiene el permiso específico
    IF v_permisos_disponibles IS NOT NULL THEN
        v_tiene_permiso := p_permiso_requerido = ANY(v_permisos_disponibles);
    END IF;
    
    -- Los super_admin tienen todos los permisos
    IF v_rol_administrador = 'super_admin' THEN
        v_tiene_permiso := TRUE;
    END IF;
    
    -- Retornar resultado
    RETURN QUERY SELECT 
        TRUE as success,
        CASE 
            WHEN v_tiene_permiso THEN 'Usuario tiene el permiso requerido'
            ELSE 'Usuario no tiene el permiso requerido'
        END as message,
        TRUE as es_administrador,
        v_rol_administrador as rol_administrador,
        v_tiene_permiso as tiene_permiso,
        v_permisos_disponibles as permisos_disponibles;
        
EXCEPTION
    WHEN OTHERS THEN
        -- En caso de error, retornar información del error
        RETURN QUERY SELECT 
            FALSE as success,
            'Error al verificar permisos: ' || SQLERRM as message,
            FALSE as es_administrador,
            NULL::VARCHAR(50) as rol_administrador,
            FALSE as tiene_permiso,
            NULL::TEXT[] as permisos_disponibles;
END;
$$ LANGUAGE plpgsql;

-- Comentarios sobre el procedimiento
COMMENT ON FUNCTION sp_verificar_permisos_administrador(UUID, VARCHAR) IS 
'Verifica si un usuario tiene permisos de administrador específicos. Los super_admin tienen todos los permisos.';

-- Ejemplos de uso:
-- SELECT * FROM sp_verificar_permisos_administrador('uuid-del-usuario', 'gestion_usuarios');
-- SELECT * FROM sp_verificar_permisos_administrador('uuid-del-usuario', 'gestion_actividades');
-- SELECT * FROM sp_verificar_permisos_administrador('uuid-del-usuario', 'gestion_sistema');
