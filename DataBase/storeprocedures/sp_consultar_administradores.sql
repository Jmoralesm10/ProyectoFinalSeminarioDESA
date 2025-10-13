-- =====================================================
-- Procedimiento: sp_consultar_administradores
-- Descripción: Consulta la lista de administradores con filtros opcionales
-- Autor: Sistema de Gestión del Congreso de Tecnología
-- Fecha: 2025
-- =====================================================

CREATE OR REPLACE FUNCTION sp_consultar_administradores(
    p_rol_administrador VARCHAR(50) DEFAULT NULL,  -- Filtrar por rol
    p_estado_administrador BOOLEAN DEFAULT NULL,   -- Filtrar por estado
    p_limite INTEGER DEFAULT 50,                   -- Límite de resultados
    p_offset INTEGER DEFAULT 0                     -- Offset para paginación
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    total_registros BIGINT,
    id_usuario UUID,
    rol_administrador VARCHAR(50),
    nombre_completo TEXT,
    email_usuario VARCHAR(255),
    telefono_usuario VARCHAR(20),
    colegio_usuario VARCHAR(200),
    tipo_usuario VARCHAR(50),
    permisos_administrador TEXT[],
    estado_administrador BOOLEAN,
    fecha_asignacion_administrador TIMESTAMP,
    fecha_ultima_actividad_administrador TIMESTAMP,
    asignado_por_nombre TEXT,
    observaciones_administrador TEXT
) AS $$
DECLARE
    v_total_registros BIGINT := 0;
BEGIN
    -- Contar total de registros que coinciden con los filtros
    SELECT COUNT(*) INTO v_total_registros
    FROM tb_administradores a
    JOIN tb_usuarios u ON a.id_usuario = u.id_usuario
    WHERE (p_rol_administrador IS NULL OR a.rol_administrador = p_rol_administrador)
    AND (p_estado_administrador IS NULL OR a.estado_administrador = p_estado_administrador);
    
    -- Retornar datos de administradores
    RETURN QUERY
    SELECT 
        TRUE as success,
        'Consulta exitosa' as message,
        v_total_registros as total_registros,
        a.id_usuario,
        a.rol_administrador,
        u.nombre_usuario || ' ' || u.apellido_usuario as nombre_completo,
        u.email_usuario,
        u.telefono_usuario,
        u.colegio_usuario,
        tu.nombre_tipo_usuario as tipo_usuario,
        a.permisos_administrador,
        a.estado_administrador,
        a.fecha_asignacion_administrador,
        a.fecha_ultima_actividad_administrador,
        asignador.nombre_usuario || ' ' || asignador.apellido_usuario as asignado_por_nombre,
        a.observaciones_administrador
    FROM tb_administradores a
    JOIN tb_usuarios u ON a.id_usuario = u.id_usuario
    JOIN tb_tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
    LEFT JOIN tb_usuarios asignador ON a.asignado_por_usuario = asignador.id_usuario
    WHERE (p_rol_administrador IS NULL OR a.rol_administrador = p_rol_administrador)
    AND (p_estado_administrador IS NULL OR a.estado_administrador = p_estado_administrador)
    ORDER BY a.fecha_asignacion_administrador DESC
    LIMIT p_limite OFFSET p_offset;
        
EXCEPTION
    WHEN OTHERS THEN
        -- En caso de error, retornar información del error
        RETURN QUERY SELECT 
            FALSE as success,
            'Error al consultar administradores: ' || SQLERRM as message,
            NULL::BIGINT as total_registros,
            NULL::UUID as id_usuario,
            NULL::VARCHAR(50) as rol_administrador,
            NULL::TEXT as nombre_completo,
            NULL::VARCHAR(255) as email_usuario,
            NULL::VARCHAR(20) as telefono_usuario,
            NULL::VARCHAR(200) as colegio_usuario,
            NULL::VARCHAR(50) as tipo_usuario,
            NULL::TEXT[] as permisos_administrador,
            NULL::BOOLEAN as estado_administrador,
            NULL::TIMESTAMP as fecha_asignacion_administrador,
            NULL::TIMESTAMP as fecha_ultima_actividad_administrador,
            NULL::TEXT as asignado_por_nombre,
            NULL::TEXT as observaciones_administrador;
END;
$$ LANGUAGE plpgsql;

-- Comentarios sobre el procedimiento
COMMENT ON FUNCTION sp_consultar_administradores(VARCHAR, BOOLEAN, INTEGER, INTEGER) IS 
'Consulta la lista de administradores con filtros opcionales por rol y estado. 
Incluye información completa del usuario y quien asignó el rol.';

-- Ejemplos de uso:
-- SELECT * FROM sp_consultar_administradores();
-- SELECT * FROM sp_consultar_administradores('admin', TRUE, 10, 0);
-- SELECT * FROM sp_consultar_administradores(NULL, TRUE, 20, 0);
