-- =====================================================
-- Procedimiento: sp_consultar_asistencia_usuario
-- Descripción: Consulta el historial completo de asistencia de un usuario
-- Autor: Sistema de Gestión del Congreso de Tecnología
-- Fecha: 2025
-- =====================================================

CREATE OR REPLACE FUNCTION sp_consultar_asistencia_usuario(
    p_codigo_qr_usuario VARCHAR(500) DEFAULT NULL,  -- Código QR del usuario (opcional)
    p_id_usuario UUID DEFAULT NULL,                 -- ID del usuario (opcional)
    p_fecha_desde DATE DEFAULT NULL,                -- Fecha desde (opcional)
    p_fecha_hasta DATE DEFAULT NULL                 -- Fecha hasta (opcional)
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    id_usuario UUID,
    nombre_completo TEXT,
    email_usuario VARCHAR(255),
    tipo_consulta VARCHAR(20),
    fecha_asistencia DATE,
    hora_asistencia TIMESTAMP,
    id_actividad INTEGER,
    nombre_actividad VARCHAR(200),
    tipo_actividad VARCHAR(50),
    lugar_actividad VARCHAR(200)
) AS $$
DECLARE
    v_id_usuario UUID;
    v_nombre_completo TEXT;
    v_email_usuario VARCHAR(255);
    v_usuario_encontrado BOOLEAN := FALSE;
BEGIN
    -- Validar que al menos uno de los parámetros de identificación esté presente
    IF (p_codigo_qr_usuario IS NULL OR TRIM(p_codigo_qr_usuario) = '') 
       AND p_id_usuario IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'Debe proporcionar código QR o ID de usuario' as message,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::VARCHAR(255) as email_usuario,
            NULL::VARCHAR(20) as tipo_consulta,
            NULL::DATE as fecha_asistencia,
            NULL::TIMESTAMP as hora_asistencia,
            NULL::INTEGER as id_actividad,
            NULL::VARCHAR(200) as nombre_actividad,
            NULL::VARCHAR(50) as tipo_actividad,
            NULL::VARCHAR(200) as lugar_actividad;
        RETURN;
    END IF;
    
    -- Buscar el usuario
    IF p_codigo_qr_usuario IS NOT NULL AND TRIM(p_codigo_qr_usuario) != '' THEN
        -- Buscar por código QR
        SELECT u.id_usuario, 
               u.nombre_usuario || ' ' || u.apellido_usuario,
               u.email_usuario
        INTO v_id_usuario, v_nombre_completo, v_email_usuario
        FROM tb_usuarios u
        WHERE u.codigo_qr_usuario = p_codigo_qr_usuario
        AND u.estado_usuario = TRUE;
    ELSE
        -- Buscar por ID
        SELECT u.id_usuario, 
               u.nombre_usuario || ' ' || u.apellido_usuario,
               u.email_usuario
        INTO v_id_usuario, v_nombre_completo, v_email_usuario
        FROM tb_usuarios u
        WHERE u.id_usuario = p_id_usuario
        AND u.estado_usuario = TRUE;
    END IF;
    
    -- Validar que el usuario existe
    IF v_id_usuario IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'Usuario no encontrado o inactivo' as message,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::VARCHAR(255) as email_usuario,
            NULL::VARCHAR(20) as tipo_consulta,
            NULL::DATE as fecha_asistencia,
            NULL::TIMESTAMP as hora_asistencia,
            NULL::INTEGER as id_actividad,
            NULL::VARCHAR(200) as nombre_actividad,
            NULL::VARCHAR(50) as tipo_actividad,
            NULL::VARCHAR(200) as lugar_actividad;
        RETURN;
    END IF;
    
    -- Retornar asistencia general
    RETURN QUERY
    SELECT 
        TRUE as success,
        'Consulta exitosa' as message,
        v_id_usuario as id_usuario,
        v_nombre_completo as nombre_completo,
        v_email_usuario as email_usuario,
        'general'::VARCHAR(20) as tipo_consulta,
        ag.fecha_asistencia as fecha_asistencia,
        ag.hora_ingreso as hora_asistencia,
        NULL::INTEGER as id_actividad,
        'Asistencia General al Congreso'::VARCHAR(200) as nombre_actividad,
        'congreso'::VARCHAR(50) as tipo_actividad,
        'Facultad de Ingeniería'::VARCHAR(200) as lugar_actividad
    FROM tb_asistencia_general ag
    WHERE ag.id_usuario = v_id_usuario
    AND (p_fecha_desde IS NULL OR ag.fecha_asistencia >= p_fecha_desde)
    AND (p_fecha_hasta IS NULL OR ag.fecha_asistencia <= p_fecha_hasta)
    
    UNION ALL
    
    -- Retornar asistencia a actividades
    SELECT 
        TRUE as success,
        'Consulta exitosa' as message,
        v_id_usuario as id_usuario,
        v_nombre_completo as nombre_completo,
        v_email_usuario as email_usuario,
        'actividad'::VARCHAR(20) as tipo_consulta,
        DATE(aa.fecha_asistencia) as fecha_asistencia,
        aa.fecha_asistencia as hora_asistencia,
        aa.id_actividad as id_actividad,
        a.nombre_actividad as nombre_actividad,
        a.tipo_actividad as tipo_actividad,
        a.lugar_actividad as lugar_actividad
    FROM tb_asistencia_actividad aa
    JOIN tb_actividades a ON aa.id_actividad = a.id_actividad
    WHERE aa.id_usuario = v_id_usuario
    AND (p_fecha_desde IS NULL OR DATE(aa.fecha_asistencia) >= p_fecha_desde)
    AND (p_fecha_hasta IS NULL OR DATE(aa.fecha_asistencia) <= p_fecha_hasta)
    
    ORDER BY fecha_asistencia DESC, hora_asistencia DESC;
        
EXCEPTION
    WHEN OTHERS THEN
        -- En caso de error, retornar información del error
        RETURN QUERY SELECT 
            FALSE as success,
            'Error al consultar asistencia: ' || SQLERRM as message,
            NULL::UUID as id_usuario,
            NULL::TEXT as nombre_completo,
            NULL::VARCHAR(255) as email_usuario,
            NULL::VARCHAR(20) as tipo_consulta,
            NULL::DATE as fecha_asistencia,
            NULL::TIMESTAMP as hora_asistencia,
            NULL::INTEGER as id_actividad,
            NULL::VARCHAR(200) as nombre_actividad,
            NULL::VARCHAR(50) as tipo_actividad,
            NULL::VARCHAR(200) as lugar_actividad;
END;
$$ LANGUAGE plpgsql;

-- Comentarios sobre el procedimiento
COMMENT ON FUNCTION sp_consultar_asistencia_usuario(VARCHAR, UUID, DATE, DATE) IS 
'Consulta el historial completo de asistencia de un usuario, incluyendo asistencia general y por actividades. 
Permite filtrar por fechas y buscar por código QR o ID de usuario.';

-- Ejemplos de uso:
-- SELECT * FROM sp_consultar_asistencia_usuario('QR123456789');
-- SELECT * FROM sp_consultar_asistencia_usuario(NULL, 'uuid-del-usuario');
-- SELECT * FROM sp_consultar_asistencia_usuario('QR123456789', NULL, '2025-11-12', '2025-11-13');
