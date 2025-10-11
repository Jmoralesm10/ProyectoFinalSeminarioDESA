-- =====================================================
-- Script de creación de funciones personalizadas
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Función para obtener estadísticas de un usuario específico
CREATE OR REPLACE FUNCTION obtener_estadisticas_usuario(p_usuario_id UUID)
RETURNS TABLE (
    total_inscripciones BIGINT,
    total_tb_asistencias BIGINT,
    total_tb_diplomas BIGINT,
    tb_actividades_inscritas TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM tb_inscripciones_actividad WHERE usuario_id = p_usuario_id AND estado = 'confirmada') as total_inscripciones,
        (SELECT COUNT(*) FROM tb_asistencia WHERE usuario_id = p_usuario_id) as total_tb_asistencias,
        (SELECT COUNT(*) FROM tb_diplomas WHERE usuario_id = p_usuario_id) as total_tb_diplomas,
        ARRAY(
            SELECT a.nombre 
            FROM tb_inscripciones_actividad ia 
            JOIN tb_actividades a ON ia.actividad_id = a.id 
            WHERE ia.usuario_id = p_usuario_id AND ia.estado = 'confirmada'
        ) as tb_actividades_inscritas;
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
    v_cupo_disponible INTEGER;
    v_actividad_activa BOOLEAN;
    v_ya_inscrito BOOLEAN;
    v_usuario_activo BOOLEAN;
BEGIN
    -- Verificar si el usuario está activo
    SELECT activo INTO v_usuario_activo FROM tb_usuarios WHERE id = p_usuario_id;
    IF NOT v_usuario_activo THEN
        RETURN QUERY SELECT FALSE, 'Usuario inactivo'::TEXT;
        RETURN;
    END IF;
    
    -- Verificar si la actividad está activa
    SELECT activo INTO v_actividad_activa FROM tb_actividades WHERE id = p_actividad_id;
    IF NOT v_actividad_activa THEN
        RETURN QUERY SELECT FALSE, 'Actividad no disponible'::TEXT;
        RETURN;
    END IF;
    
    -- Verificar si ya está inscrito
    SELECT EXISTS(
        SELECT 1 FROM tb_inscripciones_actividad 
        WHERE usuario_id = p_usuario_id AND actividad_id = p_actividad_id
    ) INTO v_ya_inscrito;
    
    IF v_ya_inscrito THEN
        RETURN QUERY SELECT FALSE, 'Ya está inscrito en esta actividad'::TEXT;
        RETURN;
    END IF;
    
    -- Verificar cupo disponible
    SELECT cupo_disponible INTO v_cupo_disponible FROM tb_actividades WHERE id = p_actividad_id;
    IF v_cupo_disponible <= 0 THEN
        RETURN QUERY SELECT FALSE, 'No hay cupo disponible'::TEXT;
        RETURN;
    END IF;
    
    RETURN QUERY SELECT TRUE, 'Disponible para inscripción'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Función para generar reporte de tb_asistencia por fecha
CREATE OR REPLACE FUNCTION generar_reporte_tb_asistencia_fecha(
    p_fecha_inicio DATE,
    p_fecha_fin DATE
)
RETURNS TABLE (
    fecha DATE,
    total_tb_asistencia_general BIGINT,
    total_tb_asistencia_tb_actividades BIGINT,
    tb_actividades_con_tb_asistencia TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ast.fecha_tb_asistencia::DATE as fecha,
        COUNT(CASE WHEN ast.tipo_tb_asistencia = 'general' THEN 1 END) as total_tb_asistencia_general,
        COUNT(CASE WHEN ast.tipo_tb_asistencia = 'actividad' THEN 1 END) as total_tb_asistencia_tb_actividades,
        ARRAY(
            SELECT DISTINCT a.nombre 
            FROM tb_asistencia ast2 
            JOIN tb_actividades a ON ast2.actividad_id = a.id 
            WHERE ast2.fecha_tb_asistencia::DATE = ast.fecha_tb_asistencia::DATE 
            AND ast2.tipo_tb_asistencia = 'actividad'
        ) as tb_actividades_con_tb_asistencia
    FROM tb_asistencia ast
    WHERE ast.fecha_tb_asistencia::DATE BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY ast.fecha_tb_asistencia::DATE
    ORDER BY ast.fecha_tb_asistencia::DATE;
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
        u.nombre || ' ' || u.apellido as nombre_completo,
        u.email,
        rc.puntuacion,
        rc.descripcion_proyecto,
        rc.foto_proyecto_path
    FROM resultados_competencia rc
    JOIN tb_usuarios u ON rc.usuario_id = u.id
    WHERE rc.actividad_id = p_actividad_id
    ORDER BY rc.posicion;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular porcentaje de tb_asistencia de un usuario
CREATE OR REPLACE FUNCTION calcular_porcentaje_tb_asistencia_usuario(p_usuario_id UUID)
RETURNS TABLE (
    total_inscripciones BIGINT,
    total_tb_asistencias BIGINT,
    porcentaje_tb_asistencia DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM tb_inscripciones_actividad WHERE usuario_id = p_usuario_id AND estado = 'confirmada') as total_inscripciones,
        (SELECT COUNT(*) FROM tb_asistencia WHERE usuario_id = p_usuario_id AND tipo_tb_asistencia = 'actividad') as total_tb_asistencias,
        CASE 
            WHEN (SELECT COUNT(*) FROM tb_inscripciones_actividad WHERE usuario_id = p_usuario_id AND estado = 'confirmada') > 0 
            THEN ROUND(
                (SELECT COUNT(*) FROM tb_asistencia WHERE usuario_id = p_usuario_id AND tipo_tb_asistencia = 'actividad')::decimal / 
                (SELECT COUNT(*) FROM tb_inscripciones_actividad WHERE usuario_id = p_usuario_id AND estado = 'confirmada')::decimal * 100, 2
            )
            ELSE 0
        END as porcentaje_tb_asistencia;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener tb_actividades más populares
CREATE OR REPLACE FUNCTION obtener_tb_actividades_populares(p_limite INTEGER DEFAULT 10)
RETURNS TABLE (
    actividad_id INTEGER,
    nombre_actividad VARCHAR(200),
    tipo_actividad VARCHAR(50),
    total_inscripciones BIGINT,
    total_tb_asistencias BIGINT,
    porcentaje_tb_asistencia DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id as actividad_id,
        a.nombre as nombre_actividad,
        a.tipo_actividad,
        COUNT(ia.id) as total_inscripciones,
        COUNT(ast.id) as total_tb_asistencias,
        CASE 
            WHEN COUNT(ia.id) > 0 
            THEN ROUND(COUNT(ast.id)::decimal / COUNT(ia.id)::decimal * 100, 2)
            ELSE 0
        END as porcentaje_tb_asistencia
    FROM tb_actividades a
    LEFT JOIN tb_inscripciones_actividad ia ON a.id = ia.actividad_id AND ia.estado = 'confirmada'
    LEFT JOIN tb_asistencia ast ON a.id = ast.actividad_id AND ast.tipo_tb_asistencia = 'actividad'
    WHERE a.activo = true
    GROUP BY a.id, a.nombre, a.tipo_actividad
    ORDER BY total_inscripciones DESC, porcentaje_tb_asistencia DESC
    LIMIT p_limite;
END;
$$ LANGUAGE plpgsql;

-- Función para validar y limpiar datos de usuario
CREATE OR REPLACE FUNCTION validar_datos_usuario(
    p_nombre VARCHAR(100),
    p_apellido VARCHAR(100),
    p_email VARCHAR(255),
    p_telefono VARCHAR(20) DEFAULT NULL,
    p_colegio VARCHAR(200) DEFAULT NULL,
    p_email_universitario VARCHAR(255) DEFAULT NULL
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
    IF EXISTS(SELECT 1 FROM tb_usuarios WHERE email = p_email) THEN
        RETURN QUERY SELECT FALSE, 'El email ya está registrado'::TEXT;
        RETURN;
    END IF;
    
    -- Validar email universitario si se proporciona
    IF p_email_universitario IS NOT NULL AND p_email_universitario !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RETURN QUERY SELECT FALSE, 'El formato del email universitario no es válido'::TEXT;
        RETURN;
    END IF;
    
    RETURN QUERY SELECT TRUE, 'Datos válidos'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Comentarios de las funciones
COMMENT ON FUNCTION obtener_estadisticas_usuario(UUID) IS 'Obtiene estadísticas completas de un usuario';
COMMENT ON FUNCTION verificar_disponibilidad_inscripcion(UUID, INTEGER) IS 'Verifica si un usuario puede inscribirse a una actividad';
COMMENT ON FUNCTION generar_reporte_tb_asistencia_fecha(DATE, DATE) IS 'Genera reporte de tb_asistencia por rango de fechas';
COMMENT ON FUNCTION obtener_ganadores_competencia(INTEGER) IS 'Obtiene los ganadores de una competencia específica';
COMMENT ON FUNCTION calcular_porcentaje_tb_asistencia_usuario(UUID) IS 'Calcula el porcentaje de tb_asistencia de un usuario';
COMMENT ON FUNCTION obtener_tb_actividades_populares(INTEGER) IS 'Obtiene las tb_actividades más populares del congreso';
COMMENT ON FUNCTION validar_datos_usuario(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR) IS 'Valida los datos de un usuario antes de insertar';
