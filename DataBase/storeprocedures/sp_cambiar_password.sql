-- =====================================================
-- Procedimiento Almacenado: sp_cambiar_password
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Procedimiento para cambiar contraseña del usuario autenticado
CREATE OR REPLACE FUNCTION sp_cambiar_password(
    p_id_usuario UUID,                    -- ID del usuario
    p_password_actual VARCHAR(255),       -- Contraseña actual
    p_nueva_password VARCHAR(255)         -- Nueva contraseña
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    id_usuario UUID,
    email_usuario VARCHAR(255)
) AS $$
DECLARE
    v_usuario RECORD;
BEGIN
    -- Inicializar variables de respuesta
    success := FALSE;
    message := '';
    id_usuario := NULL;
    email_usuario := '';
    
    -- Validar parámetros
    IF p_id_usuario IS NULL THEN
        message := 'ID de usuario requerido';
        RETURN NEXT;
        RETURN;
    END IF;
    
    IF p_password_actual IS NULL OR TRIM(p_password_actual) = '' THEN
        message := 'Contraseña actual requerida';
        RETURN NEXT;
        RETURN;
    END IF;
    
    IF p_nueva_password IS NULL OR TRIM(p_nueva_password) = '' THEN
        message := 'Nueva contraseña requerida';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Validar que la nueva contraseña sea diferente a la actual
    IF p_password_actual = p_nueva_password THEN
        message := 'La nueva contraseña debe ser diferente a la actual';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Validar fortaleza de la nueva contraseña
    IF LENGTH(p_nueva_password) < 8 THEN
        message := 'La nueva contraseña debe tener al menos 8 caracteres';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Buscar el usuario
    SELECT 
        u.id_usuario,
        u.email_usuario,
        u.password_hash_usuario,
        u.estado_usuario
    INTO v_usuario
    FROM tb_usuarios u
    WHERE u.id_usuario = p_id_usuario;
    
    -- Verificar si el usuario existe
    IF v_usuario.id_usuario IS NULL THEN
        message := 'Usuario no encontrado';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Verificar si el usuario está activo
    IF NOT v_usuario.estado_usuario THEN
        message := 'Usuario inactivo';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Verificar la contraseña actual
    IF NOT (v_usuario.password_hash_usuario = crypt(p_password_actual, v_usuario.password_hash_usuario)) THEN
        message := 'Contraseña actual incorrecta';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Cambiar la contraseña
    UPDATE tb_usuarios 
    SET 
        password_hash_usuario = crypt(p_nueva_password, gen_salt('bf')),
        fecha_actualizacion_usuario = CURRENT_TIMESTAMP
    WHERE id_usuario = p_id_usuario;
    
    -- Verificar que la actualización fue exitosa
    IF FOUND THEN
        success := TRUE;
        message := 'Contraseña cambiada exitosamente';
        id_usuario := v_usuario.id_usuario;
        email_usuario := v_usuario.email_usuario;
        
        -- Registrar en logs
        INSERT INTO tb_logs_sistema (
            id_usuario,
            accion_log,
            tabla_afectada_log,
            registro_id_log,
            detalles_log
        ) VALUES (
            p_id_usuario,
            'CAMBIO_PASSWORD',
            'tb_usuarios',
            p_id_usuario::text,
            jsonb_build_object(
                'email', v_usuario.email_usuario
            )
        );
    ELSE
        message := 'Error al cambiar la contraseña';
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
COMMENT ON FUNCTION sp_cambiar_password(UUID, VARCHAR, VARCHAR) IS 
'Procedimiento para cambiar contraseña del usuario autenticado.';

-- Ejemplo de uso:
/*
SELECT * FROM sp_cambiar_password(
    '550e8400-e29b-41d4-a716-446655440000',
    'password_actual',
    'nueva_password123'
);
*/
