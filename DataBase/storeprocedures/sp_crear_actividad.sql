-- =====================================================
-- Procedimiento Almacenado: sp_crear_actividad
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Procedimiento para crear una nueva actividad
CREATE OR REPLACE FUNCTION sp_crear_actividad(
    p_id_categoria INTEGER,                    -- ID de la categoría
    p_nombre_actividad VARCHAR(200),           -- Nombre de la actividad
    p_tipo_actividad VARCHAR(50),              -- 'taller' o 'competencia'
    p_fecha_inicio_actividad TIMESTAMP,        -- Fecha de inicio
    p_fecha_fin_actividad TIMESTAMP,           -- Fecha de fin
    p_cupo_maximo_actividad INTEGER,           -- Cupo máximo
    p_descripcion_actividad TEXT DEFAULT NULL, -- Descripción
    p_fecha_limite_inscripcion TIMESTAMP DEFAULT NULL, -- Límite de inscripción
    p_duracion_estimada_minutos INTEGER DEFAULT NULL, -- Duración en minutos
    p_lugar_actividad VARCHAR(200) DEFAULT NULL, -- Lugar
    p_ponente_actividad VARCHAR(200) DEFAULT NULL, -- Ponente
    p_requisitos_actividad TEXT DEFAULT NULL,  -- Requisitos
    p_nivel_requerido VARCHAR(20) DEFAULT NULL, -- Nivel requerido
    p_edad_minima INTEGER DEFAULT 0,           -- Edad mínima
    p_edad_maxima INTEGER DEFAULT NULL,        -- Edad máxima
    p_materiales_requeridos TEXT DEFAULT NULL, -- Materiales requeridos
    p_costo_actividad DECIMAL(10,2) DEFAULT 0.00, -- Costo
    p_moneda_costo VARCHAR(3) DEFAULT 'GTQ',   -- Moneda
    p_permite_inscripciones BOOLEAN DEFAULT TRUE, -- Permite inscripciones
    p_requiere_aprobacion BOOLEAN DEFAULT FALSE -- Requiere aprobación
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    id_actividad INTEGER,
    nombre_actividad VARCHAR(200)
) AS $$
DECLARE
    v_actividad_id INTEGER;
BEGIN
    -- Inicializar variables de respuesta
    success := FALSE;
    message := '';
    id_actividad := NULL;
    nombre_actividad := '';
    
    -- Validar parámetros obligatorios
    IF p_id_categoria IS NULL THEN
        message := 'ID de categoría es obligatorio';
        RETURN NEXT;
        RETURN;
    END IF;
    
    IF p_nombre_actividad IS NULL OR TRIM(p_nombre_actividad) = '' THEN
        message := 'Nombre de actividad es obligatorio';
        RETURN NEXT;
        RETURN;
    END IF;
    
    IF p_tipo_actividad NOT IN ('taller', 'competencia') THEN
        message := 'Tipo de actividad debe ser "taller" o "competencia"';
        RETURN NEXT;
        RETURN;
    END IF;
    
    IF p_fecha_inicio_actividad IS NULL THEN
        message := 'Fecha de inicio es obligatoria';
        RETURN NEXT;
        RETURN;
    END IF;
    
    IF p_fecha_fin_actividad IS NULL THEN
        message := 'Fecha de fin es obligatoria';
        RETURN NEXT;
        RETURN;
    END IF;
    
    IF p_fecha_fin_actividad <= p_fecha_inicio_actividad THEN
        message := 'La fecha de fin debe ser posterior a la fecha de inicio';
        RETURN NEXT;
        RETURN;
    END IF;
    
    IF p_cupo_maximo_actividad IS NULL OR p_cupo_maximo_actividad <= 0 THEN
        message := 'Cupo máximo debe ser mayor a 0';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Validar que la categoría existe
    IF NOT EXISTS (SELECT 1 FROM tb_categorias_actividad WHERE id_categoria = p_id_categoria AND estado_categoria = TRUE) THEN
        message := 'Categoría no encontrada o inactiva';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Validar nivel requerido si se proporciona
    IF p_nivel_requerido IS NOT NULL AND p_nivel_requerido NOT IN ('basico', 'intermedio', 'avanzado') THEN
        message := 'Nivel requerido debe ser "basico", "intermedio" o "avanzado"';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Validar edades si se proporcionan
    IF p_edad_maxima IS NOT NULL AND p_edad_maxima < p_edad_minima THEN
        message := 'La edad máxima debe ser mayor o igual a la edad mínima';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Insertar la nueva actividad
    INSERT INTO tb_actividades (
        id_categoria,
        nombre_actividad,
        descripcion_actividad,
        tipo_actividad,
        fecha_inicio_actividad,
        fecha_fin_actividad,
        fecha_limite_inscripcion,
        duracion_estimada_minutos,
        cupo_maximo_actividad,
        lugar_actividad,
        ponente_actividad,
        requisitos_actividad,
        nivel_requerido,
        edad_minima,
        edad_maxima,
        materiales_requeridos,
        costo_actividad,
        moneda_costo,
        permite_inscripciones,
        requiere_aprobacion
    ) VALUES (
        p_id_categoria,
        TRIM(p_nombre_actividad),
        p_descripcion_actividad,
        p_tipo_actividad,
        p_fecha_inicio_actividad,
        p_fecha_fin_actividad,
        p_fecha_limite_inscripcion,
        p_duracion_estimada_minutos,
        p_cupo_maximo_actividad,
        p_lugar_actividad,
        p_ponente_actividad,
        p_requisitos_actividad,
        p_nivel_requerido,
        p_edad_minima,
        p_edad_maxima,
        p_materiales_requeridos,
        p_costo_actividad,
        p_moneda_costo,
        p_permite_inscripciones,
        p_requiere_aprobacion
    ) RETURNING id_actividad INTO v_actividad_id;
    
    -- Verificar que la inserción fue exitosa
    IF v_actividad_id IS NOT NULL THEN
        success := TRUE;
        message := 'Actividad creada exitosamente';
        id_actividad := v_actividad_id;
        nombre_actividad := TRIM(p_nombre_actividad);
        
        -- Registrar en logs
        INSERT INTO tb_logs_sistema (
            accion_log,
            tabla_afectada_log,
            registro_id_log,
            detalles_log
        ) VALUES (
            'CREACION_ACTIVIDAD',
            'tb_actividades',
            v_actividad_id::text,
            jsonb_build_object(
                'nombre', TRIM(p_nombre_actividad),
                'tipo', p_tipo_actividad,
                'categoria_id', p_id_categoria
            )
        );
    ELSE
        message := 'Error al crear la actividad';
    END IF;
    
    RETURN NEXT;
    
EXCEPTION
    WHEN OTHERS THEN
        success := FALSE;
        message := 'Error interno: ' || SQLERRM;
        RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Comentario del procedimiento
COMMENT ON FUNCTION sp_crear_actividad(INTEGER, VARCHAR, VARCHAR, TIMESTAMP, TIMESTAMP, INTEGER, TEXT, TIMESTAMP, INTEGER, VARCHAR, VARCHAR, TEXT, VARCHAR, INTEGER, INTEGER, TEXT, DECIMAL, VARCHAR, BOOLEAN, BOOLEAN) IS 
'Procedimiento para crear una nueva actividad (taller o competencia).';

-- Ejemplo de uso:
/*
SELECT * FROM sp_crear_actividad(
    1, -- id_categoria
    'Taller de Python Avanzado', -- nombre_actividad
    'taller', -- tipo_actividad
    '2025-11-12 09:00:00', -- fecha_inicio_actividad
    '2025-11-12 12:00:00', -- fecha_fin_actividad
    25, -- cupo_maximo_actividad
    'Taller para programadores con experiencia en Python', -- descripcion_actividad
    '2025-11-11 23:59:59', -- fecha_limite_inscripcion
    180, -- duracion_estimada_minutos
    'Aula 101', -- lugar_actividad
    'Dr. Ana Martínez', -- ponente_actividad
    'Conocimientos básicos de Python', -- requisitos_actividad
    'intermedio', -- nivel_requerido
    16, -- edad_minima
    25, -- edad_maxima
    'Laptop con Python instalado', -- materiales_requeridos
    0.00, -- costo_actividad
    'GTQ', -- moneda_costo
    TRUE, -- permite_inscripciones
    FALSE -- requiere_aprobacion
);
*/
