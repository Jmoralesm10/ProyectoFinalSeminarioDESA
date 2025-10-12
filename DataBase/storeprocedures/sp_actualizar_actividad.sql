-- =====================================================
-- Procedimiento Almacenado: sp_actualizar_actividad
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Procedimiento para actualizar una actividad existente
CREATE OR REPLACE FUNCTION sp_actualizar_actividad(
    p_id_actividad INTEGER,                     -- ID de la actividad a actualizar
    p_id_categoria INTEGER DEFAULT NULL,        -- Nueva categoría
    p_nombre_actividad VARCHAR(200) DEFAULT NULL, -- Nuevo nombre
    p_descripcion_actividad TEXT DEFAULT NULL,  -- Nueva descripción
    p_tipo_actividad VARCHAR(50) DEFAULT NULL,  -- Nuevo tipo
    p_fecha_inicio_actividad TIMESTAMP DEFAULT NULL, -- Nueva fecha de inicio
    p_fecha_fin_actividad TIMESTAMP DEFAULT NULL, -- Nueva fecha de fin
    p_fecha_limite_inscripcion TIMESTAMP DEFAULT NULL, -- Nueva fecha límite
    p_duracion_estimada_minutos INTEGER DEFAULT NULL, -- Nueva duración
    p_cupo_maximo_actividad INTEGER DEFAULT NULL, -- Nuevo cupo máximo
    p_lugar_actividad VARCHAR(200) DEFAULT NULL, -- Nuevo lugar
    p_ponente_actividad VARCHAR(200) DEFAULT NULL, -- Nuevo ponente
    p_requisitos_actividad TEXT DEFAULT NULL,   -- Nuevos requisitos
    p_nivel_requerido VARCHAR(20) DEFAULT NULL, -- Nuevo nivel
    p_edad_minima INTEGER DEFAULT NULL,         -- Nueva edad mínima
    p_edad_maxima INTEGER DEFAULT NULL,         -- Nueva edad máxima
    p_materiales_requeridos TEXT DEFAULT NULL,  -- Nuevos materiales
    p_costo_actividad DECIMAL(10,2) DEFAULT NULL, -- Nuevo costo
    p_moneda_costo VARCHAR(3) DEFAULT NULL,     -- Nueva moneda
    p_permite_inscripciones BOOLEAN DEFAULT NULL, -- Nuevo estado de inscripciones
    p_requiere_aprobacion BOOLEAN DEFAULT NULL, -- Nuevo estado de aprobación
    p_estado_actividad BOOLEAN DEFAULT NULL     -- Nuevo estado
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    id_actividad INTEGER,
    nombre_actividad VARCHAR(200)
) AS $$
DECLARE
    v_actividad_existe BOOLEAN;
    v_cambios JSONB;
BEGIN
    -- Inicializar variables de respuesta
    success := FALSE;
    message := '';
    id_actividad := NULL;
    nombre_actividad := '';
    v_cambios := '{}'::jsonb;
    
    -- Validar parámetros
    IF p_id_actividad IS NULL THEN
        message := 'ID de actividad es obligatorio';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Verificar que la actividad existe
    SELECT EXISTS(
        SELECT 1 FROM tb_actividades WHERE id_actividad = p_id_actividad
    ) INTO v_actividad_existe;
    
    IF NOT v_actividad_existe THEN
        message := 'Actividad no encontrada';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Validar tipo de actividad si se proporciona
    IF p_tipo_actividad IS NOT NULL AND p_tipo_actividad NOT IN ('taller', 'competencia') THEN
        message := 'Tipo de actividad debe ser "taller" o "competencia"';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Validar fechas si se proporcionan
    IF p_fecha_inicio_actividad IS NOT NULL AND p_fecha_fin_actividad IS NOT NULL THEN
        IF p_fecha_fin_actividad <= p_fecha_inicio_actividad THEN
            message := 'La fecha de fin debe ser posterior a la fecha de inicio';
            RETURN NEXT;
            RETURN;
        END IF;
    END IF;
    
    -- Validar cupo máximo si se proporciona
    IF p_cupo_maximo_actividad IS NOT NULL AND p_cupo_maximo_actividad <= 0 THEN
        message := 'Cupo máximo debe ser mayor a 0';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Validar categoría si se proporciona
    IF p_id_categoria IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM tb_categorias_actividad WHERE id_categoria = p_id_categoria AND estado_categoria = TRUE) THEN
            message := 'Categoría no encontrada o inactiva';
            RETURN NEXT;
            RETURN;
        END IF;
    END IF;
    
    -- Validar nivel requerido si se proporciona
    IF p_nivel_requerido IS NOT NULL AND p_nivel_requerido NOT IN ('basico', 'intermedio', 'avanzado') THEN
        message := 'Nivel requerido debe ser "basico", "intermedio" o "avanzado"';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Validar edades si se proporcionan
    IF p_edad_minima IS NOT NULL AND p_edad_maxima IS NOT NULL AND p_edad_maxima < p_edad_minima THEN
        message := 'La edad máxima debe ser mayor o igual a la edad mínima';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Actualizar la actividad
    UPDATE tb_actividades 
    SET 
        id_categoria = COALESCE(p_id_categoria, id_categoria),
        nombre_actividad = COALESCE(TRIM(p_nombre_actividad), nombre_actividad),
        descripcion_actividad = COALESCE(p_descripcion_actividad, descripcion_actividad),
        tipo_actividad = COALESCE(p_tipo_actividad, tipo_actividad),
        fecha_inicio_actividad = COALESCE(p_fecha_inicio_actividad, fecha_inicio_actividad),
        fecha_fin_actividad = COALESCE(p_fecha_fin_actividad, fecha_fin_actividad),
        fecha_limite_inscripcion = COALESCE(p_fecha_limite_inscripcion, fecha_limite_inscripcion),
        duracion_estimada_minutos = COALESCE(p_duracion_estimada_minutos, duracion_estimada_minutos),
        cupo_maximo_actividad = COALESCE(p_cupo_maximo_actividad, cupo_maximo_actividad),
        lugar_actividad = COALESCE(p_lugar_actividad, lugar_actividad),
        ponente_actividad = COALESCE(p_ponente_actividad, ponente_actividad),
        requisitos_actividad = COALESCE(p_requisitos_actividad, requisitos_actividad),
        nivel_requerido = COALESCE(p_nivel_requerido, nivel_requerido),
        edad_minima = COALESCE(p_edad_minima, edad_minima),
        edad_maxima = COALESCE(p_edad_maxima, edad_maxima),
        materiales_requeridos = COALESCE(p_materiales_requeridos, materiales_requeridos),
        costo_actividad = COALESCE(p_costo_actividad, costo_actividad),
        moneda_costo = COALESCE(p_moneda_costo, moneda_costo),
        permite_inscripciones = COALESCE(p_permite_inscripciones, permite_inscripciones),
        requiere_aprobacion = COALESCE(p_requiere_aprobacion, requiere_aprobacion),
        estado_actividad = COALESCE(p_estado_actividad, estado_actividad),
        fecha_actualizacion_actividad = CURRENT_TIMESTAMP
    WHERE id_actividad = p_id_actividad;
    
    -- Verificar que la actualización fue exitosa
    IF FOUND THEN
        -- Obtener el nombre actualizado de la actividad
        SELECT nombre_actividad INTO nombre_actividad
        FROM tb_actividades 
        WHERE id_actividad = p_id_actividad;
        
        success := TRUE;
        message := 'Actividad actualizada exitosamente';
        id_actividad := p_id_actividad;
        
        -- Registrar cambios en logs
        IF p_id_categoria IS NOT NULL THEN
            v_cambios := v_cambios || jsonb_build_object('categoria', p_id_categoria);
        END IF;
        IF p_nombre_actividad IS NOT NULL THEN
            v_cambios := v_cambios || jsonb_build_object('nombre', p_nombre_actividad);
        END IF;
        IF p_tipo_actividad IS NOT NULL THEN
            v_cambios := v_cambios || jsonb_build_object('tipo', p_tipo_actividad);
        END IF;
        IF p_cupo_maximo_actividad IS NOT NULL THEN
            v_cambios := v_cambios || jsonb_build_object('cupo_maximo', p_cupo_maximo_actividad);
        END IF;
        IF p_estado_actividad IS NOT NULL THEN
            v_cambios := v_cambios || jsonb_build_object('estado', p_estado_actividad);
        END IF;
        
        INSERT INTO tb_logs_sistema (
            accion_log,
            tabla_afectada_log,
            registro_id_log,
            detalles_log
        ) VALUES (
            'ACTUALIZACION_ACTIVIDAD',
            'tb_actividades',
            p_id_actividad::text,
            jsonb_build_object(
                'actividad_id', p_id_actividad,
                'cambios', v_cambios
            )
        );
    ELSE
        message := 'Error al actualizar la actividad';
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
COMMENT ON FUNCTION sp_actualizar_actividad(INTEGER, INTEGER, VARCHAR, TEXT, VARCHAR, TIMESTAMP, TIMESTAMP, TIMESTAMP, INTEGER, INTEGER, VARCHAR, VARCHAR, TEXT, VARCHAR, INTEGER, INTEGER, TEXT, DECIMAL, VARCHAR, BOOLEAN, BOOLEAN, BOOLEAN) IS 
'Procedimiento para actualizar una actividad existente con validaciones.';

-- Ejemplo de uso:
/*
SELECT * FROM sp_actualizar_actividad(
    1, -- id_actividad
    NULL, -- id_categoria (no cambiar)
    'Taller de Python Avanzado - Actualizado', -- nombre_actividad
    NULL, -- descripcion_actividad (no cambiar)
    NULL, -- tipo_actividad (no cambiar)
    NULL, -- fecha_inicio_actividad (no cambiar)
    NULL, -- fecha_fin_actividad (no cambiar)
    NULL, -- fecha_limite_inscripcion (no cambiar)
    NULL, -- duracion_estimada_minutos (no cambiar)
    30, -- cupo_maximo_actividad (cambiar a 30)
    NULL, -- lugar_actividad (no cambiar)
    NULL, -- ponente_actividad (no cambiar)
    NULL, -- requisitos_actividad (no cambiar)
    NULL, -- nivel_requerido (no cambiar)
    NULL, -- edad_minima (no cambiar)
    NULL, -- edad_maxima (no cambiar)
    NULL, -- materiales_requeridos (no cambiar)
    NULL, -- costo_actividad (no cambiar)
    NULL, -- moneda_costo (no cambiar)
    NULL, -- permite_inscripciones (no cambiar)
    NULL, -- requiere_aprobacion (no cambiar)
    NULL -- estado_actividad (no cambiar)
);
*/
