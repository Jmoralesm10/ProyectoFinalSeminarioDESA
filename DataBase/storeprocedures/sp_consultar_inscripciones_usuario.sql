-- =====================================================
-- Procedimiento Almacenado: sp_consultar_inscripciones_usuario
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Procedimiento para consultar inscripciones de un usuario
CREATE OR REPLACE FUNCTION sp_consultar_inscripciones_usuario(
    p_id_usuario UUID
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
    fecha_creacion_actividad TIMESTAMP,
    fecha_inscripcion TIMESTAMP,
    estado_inscripcion VARCHAR(20),
    observaciones_inscripcion TEXT
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
    fecha_inscripcion := NULL;
    estado_inscripcion := '';
    observaciones_inscripcion := '';
    
    -- Validar parámetros
    IF p_id_usuario IS NULL THEN
        message := 'ID de usuario es obligatorio';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Verificar que el usuario existe
    IF NOT EXISTS (SELECT 1 FROM tb_usuarios WHERE id_usuario = p_id_usuario AND estado_usuario = TRUE) THEN
        message := 'Usuario no encontrado o inactivo';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Consultar inscripciones del usuario
    FOR id_actividad, nombre_actividad, descripcion_actividad, tipo_actividad, 
        fecha_inicio_actividad, fecha_fin_actividad, fecha_limite_inscripcion,
        duracion_estimada_minutos, cupo_maximo_actividad, cupo_disponible_actividad,
        lugar_actividad, ponente_actividad, requisitos_actividad, nivel_requerido,
        edad_minima, edad_maxima, materiales_requeridos, costo_actividad,
        moneda_costo, permite_inscripciones, requiere_aprobacion, categoria_nombre,
        estado_actividad, fecha_creacion_actividad, fecha_inscripcion, estado_inscripcion,
        observaciones_inscripcion
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
            (a.cupo_maximo_actividad - COALESCE(COUNT(ia2.id_usuario), 0)) as cupo_disponible,
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
            a.fecha_creacion_actividad,
            ia.fecha_inscripcion,
            ia.estado_inscripcion,
            ia.observaciones_inscripcion
        FROM tb_inscripciones_actividad ia
        JOIN tb_actividades a ON ia.id_actividad = a.id_actividad
        JOIN tb_categorias_actividad ca ON a.id_categoria = ca.id_categoria
        LEFT JOIN tb_inscripciones_actividad ia2 ON a.id_actividad = ia2.id_actividad 
            AND ia2.estado_inscripcion = 'confirmada'
        WHERE ia.id_usuario = p_id_usuario
        GROUP BY a.id_actividad, ca.nombre_categoria, ia.fecha_inscripcion, ia.estado_inscripcion, ia.observaciones_inscripcion
        ORDER BY ia.fecha_inscripcion DESC
    LOOP
        success := TRUE;
        message := 'Inscripciones del usuario obtenidas exitosamente';
        v_count := v_count + 1;
        
        RETURN NEXT;
    END LOOP;
    
    -- Si no se encontraron inscripciones
    IF v_count = 0 THEN
        success := FALSE;
        message := 'El usuario no tiene inscripciones';
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
COMMENT ON FUNCTION sp_consultar_inscripciones_usuario(UUID) IS 
'Procedimiento para consultar todas las inscripciones de un usuario específico.';

-- Ejemplo de uso:
/*
SELECT * FROM sp_consultar_inscripciones_usuario('550e8400-e29b-41d4-a716-446655440000');
*/
