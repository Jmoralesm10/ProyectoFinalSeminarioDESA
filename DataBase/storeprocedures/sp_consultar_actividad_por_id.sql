-- =====================================================
-- Procedimiento Almacenado: sp_consultar_actividad_por_id
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Procedimiento para consultar una actividad específica por ID
CREATE OR REPLACE FUNCTION sp_consultar_actividad_por_id(
    p_id_actividad INTEGER
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
    IF p_id_actividad IS NULL THEN
        message := 'ID de actividad es obligatorio';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Consultar actividad por ID
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
            (a.cupo_maximo_actividad - COALESCE(COUNT(ia.id_usuario), 0)) as cupo_disponible,
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
        LEFT JOIN tb_inscripciones_actividad ia ON a.id_actividad = ia.id_actividad 
            AND ia.estado_inscripcion = 'confirmada'
        WHERE a.id_actividad = p_id_actividad
        GROUP BY a.id_actividad, ca.nombre_categoria
    LOOP
        success := TRUE;
        message := 'Actividad obtenida exitosamente';
        v_count := v_count + 1;
        
        RETURN NEXT;
    END LOOP;
    
    -- Si no se encontró la actividad
    IF v_count = 0 THEN
        success := FALSE;
        message := 'Actividad no encontrada';
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
COMMENT ON FUNCTION sp_consultar_actividad_por_id(INTEGER) IS 
'Procedimiento para consultar una actividad específica por su ID.';

-- Ejemplo de uso:
/*
SELECT * FROM sp_consultar_actividad_por_id(1);
*/
