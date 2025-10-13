-- =====================================================
-- Procedimiento: sp_listar_usuarios
-- Descripción: Lista todos los usuarios del sistema con filtros y paginación
-- Autor: Sistema de Gestión del Congreso de Tecnología
-- Fecha: 2025
-- =====================================================

CREATE OR REPLACE FUNCTION sp_listar_usuarios(
    p_filtro_tipo INTEGER DEFAULT NULL,         -- Filtrar por tipo de usuario
    p_filtro_estado BOOLEAN DEFAULT NULL,       -- Filtrar por estado (TRUE=activo, FALSE=inactivo)
    p_filtro_colegio VARCHAR(200) DEFAULT NULL, -- Filtrar por colegio
    p_buscar_texto VARCHAR(255) DEFAULT NULL,   -- Buscar en nombre, apellido o email
    p_limite INTEGER DEFAULT 10,                -- Límite de registros por página
    p_offset INTEGER DEFAULT 0                  -- Offset para paginación
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    total_registros BIGINT,
    id_usuario UUID,
    id_tipo_usuario INTEGER,
    nombre_tipo_usuario VARCHAR(50),
    nombre_usuario VARCHAR(100),
    apellido_usuario VARCHAR(100),
    email_usuario VARCHAR(255),
    telefono_usuario VARCHAR(20),
    colegio_usuario VARCHAR(200),
    estado_usuario BOOLEAN,
    email_verificado_usuario BOOLEAN,
    fecha_inscripcion_usuario TIMESTAMP,
    ultimo_acceso_usuario TIMESTAMP,
    total_actividades_inscritas BIGINT,
    total_asistencias BIGINT,
    es_administrador BOOLEAN,
    roles_administrador TEXT[]
) AS $$
DECLARE
    v_total_registros BIGINT := 0;
    v_usuario RECORD;
    v_actividades_count BIGINT;
    v_asistencias_count BIGINT;
    v_es_admin BOOLEAN;
    v_roles_admin TEXT[];
BEGIN
    -- Contar total de registros que coinciden con los filtros
    SELECT COUNT(*) INTO v_total_registros
    FROM tb_usuarios u
    JOIN tb_tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
    WHERE (p_filtro_tipo IS NULL OR u.id_tipo_usuario = p_filtro_tipo)
    AND (p_filtro_estado IS NULL OR u.estado_usuario = p_filtro_estado)
    AND (p_filtro_colegio IS NULL OR u.colegio_usuario ILIKE '%' || p_filtro_colegio || '%')
    AND (p_buscar_texto IS NULL OR 
         u.nombre_usuario ILIKE '%' || p_buscar_texto || '%' OR
         u.apellido_usuario ILIKE '%' || p_buscar_texto || '%' OR
         u.email_usuario ILIKE '%' || p_buscar_texto || '%');
    
    -- Iterar sobre los usuarios que coinciden con los filtros
    FOR v_usuario IN
        SELECT 
            u.id_usuario,
            u.id_tipo_usuario,
            tu.nombre_tipo_usuario,
            u.nombre_usuario,
            u.apellido_usuario,
            u.email_usuario,
            u.telefono_usuario,
            u.colegio_usuario,
            u.estado_usuario,
            u.email_verificado_usuario,
            u.fecha_inscripcion_usuario,
            u.ultimo_acceso_usuario
        FROM tb_usuarios u
        JOIN tb_tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
        WHERE (p_filtro_tipo IS NULL OR u.id_tipo_usuario = p_filtro_tipo)
        AND (p_filtro_estado IS NULL OR u.estado_usuario = p_filtro_estado)
        AND (p_filtro_colegio IS NULL OR u.colegio_usuario ILIKE '%' || p_filtro_colegio || '%')
        AND (p_buscar_texto IS NULL OR 
             u.nombre_usuario ILIKE '%' || p_buscar_texto || '%' OR
             u.apellido_usuario ILIKE '%' || p_buscar_texto || '%' OR
             u.email_usuario ILIKE '%' || p_buscar_texto || '%')
        ORDER BY u.fecha_inscripcion_usuario DESC
        LIMIT p_limite OFFSET p_offset
    LOOP
        -- Contar actividades inscritas
        SELECT COUNT(*) INTO v_actividades_count
        FROM tb_inscripciones_actividad ia
        WHERE ia.id_usuario = v_usuario.id_usuario
        AND ia.estado_inscripcion = 'confirmada';
        
        -- Contar asistencias generales
        SELECT COUNT(*) INTO v_asistencias_count
        FROM tb_asistencia_general ag
        WHERE ag.id_usuario = v_usuario.id_usuario;
        
        -- Verificar si es administrador
        SELECT 
            CASE WHEN COUNT(*) > 0 THEN TRUE ELSE FALSE END,
            ARRAY_AGG(rol_administrador)
        INTO v_es_admin, v_roles_admin
        FROM tb_administradores a
        WHERE a.id_usuario = v_usuario.id_usuario
        AND a.estado_administrador = TRUE;
        
        -- Si no es administrador, inicializar array vacío
        IF v_es_admin IS NULL THEN
            v_es_admin := FALSE;
            v_roles_admin := ARRAY[]::TEXT[];
        END IF;
        
        -- Retornar el registro
        success := TRUE;
        message := 'Consulta exitosa';
        total_registros := v_total_registros;
        id_usuario := v_usuario.id_usuario;
        id_tipo_usuario := v_usuario.id_tipo_usuario;
        nombre_tipo_usuario := v_usuario.nombre_tipo_usuario;
        nombre_usuario := v_usuario.nombre_usuario;
        apellido_usuario := v_usuario.apellido_usuario;
        email_usuario := v_usuario.email_usuario;
        telefono_usuario := v_usuario.telefono_usuario;
        colegio_usuario := v_usuario.colegio_usuario;
        estado_usuario := v_usuario.estado_usuario;
        email_verificado_usuario := v_usuario.email_verificado_usuario;
        fecha_inscripcion_usuario := v_usuario.fecha_inscripcion_usuario;
        ultimo_acceso_usuario := v_usuario.ultimo_acceso_usuario;
        total_actividades_inscritas := v_actividades_count;
        total_asistencias := v_asistencias_count;
        es_administrador := v_es_admin;
        roles_administrador := v_roles_admin;
        
        RETURN NEXT;
    END LOOP;
        
EXCEPTION
    WHEN OTHERS THEN
        -- En caso de error, retornar información del error
        success := FALSE;
        message := 'Error al consultar usuarios: ' || SQLERRM;
        total_registros := 0;
        id_usuario := NULL;
        id_tipo_usuario := NULL;
        nombre_tipo_usuario := NULL;
        nombre_usuario := NULL;
        apellido_usuario := NULL;
        email_usuario := NULL;
        telefono_usuario := NULL;
        colegio_usuario := NULL;
        estado_usuario := NULL;
        email_verificado_usuario := NULL;
        fecha_inscripcion_usuario := NULL;
        ultimo_acceso_usuario := NULL;
        total_actividades_inscritas := NULL;
        total_asistencias := NULL;
        es_administrador := NULL;
        roles_administrador := NULL;
        RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Comentarios sobre el procedimiento
COMMENT ON FUNCTION sp_listar_usuarios(INTEGER, BOOLEAN, VARCHAR, VARCHAR, INTEGER, INTEGER) IS 
'Lista todos los usuarios del sistema con filtros opcionales, paginación y estadísticas agregadas.';

-- Ejemplos de uso:
-- SELECT * FROM sp_listar_usuarios(); -- Listar todos los usuarios
-- SELECT * FROM sp_listar_usuarios(1, TRUE, NULL, 'juan', 20, 0); -- Buscar usuarios activos tipo 1 que contengan 'juan'
-- SELECT * FROM sp_listar_usuarios(NULL, TRUE, 'Colegio San José', NULL, 10, 0); -- Usuarios activos del Colegio San José
