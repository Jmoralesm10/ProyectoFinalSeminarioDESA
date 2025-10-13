-- =====================================================
-- Procedimiento: sp_buscar_usuarios
-- Descripción: Busca usuarios con criterios específicos y avanzados
-- Autor: Sistema de Gestión del Congreso de Tecnología
-- Fecha: 2025
-- =====================================================

CREATE OR REPLACE FUNCTION sp_buscar_usuarios(
    p_criterio_busqueda VARCHAR(255),           -- Texto a buscar
    p_tipo_busqueda VARCHAR(50) DEFAULT 'general', -- 'general', 'nombre', 'email', 'colegio'
    p_tipo_usuario INTEGER DEFAULT NULL,        -- Filtrar por tipo de usuario
    p_estado_usuario BOOLEAN DEFAULT NULL,      -- Filtrar por estado
    p_solo_administradores BOOLEAN DEFAULT FALSE, -- Solo usuarios que son administradores
    p_solo_con_actividades BOOLEAN DEFAULT FALSE, -- Solo usuarios con actividades inscritas
    p_fecha_desde DATE DEFAULT NULL,            -- Usuarios registrados desde esta fecha
    p_fecha_hasta DATE DEFAULT NULL,            -- Usuarios registrados hasta esta fecha
    p_limite INTEGER DEFAULT 20,                -- Límite de resultados
    p_offset INTEGER DEFAULT 0                  -- Offset para paginación
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    total_resultados BIGINT,
    id_usuario UUID,
    nombre_completo TEXT,
    email_usuario VARCHAR(255),
    telefono_usuario VARCHAR(20),
    colegio_usuario VARCHAR(200),
    tipo_usuario VARCHAR(50),
    estado_usuario BOOLEAN,
    email_verificado BOOLEAN,
    fecha_inscripcion TIMESTAMP,
    ultimo_acceso TIMESTAMP,
    total_actividades BIGINT,
    total_asistencias BIGINT,
    es_administrador BOOLEAN,
    roles_administrador TEXT[],
    coincidencia_en TEXT                        -- Campo donde se encontró la coincidencia
) AS $$
DECLARE
    v_total_resultados BIGINT := 0;
    v_criterio_lower VARCHAR(255);
    v_usuario RECORD;
    v_actividades_count BIGINT;
    v_asistencias_count BIGINT;
    v_es_admin BOOLEAN;
    v_roles_admin TEXT[];
    v_coincidencia_en TEXT;
BEGIN
    -- Convertir criterio a minúsculas para búsqueda case-insensitive
    v_criterio_lower := LOWER(p_criterio_busqueda);
    
    -- Validar parámetros
    IF p_criterio_busqueda IS NULL OR TRIM(p_criterio_busqueda) = '' THEN
        success := FALSE;
        message := 'El criterio de búsqueda es obligatorio';
        total_resultados := 0;
        id_usuario := NULL;
        nombre_completo := NULL;
        email_usuario := NULL;
        telefono_usuario := NULL;
        colegio_usuario := NULL;
        tipo_usuario := NULL;
        estado_usuario := NULL;
        email_verificado := NULL;
        fecha_inscripcion := NULL;
        ultimo_acceso := NULL;
        total_actividades := NULL;
        total_asistencias := NULL;
        es_administrador := NULL;
        roles_administrador := NULL;
        coincidencia_en := NULL;
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Contar total de resultados
    SELECT COUNT(*) INTO v_total_resultados
    FROM tb_usuarios u
    JOIN tb_tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
    LEFT JOIN tb_administradores a ON u.id_usuario = a.id_usuario AND a.estado_administrador = TRUE
    LEFT JOIN tb_inscripciones_actividad ia ON u.id_usuario = ia.id_usuario AND ia.estado_inscripcion = 'confirmada'
    WHERE (
        CASE p_tipo_busqueda
            WHEN 'nombre' THEN 
                LOWER(u.nombre_usuario) LIKE '%' || v_criterio_lower || '%' OR
                LOWER(u.apellido_usuario) LIKE '%' || v_criterio_lower || '%'
            WHEN 'email' THEN 
                LOWER(u.email_usuario) LIKE '%' || v_criterio_lower || '%'
            WHEN 'colegio' THEN 
                LOWER(u.colegio_usuario) LIKE '%' || v_criterio_lower || '%'
            ELSE -- 'general'
                LOWER(u.nombre_usuario) LIKE '%' || v_criterio_lower || '%' OR
                LOWER(u.apellido_usuario) LIKE '%' || v_criterio_lower || '%' OR
                LOWER(u.email_usuario) LIKE '%' || v_criterio_lower || '%' OR
                LOWER(u.colegio_usuario) LIKE '%' || v_criterio_lower || '%'
        END
    )
    AND (p_tipo_usuario IS NULL OR u.id_tipo_usuario = p_tipo_usuario)
    AND (p_estado_usuario IS NULL OR u.estado_usuario = p_estado_usuario)
    AND (NOT p_solo_administradores OR a.id_usuario IS NOT NULL)
    AND (NOT p_solo_con_actividades OR ia.id_usuario IS NOT NULL)
    AND (p_fecha_desde IS NULL OR u.fecha_inscripcion_usuario::DATE >= p_fecha_desde)
    AND (p_fecha_hasta IS NULL OR u.fecha_inscripcion_usuario::DATE <= p_fecha_hasta);
    
    -- Iterar sobre los usuarios que coinciden con los criterios de búsqueda
    FOR v_usuario IN
        SELECT 
            u.id_usuario,
            u.nombre_usuario,
            u.apellido_usuario,
            u.email_usuario,
            u.telefono_usuario,
            u.colegio_usuario,
            u.estado_usuario,
            u.email_verificado_usuario,
            u.fecha_inscripcion_usuario,
            u.ultimo_acceso_usuario,
            tu.nombre_tipo_usuario
        FROM tb_usuarios u
        JOIN tb_tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
        LEFT JOIN tb_administradores a ON u.id_usuario = a.id_usuario AND a.estado_administrador = TRUE
        LEFT JOIN tb_inscripciones_actividad ia ON u.id_usuario = ia.id_usuario AND ia.estado_inscripcion = 'confirmada'
        WHERE (
            CASE p_tipo_busqueda
                WHEN 'nombre' THEN 
                    LOWER(u.nombre_usuario) LIKE '%' || v_criterio_lower || '%' OR
                    LOWER(u.apellido_usuario) LIKE '%' || v_criterio_lower || '%'
                WHEN 'email' THEN 
                    LOWER(u.email_usuario) LIKE '%' || v_criterio_lower || '%'
                WHEN 'colegio' THEN 
                    LOWER(u.colegio_usuario) LIKE '%' || v_criterio_lower || '%'
                ELSE -- 'general'
                    LOWER(u.nombre_usuario) LIKE '%' || v_criterio_lower || '%' OR
                    LOWER(u.apellido_usuario) LIKE '%' || v_criterio_lower || '%' OR
                    LOWER(u.email_usuario) LIKE '%' || v_criterio_lower || '%' OR
                    LOWER(u.colegio_usuario) LIKE '%' || v_criterio_lower || '%'
            END
        )
        AND (p_tipo_usuario IS NULL OR u.id_tipo_usuario = p_tipo_usuario)
        AND (p_estado_usuario IS NULL OR u.estado_usuario = p_estado_usuario)
        AND (NOT p_solo_administradores OR a.id_usuario IS NOT NULL)
        AND (NOT p_solo_con_actividades OR ia.id_usuario IS NOT NULL)
        AND (p_fecha_desde IS NULL OR u.fecha_inscripcion_usuario::DATE >= p_fecha_desde)
        AND (p_fecha_hasta IS NULL OR u.fecha_inscripcion_usuario::DATE <= p_fecha_hasta)
        ORDER BY 
            CASE 
                WHEN LOWER(u.nombre_usuario) LIKE '%' || v_criterio_lower || '%' THEN 1
                WHEN LOWER(u.apellido_usuario) LIKE '%' || v_criterio_lower || '%' THEN 2
                WHEN LOWER(u.email_usuario) LIKE '%' || v_criterio_lower || '%' THEN 3
                ELSE 4
            END,
            u.fecha_inscripcion_usuario DESC
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
        
        -- Determinar en qué campo se encontró la coincidencia
        v_coincidencia_en := CASE 
            WHEN LOWER(v_usuario.nombre_usuario) LIKE '%' || v_criterio_lower || '%' THEN 'nombre'
            WHEN LOWER(v_usuario.apellido_usuario) LIKE '%' || v_criterio_lower || '%' THEN 'apellido'
            WHEN LOWER(v_usuario.email_usuario) LIKE '%' || v_criterio_lower || '%' THEN 'email'
            WHEN LOWER(v_usuario.colegio_usuario) LIKE '%' || v_criterio_lower || '%' THEN 'colegio'
            ELSE 'general'
        END;
        
        -- Retornar el registro
        success := TRUE;
        message := 'Búsqueda exitosa';
        total_resultados := v_total_resultados;
        id_usuario := v_usuario.id_usuario;
        nombre_completo := v_usuario.nombre_usuario || ' ' || v_usuario.apellido_usuario;
        email_usuario := v_usuario.email_usuario;
        telefono_usuario := v_usuario.telefono_usuario;
        colegio_usuario := v_usuario.colegio_usuario;
        tipo_usuario := v_usuario.nombre_tipo_usuario;
        estado_usuario := v_usuario.estado_usuario;
        email_verificado := v_usuario.email_verificado_usuario;
        fecha_inscripcion := v_usuario.fecha_inscripcion_usuario;
        ultimo_acceso := v_usuario.ultimo_acceso_usuario;
        total_actividades := v_actividades_count;
        total_asistencias := v_asistencias_count;
        es_administrador := v_es_admin;
        roles_administrador := v_roles_admin;
        coincidencia_en := v_coincidencia_en;
        
        RETURN NEXT;
    END LOOP;
        
EXCEPTION
    WHEN OTHERS THEN
        -- En caso de error, retornar información del error
        success := FALSE;
        message := 'Error en la búsqueda: ' || SQLERRM;
        total_resultados := 0;
        id_usuario := NULL;
        nombre_completo := NULL;
        email_usuario := NULL;
        telefono_usuario := NULL;
        colegio_usuario := NULL;
        tipo_usuario := NULL;
        estado_usuario := NULL;
        email_verificado := NULL;
        fecha_inscripcion := NULL;
        ultimo_acceso := NULL;
        total_actividades := NULL;
        total_asistencias := NULL;
        es_administrador := NULL;
        roles_administrador := NULL;
        coincidencia_en := NULL;
        RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Comentarios sobre el procedimiento
COMMENT ON FUNCTION sp_buscar_usuarios(VARCHAR, VARCHAR, INTEGER, BOOLEAN, BOOLEAN, BOOLEAN, DATE, DATE, INTEGER, INTEGER) IS 
'Busca usuarios con criterios específicos y avanzados, incluyendo filtros por tipo, estado, fechas y roles.';

-- Ejemplos de uso:
-- SELECT * FROM sp_buscar_usuarios('juan', 'general'); -- Búsqueda general
-- SELECT * FROM sp_buscar_usuarios('gmail.com', 'email', NULL, TRUE); -- Buscar emails con gmail
-- SELECT * FROM sp_buscar_usuarios('San José', 'colegio', 1, TRUE, FALSE, TRUE); -- Buscar en colegios
-- SELECT * FROM sp_buscar_usuarios('admin', 'general', NULL, NULL, TRUE); -- Solo administradores
