-- =====================================================
-- Stored Procedure: sp_crear_intento_pago
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

CREATE OR REPLACE FUNCTION sp_crear_intento_pago(
    p_id_pago UUID,
    p_id_usuario UUID,
    p_id_actividad INTEGER,
    p_metodo_pago VARCHAR(20),
    p_monto_original DECIMAL(10,2),
    p_moneda_original VARCHAR(3),
    p_estado_intento VARCHAR(20),
    p_codigo_error VARCHAR(50),
    p_mensaje_error TEXT,
    p_datos_entrada JSONB,
    p_respuesta_procesador JSONB,
    p_ip_cliente INET,
    p_user_agent TEXT
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    id_intento UUID,
    fecha_intento TIMESTAMP
) AS $$
DECLARE
    v_intento_id UUID;
BEGIN
    -- Inicializar variables de respuesta
    success := FALSE;
    message := '';
    id_intento := NULL;
    fecha_intento := NULL;
    
    -- Validar parámetros requeridos
    IF p_id_pago IS NULL THEN
        message := 'ID de pago es obligatorio';
        RETURN NEXT;
        RETURN;
    END IF;
    
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
    
    IF p_metodo_pago IS NULL THEN
        message := 'Método de pago es obligatorio';
        RETURN NEXT;
        RETURN;
    END IF;
    
    IF p_estado_intento IS NULL THEN
        message := 'Estado del intento es obligatorio';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Crear el registro de intento de pago
    INSERT INTO tb_intentos_pago (
        id_pago,
        id_usuario,
        id_actividad,
        metodo_pago,
        monto_original,
        moneda_original,
        estado_intento,
        codigo_error,
        mensaje_error,
        datos_entrada,
        respuesta_procesador,
        ip_cliente,
        user_agent
    ) VALUES (
        p_id_pago,
        p_id_usuario,
        p_id_actividad,
        p_metodo_pago,
        p_monto_original,
        p_moneda_original,
        p_estado_intento,
        p_codigo_error,
        p_mensaje_error,
        p_datos_entrada,
        p_respuesta_procesador,
        p_ip_cliente,
        p_user_agent
    ) RETURNING id_intento, fecha_intento INTO v_intento_id, fecha_intento;
    
    -- Verificar que la inserción fue exitosa
    IF FOUND THEN
        success := TRUE;
        message := 'Intento de pago creado exitosamente';
        id_intento := v_intento_id;
        
        -- Registrar en logs
        INSERT INTO tb_logs_sistema (
            id_usuario,
            accion_log,
            tabla_afectada_log,
            registro_id_log,
            detalles_log
        ) VALUES (
            p_id_usuario,
            'CREAR_INTENTO_PAGO',
            'tb_intentos_pago',
            v_intento_id::text,
            jsonb_build_object(
                'pago_id', p_id_pago,
                'actividad_id', p_id_actividad,
                'metodo', p_metodo_pago,
                'estado', p_estado_intento,
                'monto', p_monto_original
            )
        );
    ELSE
        message := 'Error al crear el intento de pago';
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
COMMENT ON FUNCTION sp_crear_intento_pago(UUID, UUID, INTEGER, VARCHAR, DECIMAL, VARCHAR, VARCHAR, VARCHAR, TEXT, JSONB, JSONB, INET, TEXT) IS 
'Procedimiento para crear un registro de intento de pago con todos los detalles.';
