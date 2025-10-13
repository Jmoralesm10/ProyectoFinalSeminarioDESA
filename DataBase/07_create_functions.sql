-- =====================================================
-- Script de creación de funciones personalizadas
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Función para obtener estadísticas de un usuario específico
CREATE OR REPLACE FUNCTION obtener_estadisticas_usuario(p_usuario_id UUID)
RETURNS TABLE (
    total_inscripciones BIGINT,
    total_asistencias_general BIGINT,
    total_asistencias_actividades BIGINT,
    total_diplomas BIGINT,
    actividades_inscritas TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM tb_inscripciones_actividad WHERE id_usuario = p_usuario_id AND estado_inscripcion = 'confirmada') as total_inscripciones,
        (SELECT COUNT(*) FROM tb_asistencia_general WHERE id_usuario = p_usuario_id) as total_asistencias_general,
        (SELECT COUNT(*) FROM tb_asistencia_actividad WHERE id_usuario = p_usuario_id) as total_asistencias_actividades,
        (SELECT COUNT(*) FROM tb_diplomas WHERE id_usuario = p_usuario_id) as total_diplomas,
        ARRAY(
            SELECT a.nombre_actividad 
            FROM tb_inscripciones_actividad ia 
            JOIN tb_actividades a ON ia.id_actividad = a.id_actividad 
            WHERE ia.id_usuario = p_usuario_id AND ia.estado_inscripcion = 'confirmada'
        ) as actividades_inscritas;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar si un usuario puede inscribirse a una actividad
CREATE OR REPLACE FUNCTION verificar_disponibilidad_inscripcion(
    p_usuario_id UUID,
    p_actividad_id INTEGER
)
RETURNS TABLE (
    puede_inscribirse BOOLEAN,
    motivo TEXT
) AS $$
DECLARE
    v_cupo_maximo INTEGER;
    v_inscripciones_confirmadas INTEGER;
    v_actividad_activa BOOLEAN;
    v_permite_inscripciones BOOLEAN;
    v_ya_inscrito BOOLEAN;
    v_usuario_activo BOOLEAN;
BEGIN
    -- Verificar si el usuario está activo
    SELECT estado_usuario INTO v_usuario_activo FROM tb_usuarios WHERE id_usuario = p_usuario_id;
    IF NOT v_usuario_activo THEN
        RETURN QUERY SELECT FALSE, 'Usuario inactivo'::TEXT;
        RETURN;
    END IF;
    
    -- Verificar si la actividad está activa y permite inscripciones
    SELECT estado_actividad, permite_inscripciones, cupo_maximo_actividad
    INTO v_actividad_activa, v_permite_inscripciones, v_cupo_maximo
    FROM tb_actividades WHERE id_actividad = p_actividad_id;
    
    IF NOT v_actividad_activa THEN
        RETURN QUERY SELECT FALSE, 'Actividad no disponible'::TEXT;
        RETURN;
    END IF;
    
    IF NOT v_permite_inscripciones THEN
        RETURN QUERY SELECT FALSE, 'Las inscripciones no están permitidas para esta actividad'::TEXT;
        RETURN;
    END IF;
    
    -- Verificar si ya está inscrito
    SELECT EXISTS(
        SELECT 1 FROM tb_inscripciones_actividad 
        WHERE id_usuario = p_usuario_id AND id_actividad = p_actividad_id
    ) INTO v_ya_inscrito;
    
    IF v_ya_inscrito THEN
        RETURN QUERY SELECT FALSE, 'Ya está inscrito en esta actividad'::TEXT;
        RETURN;
    END IF;
    
    -- Verificar cupo disponible
    SELECT COUNT(*) INTO v_inscripciones_confirmadas
    FROM tb_inscripciones_actividad 
    WHERE id_actividad = p_actividad_id AND estado_inscripcion = 'confirmada';
    
    IF v_inscripciones_confirmadas >= v_cupo_maximo THEN
        RETURN QUERY SELECT FALSE, 'No hay cupo disponible'::TEXT;
        RETURN;
    END IF;
    
    RETURN QUERY SELECT TRUE, 'Disponible para inscripción'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Función para generar reporte de asistencia por fecha
CREATE OR REPLACE FUNCTION generar_reporte_asistencia_fecha(
    p_fecha_inicio DATE,
    p_fecha_fin DATE
)
RETURNS TABLE (
    fecha DATE,
    total_asistencia_general BIGINT,
    total_asistencia_actividades BIGINT,
    actividades_con_asistencia TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH fechas_completas AS (
        SELECT DISTINCT fecha_asistencia::DATE as fecha
        FROM tb_asistencia_general
        WHERE fecha_asistencia::DATE BETWEEN p_fecha_inicio AND p_fecha_fin
        
        UNION
        
        SELECT DISTINCT fecha_asistencia::DATE as fecha
        FROM tb_asistencia_actividad
        WHERE fecha_asistencia::DATE BETWEEN p_fecha_inicio AND p_fecha_fin
    )
    SELECT 
        fc.fecha,
        COALESCE(ag.total, 0) as total_asistencia_general,
        COALESCE(aa.total, 0) as total_asistencia_actividades,
        COALESCE(aa.actividades, ARRAY[]::TEXT[]) as actividades_con_asistencia
    FROM fechas_completas fc
    LEFT JOIN (
        SELECT 
            fecha_asistencia::DATE as fecha,
            COUNT(*) as total
        FROM tb_asistencia_general
        WHERE fecha_asistencia::DATE BETWEEN p_fecha_inicio AND p_fecha_fin
        GROUP BY fecha_asistencia::DATE
    ) ag ON fc.fecha = ag.fecha
    LEFT JOIN (
        SELECT 
            fecha_asistencia::DATE as fecha,
            COUNT(*) as total,
            ARRAY_AGG(DISTINCT a.nombre_actividad) as actividades
        FROM tb_asistencia_actividad aa
        JOIN tb_actividades a ON aa.id_actividad = a.id_actividad
        WHERE fecha_asistencia::DATE BETWEEN p_fecha_inicio AND p_fecha_fin
        GROUP BY fecha_asistencia::DATE
    ) aa ON fc.fecha = aa.fecha
    ORDER BY fc.fecha;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener ganadores de competencias
CREATE OR REPLACE FUNCTION obtener_ganadores_competencia(p_actividad_id INTEGER)
RETURNS TABLE (
    posicion INTEGER,
    nombre_completo TEXT,
    email VARCHAR(255),
    puntuacion DECIMAL(10,2),
    descripcion_proyecto TEXT,
    foto_proyecto_path VARCHAR(500)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rc.posicion,
        u.nombre_usuario || ' ' || u.apellido_usuario as nombre_completo,
        u.email_usuario,
        rc.puntuacion,
        rc.descripcion_proyecto,
        rc.foto_proyecto_path
    FROM tb_resultados_competencia rc
    JOIN tb_usuarios u ON rc.id_usuario = u.id_usuario
    WHERE rc.id_actividad = p_actividad_id
    ORDER BY rc.posicion;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular porcentaje de asistencia de un usuario
CREATE OR REPLACE FUNCTION calcular_porcentaje_asistencia_usuario(p_usuario_id UUID)
RETURNS TABLE (
    total_inscripciones BIGINT,
    total_asistencias_actividades BIGINT,
    porcentaje_asistencia DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM tb_inscripciones_actividad WHERE id_usuario = p_usuario_id AND estado_inscripcion = 'confirmada') as total_inscripciones,
        (SELECT COUNT(*) FROM tb_asistencia_actividad WHERE id_usuario = p_usuario_id) as total_asistencias_actividades,
        CASE 
            WHEN (SELECT COUNT(*) FROM tb_inscripciones_actividad WHERE id_usuario = p_usuario_id AND estado_inscripcion = 'confirmada') > 0 
            THEN ROUND(
                (SELECT COUNT(*) FROM tb_asistencia_actividad WHERE id_usuario = p_usuario_id)::decimal / 
                (SELECT COUNT(*) FROM tb_inscripciones_actividad WHERE id_usuario = p_usuario_id AND estado_inscripcion = 'confirmada')::decimal * 100, 2
            )
            ELSE 0
        END as porcentaje_asistencia;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener actividades más populares
CREATE OR REPLACE FUNCTION obtener_actividades_populares(p_limite INTEGER DEFAULT 10)
RETURNS TABLE (
    actividad_id INTEGER,
    nombre_actividad VARCHAR(200),
    tipo_actividad VARCHAR(50),
    total_inscripciones BIGINT,
    total_asistencias BIGINT,
    porcentaje_asistencia DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id_actividad as actividad_id,
        a.nombre_actividad,
        a.tipo_actividad,
        COUNT(ia.id_usuario) as total_inscripciones,
        COUNT(aa.id_usuario) as total_asistencias,
        CASE 
            WHEN COUNT(ia.id_usuario) > 0 
            THEN ROUND(COUNT(aa.id_usuario)::decimal / COUNT(ia.id_usuario)::decimal * 100, 2)
            ELSE 0
        END as porcentaje_asistencia
    FROM tb_actividades a
    LEFT JOIN tb_inscripciones_actividad ia ON a.id_actividad = ia.id_actividad AND ia.estado_inscripcion = 'confirmada'
    LEFT JOIN tb_asistencia_actividad aa ON a.id_actividad = aa.id_actividad
    WHERE a.estado_actividad = true
    GROUP BY a.id_actividad, a.nombre_actividad, a.tipo_actividad
    ORDER BY total_inscripciones DESC, porcentaje_asistencia DESC
    LIMIT p_limite;
END;
$$ LANGUAGE plpgsql;

-- Función para validar y limpiar datos de usuario
CREATE OR REPLACE FUNCTION validar_datos_usuario(
    p_nombre VARCHAR(100),
    p_apellido VARCHAR(100),
    p_email VARCHAR(255),
    p_telefono VARCHAR(20) DEFAULT NULL,
    p_colegio VARCHAR(200) DEFAULT NULL
)
RETURNS TABLE (
    es_valido BOOLEAN,
    mensaje TEXT
) AS $$
BEGIN
    -- Validar campos obligatorios
    IF p_nombre IS NULL OR TRIM(p_nombre) = '' THEN
        RETURN QUERY SELECT FALSE, 'El nombre es obligatorio'::TEXT;
        RETURN;
    END IF;
    
    IF p_apellido IS NULL OR TRIM(p_apellido) = '' THEN
        RETURN QUERY SELECT FALSE, 'El apellido es obligatorio'::TEXT;
        RETURN;
    END IF;
    
    IF p_email IS NULL OR TRIM(p_email) = '' THEN
        RETURN QUERY SELECT FALSE, 'El email es obligatorio'::TEXT;
        RETURN;
    END IF;
    
    -- Validar formato de email
    IF p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RETURN QUERY SELECT FALSE, 'El formato del email no es válido'::TEXT;
        RETURN;
    END IF;
    
    -- Validar que no exista el email
    IF EXISTS(SELECT 1 FROM tb_usuarios WHERE email_usuario = p_email) THEN
        RETURN QUERY SELECT FALSE, 'El email ya está registrado'::TEXT;
        RETURN;
    END IF;
    
    RETURN QUERY SELECT TRUE, 'Datos válidos'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Comentarios de las funciones
COMMENT ON FUNCTION obtener_estadisticas_usuario(UUID) IS 'Obtiene estadísticas completas de un usuario incluyendo inscripciones, asistencias y diplomas';
COMMENT ON FUNCTION verificar_disponibilidad_inscripcion(UUID, INTEGER) IS 'Verifica si un usuario puede inscribirse a una actividad con validaciones completas';
COMMENT ON FUNCTION generar_reporte_asistencia_fecha(DATE, DATE) IS 'Genera reporte de asistencia por rango de fechas separando general y por actividades';
COMMENT ON FUNCTION obtener_ganadores_competencia(INTEGER) IS 'Obtiene los ganadores de una competencia específica ordenados por posición';
COMMENT ON FUNCTION calcular_porcentaje_asistencia_usuario(UUID) IS 'Calcula el porcentaje de asistencia a actividades de un usuario';
COMMENT ON FUNCTION obtener_actividades_populares(INTEGER) IS 'Obtiene las actividades más populares del congreso con estadísticas de inscripción y asistencia';
COMMENT ON FUNCTION validar_datos_usuario(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR) IS 'Valida los datos de un usuario antes de insertar con verificaciones de formato y duplicados';
