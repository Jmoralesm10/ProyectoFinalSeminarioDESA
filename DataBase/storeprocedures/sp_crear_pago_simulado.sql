-- =====================================================
-- Stored Procedure: sp_crear_pago_simulado
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

CREATE OR REPLACE FUNCTION sp_crear_pago_simulado(
    p_id_usuario UUID,
    p_id_actividad INTEGER,
    p_monto_pago DECIMAL(10,2),
    p_moneda_pago VARCHAR(3),
    p_metodo_pago VARCHAR(20),
    p_detalles_pago JSONB,
    p_estado_pago VARCHAR(20)
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    id_pago UUID,
    fecha_pago TIMESTAMP
) AS $$
DECLARE
    v_actividad_costo DECIMAL(10,2);
    v_actividad_moneda VARCHAR(3);
    v_pago_id UUID;
BEGIN
    -- Inicializar variables de respuesta
    success := FALSE;
    message := '';
    id_pago := NULL;
    fecha_pago := NULL;
    
    -- Validar parámetros
    IF p_id_usuario IS NULL THEN
        message := 'ID de usuario es obligatorio';
        RETURN NEXT;
        RETURN;
    END IF;
    
    IF p_id_actividad IS NULL THEN
        message := 'ID de actividad es obligatorio';
        RETURN NEXT;
        RETURN;
    END IF;
    
    IF p_monto_pago IS NULL OR p_monto_pago < 0 THEN
        message := 'Monto de pago inválido';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Verificar que la actividad existe y obtener su costo
    SELECT costo_actividad, moneda_costo
    INTO v_actividad_costo, v_actividad_moneda
    FROM tb_actividades 
    WHERE id_actividad = p_id_actividad AND estado_actividad = TRUE;
    
    IF v_actividad_costo IS NULL THEN
        message := 'Actividad no encontrada o inactiva';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Verificar que el monto coincide con el costo de la actividad
    IF p_monto_pago != v_actividad_costo THEN
        message := 'El monto no coincide con el costo de la actividad';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Verificar que la moneda coincide
    IF p_moneda_pago != v_actividad_moneda THEN
        message := 'La moneda no coincide con la moneda de la actividad';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Verificar que no existe un pago completado para esta combinación
    IF EXISTS (
        SELECT 1 FROM tb_pagos_simulados 
        WHERE id_usuario = p_id_usuario 
        AND id_actividad = p_id_actividad 
        AND estado_pago = 'completado'
    ) THEN
        message := 'Ya existe un pago completado para esta actividad';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Crear el registro de pago
    INSERT INTO tb_pagos_simulados (
        id_usuario,
        id_actividad,
        monto_pago,
        moneda_pago,
        metodo_pago,
        detalles_pago,
        estado_pago
    ) VALUES (
        p_id_usuario,
        p_id_actividad,
        p_monto_pago,
        p_moneda_pago,
        p_metodo_pago,
        p_detalles_pago,
        p_estado_pago
    ) RETURNING tb_pagos_simulados.id_pago, tb_pagos_simulados.fecha_pago INTO v_pago_id, fecha_pago;
    
    -- Verificar que la inserción fue exitosa
    IF FOUND THEN
        success := TRUE;
        message := 'Pago creado exitosamente';
        id_pago := v_pago_id;
        
        -- Registrar en logs
        INSERT INTO tb_logs_sistema (
            id_usuario,
            accion_log,
            tabla_afectada_log,
            registro_id_log,
            detalles_log
        ) VALUES (
            p_id_usuario,
            'CREAR_PAGO',
            'tb_pagos_simulados',
            v_pago_id::text,
            jsonb_build_object(
                'actividad_id', p_id_actividad,
                'monto', p_monto_pago,
                'moneda', p_moneda_pago,
                'metodo', p_metodo_pago,
                'estado', p_estado_pago
            )
        );
    ELSE
        message := 'Error al crear el registro de pago';
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
COMMENT ON FUNCTION sp_crear_pago_simulado(UUID, INTEGER, DECIMAL, VARCHAR, VARCHAR, JSONB, VARCHAR) IS 
'Procedimiento para crear un registro de pago simulado con validaciones completas.';
