-- =====================================================
-- Procedimiento Almacenado: sp_inscribir_usuario
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Procedimiento para inscribir un nuevo usuario al congreso
-- Maneja tanto estudiantes externos como internos
CREATE OR REPLACE FUNCTION sp_inscribir_usuario(
    p_tipo_usuario VARCHAR(20),           -- 'externo' o 'interno'
    p_nombre VARCHAR(100),                -- Nombre del usuario
    p_apellido VARCHAR(100),              -- Apellido del usuario
    p_email VARCHAR(255),                 -- Email del usuario
    p_password VARCHAR(255),              -- Contraseña del usuario
    p_telefono VARCHAR(20) DEFAULT NULL,  -- Teléfono (opcional)
    p_colegio VARCHAR(200) DEFAULT NULL   -- Colegio (solo para externos)
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    id_usuario UUID,
    codigo_qr VARCHAR(500)
) AS $$
DECLARE
    v_id_tipo_usuario INTEGER;
    v_id_usuario UUID;
    v_codigo_qr VARCHAR(500);
    v_email_existe BOOLEAN;
    v_tipo_valido BOOLEAN;
BEGIN
    -- Inicializar variables de respuesta
    success := FALSE;
    message := '';
    id_usuario := NULL;
    codigo_qr := '';
    
    -- Validar que el tipo de usuario sea válido
    IF p_tipo_usuario NOT IN ('externo', 'interno') THEN
        message := 'Tipo de usuario inválido. Debe ser "externo" o "interno"';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Obtener el ID del tipo de usuario
    SELECT id_tipo_usuario INTO v_id_tipo_usuario
    FROM tb_tipos_usuario 
    WHERE nombre_tipo_usuario = p_tipo_usuario 
    AND estado_tipo_usuario = TRUE;
    
    IF v_id_tipo_usuario IS NULL THEN
        message := 'Tipo de usuario no encontrado o inactivo';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Validar que el email no exista
    SELECT EXISTS(
        SELECT 1 FROM tb_usuarios 
        WHERE email_usuario = p_email
    ) INTO v_email_existe;
    
    IF v_email_existe THEN
        message := 'El email ya está registrado en el sistema';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Validar contraseña
    IF p_password IS NULL OR TRIM(p_password) = '' THEN
        message := 'La contraseña es obligatoria';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Validar fortaleza de la contraseña
    IF LENGTH(p_password) < 8 THEN
        message := 'La contraseña debe tener al menos 8 caracteres';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Validaciones específicas por tipo de usuario
    IF p_tipo_usuario = 'externo' THEN
        -- Para estudiantes externos, el colegio es obligatorio
        IF p_colegio IS NULL OR TRIM(p_colegio) = '' THEN
            message := 'La institucion a la que pertenece es obligatoria para estudiantes externos';
            RETURN NEXT;
            RETURN;
        END IF;
        
        -- Validar que el email termine en .edu.gt para estudiantes externos
        IF RIGHT(LOWER(TRIM(p_email)), 7) <> '.edu.gt' THEN
            message := 'El correo debe ser de tipo educativo';
            RETURN NEXT;
            RETURN;
        END IF;
        
    ELSIF p_tipo_usuario = 'interno' THEN
        -- Para estudiantes internos, el colegio se asigna automáticamente
        p_colegio := 'Universidad Mariano Galvez';
        
        -- Validar que el correo termine en miumg.edu.gt para estudiantes internos
        IF RIGHT(LOWER(TRIM(p_email)), 12) <> 'miumg.edu.gt' THEN
            message := 'Los estudiantes internos deben usar un correo que termine en miumg.edu.gt';
            RETURN NEXT;
            RETURN;
        END IF;
    END IF;
    
    -- Validar formato de email básico
    IF p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        message := 'Formato de email inválido';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Insertar el nuevo usuario
    INSERT INTO tb_usuarios (
        id_tipo_usuario,
        nombre_usuario,
        apellido_usuario,
        email_usuario,
        password_hash_usuario,
        telefono_usuario,
        colegio_usuario,
        token_verificacion_usuario
    ) VALUES (
        v_id_tipo_usuario,
        TRIM(p_nombre),
        TRIM(p_apellido),
        LOWER(TRIM(p_email)),
        crypt(p_password, gen_salt('bf')), -- Cifrar contraseña con bcrypt
        p_telefono,
        CASE 
            WHEN p_tipo_usuario = 'externo' THEN TRIM(p_colegio)
            ELSE NULL
        END,
        encode(gen_random_bytes(32), 'hex') -- Generar token de verificación
    ) RETURNING tb_usuarios.id_usuario, tb_usuarios.codigo_qr_usuario INTO v_id_usuario, v_codigo_qr;
    
    -- Verificar que la inserción fue exitosa
    IF v_id_usuario IS NOT NULL THEN
        success := TRUE;
        message := 'Usuario inscrito exitosamente';
        id_usuario := v_id_usuario;
        codigo_qr := v_codigo_qr;
        
        -- TODO: Registrar en logs cuando la tabla esté disponible
        -- INSERT INTO tb_logs_sistema (...) VALUES (...);
    ELSE
        message := 'Error al insertar el usuario';
    END IF;
    
    RETURN NEXT;
    
EXCEPTION
    WHEN OTHERS THEN
        success := FALSE;
        message := 'Error interno: ' || SQLERRM;
        id_usuario := NULL;
        codigo_qr := '';
        RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Comentario del procedimiento
COMMENT ON FUNCTION sp_inscribir_usuario(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR) IS 
'Procedimiento para inscribir usuarios al congreso. Maneja validaciones específicas para estudiantes externos e internos.';

-- Ejemplo de uso:
/*
-- Inscribir estudiante externo
SELECT * FROM sp_inscribir_usuario(
    'externo', 
    'Juan', 
    'Pérez', 
    'juan.perez@colegio.edu', 
    '555-0101', 
    'Colegio San José'
);

-- Inscribir estudiante interno
SELECT * FROM sp_inscribir_usuario(
    'interno', 
    'María', 
    'González', 
    'maria.gonzalez@universidad.edu', 
    '555-0102', 
    NULL
);
*/
