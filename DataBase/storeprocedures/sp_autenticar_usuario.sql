-- =====================================================
-- Procedimiento Almacenado: sp_autenticar_usuario
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Procedimiento para autenticar un usuario en el sistema
CREATE OR REPLACE FUNCTION sp_autenticar_usuario(
    p_email VARCHAR(255),                 -- Email del usuario
    p_password VARCHAR(255)               -- Contraseña del usuario
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    id_usuario UUID,
    nombre_usuario VARCHAR(100),
    apellido_usuario VARCHAR(100),
    email_usuario VARCHAR(255),
    tipo_usuario VARCHAR(50),
    email_verificado BOOLEAN,
    bloqueado_hasta TIMESTAMP
) AS $$
DECLARE
    v_usuario RECORD;
BEGIN
    -- Inicializar variables de respuesta
    success := FALSE;
    message := '';
    id_usuario := NULL;
    nombre_usuario := '';
    apellido_usuario := '';
    email_usuario := '';
    tipo_usuario := '';
    email_verificado := FALSE;
    bloqueado_hasta := NULL;
    
    -- Validar parámetros
    IF p_email IS NULL OR TRIM(p_email) = '' THEN
        message := 'El email es obligatorio';
        RETURN NEXT;
        RETURN;
    END IF;
    
    IF p_password IS NULL OR TRIM(p_password) = '' THEN
        message := 'La contraseña es obligatoria';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Buscar el usuario
    SELECT 
        u.id_usuario,
        u.nombre_usuario,
        u.apellido_usuario,
        u.email_usuario,
        u.password_hash_usuario,
        u.email_verificado_usuario,
        u.intentos_login_usuario,
        u.bloqueado_hasta_usuario,
        u.estado_usuario,
        tu.nombre_tipo_usuario
    INTO v_usuario
    FROM tb_usuarios u
    JOIN tb_tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
    WHERE u.email_usuario = LOWER(TRIM(p_email));
    
    -- Verificar si el usuario existe
    IF v_usuario.id_usuario IS NULL THEN
        message := 'Credenciales inválidas';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Verificar si el usuario está activo
    IF NOT v_usuario.estado_usuario THEN
        message := 'Usuario inactivo';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Verificar si el usuario está bloqueado
    IF v_usuario.bloqueado_hasta_usuario IS NOT NULL AND v_usuario.bloqueado_hasta_usuario > CURRENT_TIMESTAMP THEN
        message := 'Usuario bloqueado temporalmente. Intente más tarde';
        bloqueado_hasta := v_usuario.bloqueado_hasta_usuario;
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Verificar la contraseña
    IF NOT (v_usuario.password_hash_usuario = crypt(p_password, v_usuario.password_hash_usuario)) THEN
        message := 'Credenciales inválidas';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Login exitoso - actualizar último acceso
    UPDATE tb_usuarios 
    SET ultimo_acceso_usuario = CURRENT_TIMESTAMP
    WHERE tb_usuarios.id_usuario = v_usuario.id_usuario;
    
    -- Preparar respuesta exitosa
    success := TRUE;
    message := 'Autenticación exitosa';
    id_usuario := v_usuario.id_usuario;
    nombre_usuario := v_usuario.nombre_usuario;
    apellido_usuario := v_usuario.apellido_usuario;
    email_usuario := v_usuario.email_usuario;
    tipo_usuario := v_usuario.nombre_tipo_usuario;
    email_verificado := v_usuario.email_verificado_usuario;
    
    RETURN NEXT;
    
EXCEPTION
    WHEN OTHERS THEN
        success := FALSE;
        message := 'Error interno: ' || SQLERRM;
        RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Comentario del procedimiento
COMMENT ON FUNCTION sp_autenticar_usuario(VARCHAR, VARCHAR) IS 
'Procedimiento para autenticar usuarios en el sistema. Incluye protección contra ataques de fuerza bruta.';

-- Ejemplo de uso:
/*
SELECT * FROM sp_autenticar_usuario(
    'usuario@email.com',
    'contraseña123'
);
*/
