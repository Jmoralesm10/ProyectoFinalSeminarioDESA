-- =====================================================
-- Stored Procedure: sp_actualizar_estado_pago
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

CREATE OR REPLACE FUNCTION sp_actualizar_estado_pago(
    p_id_pago UUID,
    p_estado_pago VARCHAR(20),
    p_referencia_pago VARCHAR(100) DEFAULT NULL,
    p_observaciones_pago TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    id_pago UUID,
    estado_pago VARCHAR(20),
    fecha_confirmacion TIMESTAMP
) AS $$
DECLARE
    v_pago_existe BOOLEAN;
    v_fecha_confirmacion TIMESTAMP;
BEGIN
    -- Inicializar variables de respuesta
    success := FALSE;
    message := '';
    id_pago := NULL;
    estado_pago := NULL;
    fecha_confirmacion := NULL;
    
    -- Validar parámetros
    IF p_id_pago IS NULL THEN
        message := 'ID de pago es obligatorio';
        RETURN NEXT;
        RETURN;
    END IF;
    
    IF p_estado_pago IS NULL THEN
        message := 'Estado de pago es obligatorio';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Validar estado de pago
    IF p_estado_pago NOT IN ('pendiente', 'procesando', 'completado', 'fallido', 'cancelado') THEN
        message := 'Estado de pago inválido';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Verificar que el pago existe
    SELECT EXISTS(SELECT 1 FROM tb_pagos_simulados WHERE id_pago = p_id_pago)
    INTO v_pago_existe;
    
    IF NOT v_pago_existe THEN
        message := 'Pago no encontrado';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Determinar fecha de confirmación
    IF p_estado_pago = 'completado' THEN
        v_fecha_confirmacion := CURRENT_TIMESTAMP;
    ELSE
        v_fecha_confirmacion := NULL;
    END IF;
    
    -- Actualizar el pago
    UPDATE tb_pagos_simulados 
    SET 
        estado_pago = p_estado_pago,
        referencia_pago = COALESCE(p_referencia_pago, referencia_pago),
        fecha_confirmacion = v_fecha_confirmacion,
        observaciones_pago = COALESCE(p_observaciones_pago, observaciones_pago),
        fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id_pago = p_id_pago;
    
    -- Verificar que la actualización fue exitosa
    IF FOUND THEN
        success := TRUE;
        message := 'Estado de pago actualizado exitosamente';
        id_pago := p_id_pago;
        estado_pago := p_estado_pago;
        fecha_confirmacion := v_fecha_confirmacion;
        
        -- Registrar en logs
        INSERT INTO tb_logs_sistema (
            accion_log,
            tabla_afectada_log,
            registro_id_log,
            detalles_log
        ) VALUES (
            'ACTUALIZAR_ESTADO_PAGO',
            'tb_pagos_simulados',
            p_id_pago::text,
            jsonb_build_object(
                'estado_anterior', (SELECT estado_pago FROM tb_pagos_simulados WHERE id_pago = p_id_pago),
                'estado_nuevo', p_estado_pago,
                'referencia', p_referencia_pago
            )
        );
    ELSE
        message := 'Error al actualizar el estado del pago';
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
COMMENT ON FUNCTION sp_actualizar_estado_pago(UUID, VARCHAR, VARCHAR, TEXT) IS 
'Procedimiento para actualizar el estado de un pago simulado.';
