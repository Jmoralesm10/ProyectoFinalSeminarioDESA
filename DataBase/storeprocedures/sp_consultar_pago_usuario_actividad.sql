-- =====================================================
-- Stored Procedure: sp_consultar_pago_usuario_actividad
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

CREATE OR REPLACE FUNCTION sp_consultar_pago_usuario_actividad(
    p_id_usuario UUID,
    p_id_actividad INTEGER
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    id_pago UUID,
    estado_pago VARCHAR(20),
    monto_pago DECIMAL(10,2),
    fecha_pago TIMESTAMP
) AS $$
DECLARE
    v_pago_record RECORD;
BEGIN
    -- Inicializar variables de respuesta
    success := FALSE;
    message := '';
    id_pago := NULL;
    estado_pago := NULL;
    monto_pago := NULL;
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
    
    -- Buscar pago existente
    SELECT 
        ps.id_pago,
        ps.estado_pago,
        ps.monto_pago,
        ps.fecha_pago
    INTO v_pago_record
    FROM tb_pagos_simulados ps
    WHERE ps.id_usuario = p_id_usuario 
    AND ps.id_actividad = p_id_actividad
    AND ps.estado_pago = 'completado';
    
    IF FOUND THEN
        success := TRUE;
        message := 'Pago encontrado';
        id_pago := v_pago_record.id_pago;
        estado_pago := v_pago_record.estado_pago;
        monto_pago := v_pago_record.monto_pago;
        fecha_pago := v_pago_record.fecha_pago;
    ELSE
        success := FALSE;
        message := 'No se encontró pago completado para esta actividad';
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
COMMENT ON FUNCTION sp_consultar_pago_usuario_actividad(UUID, INTEGER) IS 
'Procedimiento para consultar si un usuario ya pagó por una actividad específica.';
