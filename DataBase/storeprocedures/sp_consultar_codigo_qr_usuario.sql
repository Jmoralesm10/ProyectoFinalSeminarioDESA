-- =====================================================
-- Procedimiento Almacenado: sp_consultar_codigo_qr_usuario
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Procedimiento para consultar el código QR de un usuario por su ID
CREATE OR REPLACE FUNCTION sp_consultar_codigo_qr_usuario(
    p_id_usuario UUID                      -- ID del usuario
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    id_usuario UUID,
    codigo_qr_usuario VARCHAR(500),
    nombre_usuario VARCHAR(100),
    apellido_usuario VARCHAR(100),
    email_usuario VARCHAR(255)
) AS $$
DECLARE
    v_usuario RECORD;
BEGIN
    -- Inicializar variables de respuesta
    success := FALSE;
    message := '';
    id_usuario := NULL;
    codigo_qr_usuario := '';
    nombre_usuario := '';
    apellido_usuario := '';
    email_usuario := '';
    
    -- Validar parámetros
    IF p_id_usuario IS NULL THEN
        message := 'ID de usuario es obligatorio';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Consultar el usuario
    SELECT 
        u.id_usuario,
        u.codigo_qr_usuario,
        u.nombre_usuario,
        u.apellido_usuario,
        u.email_usuario
    INTO v_usuario
    FROM tb_usuarios u
    WHERE u.id_usuario = p_id_usuario;
    
    -- Verificar si el usuario fue encontrado
    IF v_usuario.id_usuario IS NOT NULL THEN
        success := TRUE;
        message := 'Código QR obtenido exitosamente';
        id_usuario := v_usuario.id_usuario;
        codigo_qr_usuario := v_usuario.codigo_qr_usuario;
        nombre_usuario := v_usuario.nombre_usuario;
        apellido_usuario := v_usuario.apellido_usuario;
        email_usuario := v_usuario.email_usuario;
    ELSE
        message := 'Usuario no encontrado';
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
COMMENT ON FUNCTION sp_consultar_codigo_qr_usuario(UUID) IS 
'Procedimiento para consultar el código QR de un usuario por su ID.';

-- Ejemplo de uso:
/*
SELECT * FROM sp_consultar_codigo_qr_usuario('550e8400-e29b-41d4-a716-446655440000');
*/
