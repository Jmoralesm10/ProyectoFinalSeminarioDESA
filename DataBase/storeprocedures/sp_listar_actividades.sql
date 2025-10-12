-- =====================================================
-- Procedimiento Almacenado: sp_listar_actividades
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Procedimiento para listar actividades con filtros opcionales
CREATE OR REPLACE FUNCTION sp_listar_actividades(
    p_tipo_actividad VARCHAR(50) DEFAULT NULL,     -- Filtrar por tipo
    p_id_categoria INTEGER DEFAULT NULL,           -- Filtrar por categoría
    p_solo_disponibles BOOLEAN DEFAULT TRUE,       -- Solo actividades disponibles
    p_solo_activas BOOLEAN DEFAULT TRUE,           -- Solo actividades activas
    p_limite INTEGER DEFAULT 50,                   -- Límite de resultados
    p_offset INTEGER DEFAULT 0                     -- Offset para paginación
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    id_actividad INTEGER,
    nombre_actividad VARCHAR(200),
    descripcion_actividad TEXT,
    tipo_actividad VARCHAR(50),
    fecha_inicio_actividad TIMESTAMP,
    fecha_fin_actividad TIMESTAMP,
    fecha_limite_inscripcion TIMESTAMP,
    duracion_estimada_minutos INTEGER,
    cupo_maximo_actividad INTEGER,
    cupo_disponible_actividad INTEGER,
    lugar_actividad VARCHAR(200),
    ponente_actividad VARCHAR(200),
    requisitos_actividad TEXT,
    nivel_requerido VARCHAR(20),
    edad_minima INTEGER,
    edad_maxima INTEGER,
    materiales_requeridos TEXT,
    costo_actividad DECIMAL(10,2),
    moneda_costo VARCHAR(3),
    permite_inscripciones BOOLEAN,
    requiere_aprobacion BOOLEAN,
    categoria_nombre VARCHAR(100),
    estado_actividad BOOLEAN,
    fecha_creacion_actividad TIMESTAMP
) AS $$
DECLARE
    v_count INTEGER := 0;
BEGIN
    -- Inicializar variables de respuesta
    success := FALSE;
    message := '';
    id_actividad := NULL;
    nombre_actividad := '';
    descripcion_actividad := '';
    tipo_actividad := '';
    fecha_inicio_actividad := NULL;
    fecha_fin_actividad := NULL;
    fecha_limite_inscripcion := NULL;
    duracion_estimada_minutos := NULL;
    cupo_maximo_actividad := NULL;
    cupo_disponible_actividad := NULL;
    lugar_actividad := '';
    ponente_actividad := '';
    requisitos_actividad := '';
    nivel_requerido := '';
    edad_minima := NULL;
    edad_maxima := NULL;
    materiales_requeridos := '';
    costo_actividad := NULL;
    moneda_costo := '';
    permite_inscripciones := FALSE;
    requiere_aprobacion := FALSE;
    categoria_nombre := '';
    estado_actividad := FALSE;
    fecha_creacion_actividad := NULL;
    
    -- Validar parámetros
    IF p_limite IS NULL OR p_limite <= 0 THEN
        p_limite := 50;
    END IF;
    
    IF p_offset IS NULL OR p_offset < 0 THEN
        p_offset := 0;
    END IF;
    
    -- Listar actividades con filtros (usando subconsulta para evitar COUNT en WHERE)
    FOR id_actividad, nombre_actividad, descripcion_actividad, tipo_actividad, 
        fecha_inicio_actividad, fecha_fin_actividad, fecha_limite_inscripcion,
        duracion_estimada_minutos, cupo_maximo_actividad, cupo_disponible_actividad,
        lugar_actividad, ponente_actividad, requisitos_actividad, nivel_requerido,
        edad_minima, edad_maxima, materiales_requeridos, costo_actividad,
        moneda_costo, permite_inscripciones, requiere_aprobacion, categoria_nombre,
        estado_actividad, fecha_creacion_actividad
    IN 
        SELECT 
            a.id_actividad,
            a.nombre_actividad,
            a.descripcion_actividad,
            a.tipo_actividad,
            a.fecha_inicio_actividad,
            a.fecha_fin_actividad,
            a.fecha_limite_inscripcion,
            a.duracion_estimada_minutos,
            a.cupo_maximo_actividad,
            (a.cupo_maximo_actividad - COALESCE(inscripciones_confirmadas.count, 0)) as cupo_disponible,
            a.lugar_actividad,
            a.ponente_actividad,
            a.requisitos_actividad,
            a.nivel_requerido,
            a.edad_minima,
            a.edad_maxima,
            a.materiales_requeridos,
            a.costo_actividad,
            a.moneda_costo,
            a.permite_inscripciones,
            a.requiere_aprobacion,
            ca.nombre_categoria,
            a.estado_actividad,
            a.fecha_creacion_actividad
        FROM tb_actividades a
        JOIN tb_categorias_actividad ca ON a.id_categoria = ca.id_categoria
        LEFT JOIN (
            SELECT 
                ia.id_actividad,
                COUNT(*) as count
            FROM tb_inscripciones_actividad ia
            WHERE ia.estado_inscripcion = 'confirmada'
            GROUP BY ia.id_actividad
        ) inscripciones_confirmadas ON a.id_actividad = inscripciones_confirmadas.id_actividad
        WHERE 
            (p_tipo_actividad IS NULL OR a.tipo_actividad = p_tipo_actividad)
            AND (p_id_categoria IS NULL OR a.id_categoria = p_id_categoria)
            AND (NOT p_solo_activas OR a.estado_actividad = TRUE)
            AND (NOT p_solo_disponibles OR (
                a.permite_inscripciones = TRUE 
                AND (a.fecha_limite_inscripcion IS NULL OR a.fecha_limite_inscripcion > CURRENT_TIMESTAMP)
                AND (a.cupo_maximo_actividad - COALESCE(inscripciones_confirmadas.count, 0)) > 0
            ))
        ORDER BY a.fecha_inicio_actividad ASC
        LIMIT p_limite OFFSET p_offset
    LOOP
        success := TRUE;
        message := 'Actividades obtenidas exitosamente';
        v_count := v_count + 1;
        
        RETURN NEXT;
    END LOOP;
    
    -- Si no se encontraron actividades
    IF v_count = 0 THEN
        success := FALSE;
        message := 'No se encontraron actividades con los criterios especificados';
        RETURN NEXT;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        success := FALSE;
        message := 'Error interno: ' || SQLERRM;
        RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Comentario del procedimiento
COMMENT ON FUNCTION sp_listar_actividades(VARCHAR, INTEGER, BOOLEAN, BOOLEAN, INTEGER, INTEGER) IS 
'Procedimiento para listar actividades con filtros opcionales y paginación.';

-- Ejemplo de uso:
/*
-- Listar todas las actividades disponibles
SELECT * FROM sp_listar_actividades();

-- Listar solo talleres
SELECT * FROM sp_listar_actividades('taller');

-- Listar actividades de una categoría específica
SELECT * FROM sp_listar_actividades(NULL, 1);

-- Listar todas las actividades (incluyendo no disponibles)
SELECT * FROM sp_listar_actividades(NULL, NULL, FALSE, TRUE);

-- Listar con paginación
SELECT * FROM sp_listar_actividades(NULL, NULL, TRUE, TRUE, 10, 0);
*/
