-- =====================================================
-- Procedimiento Almacenado: sp_actualizar_usuario
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Procedimiento para actualizar datos del perfil de usuario
CREATE OR REPLACE FUNCTION sp_actualizar_usuario(
    p_id_usuario UUID,                    -- ID del usuario a actualizar
    p_nombre VARCHAR(100) DEFAULT NULL,   -- Nuevo nombre (opcional)
    p_apellido VARCHAR(100) DEFAULT NULL, -- Nuevo apellido (opcional)
    p_telefono VARCHAR(20) DEFAULT NULL,  -- Nuevo teléfono (opcional)
    p_colegio VARCHAR(200) DEFAULT NULL   -- Nuevo colegio (opcional)
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    id_usuario UUID,
    nombre_usuario VARCHAR(100),
    apellido_usuario VARCHAR(100),
    email_usuario VARCHAR(255),
    telefono_usuario VARCHAR(20),
    colegio_usuario VARCHAR(200),
    tipo_usuario VARCHAR(50)
) AS $$
DECLARE
    v_usuario_actual RECORD;
    v_cambios JSONB;
BEGIN
    -- Inicializar variables de respuesta
    success := FALSE;
    message := '';
    id_usuario := NULL;
    nombre_usuario := '';
    apellido_usuario := '';
    email_usuario := '';
    telefono_usuario := '';
    colegio_usuario := '';
    tipo_usuario := '';
    v_cambios := '{}'::jsonb;
    
    -- Validar parámetros
    IF p_id_usuario IS NULL THEN
        message := 'ID de usuario requerido';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Verificar que al menos un campo se vaya a actualizar
    IF p_nombre IS NULL AND p_apellido IS NULL AND p_telefono IS NULL AND p_colegio IS NULL THEN
        message := 'Al menos un campo debe ser proporcionado para actualizar';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Obtener datos actuales del usuario
    SELECT 
        u.id_usuario,
        u.nombre_usuario,
        u.apellido_usuario,
        u.email_usuario,
        u.telefono_usuario,
        u.colegio_usuario,
        u.estado_usuario,
        tu.nombre_tipo_usuario
    INTO v_usuario_actual
    FROM tb_usuarios u
    JOIN tb_tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
    WHERE u.id_usuario = p_id_usuario;
    
    -- Verificar si el usuario existe
    IF v_usuario_actual.id_usuario IS NULL THEN
        message := 'Usuario no encontrado';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Verificar si el usuario está activo
    IF NOT v_usuario_actual.estado_usuario THEN
        message := 'Usuario inactivo';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Validar campos proporcionados
    IF p_nombre IS NOT NULL AND (TRIM(p_nombre) = '' OR LENGTH(TRIM(p_nombre)) < 2) THEN
        message := 'El nombre debe tener al menos 2 caracteres';
        RETURN NEXT;
        RETURN;
    END IF;
    
    IF p_apellido IS NOT NULL AND (TRIM(p_apellido) = '' OR LENGTH(TRIM(p_apellido)) < 2) THEN
        message := 'El apellido debe tener al menos 2 caracteres';
        RETURN NEXT;
        RETURN;
    END IF;
    
    IF p_telefono IS NOT NULL AND p_telefono != '' AND p_telefono !~ '^[0-9+\-\s()]+$' THEN
        message := 'Formato de teléfono inválido';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Actualizar el usuario
    UPDATE tb_usuarios 
    SET 
        nombre_usuario = COALESCE(TRIM(p_nombre), nombre_usuario),
        apellido_usuario = COALESCE(TRIM(p_apellido), apellido_usuario),
        telefono_usuario = COALESCE(p_telefono, telefono_usuario),
        colegio_usuario = COALESCE(TRIM(p_colegio), colegio_usuario),
        fecha_actualizacion_usuario = CURRENT_TIMESTAMP
    WHERE id_usuario = p_id_usuario;
    
    -- Verificar que la actualización fue exitosa
    IF FOUND THEN
        -- Obtener datos actualizados
        SELECT 
            u.id_usuario,
            u.nombre_usuario,
            u.apellido_usuario,
            u.email_usuario,
            u.telefono_usuario,
            u.colegio_usuario,
            tu.nombre_tipo_usuario
        INTO v_usuario_actual
        FROM tb_usuarios u
        JOIN tb_tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
        WHERE u.id_usuario = p_id_usuario;
        
        success := TRUE;
        message := 'Usuario actualizado exitosamente';
        id_usuario := v_usuario_actual.id_usuario;
        nombre_usuario := v_usuario_actual.nombre_usuario;
        apellido_usuario := v_usuario_actual.apellido_usuario;
        email_usuario := v_usuario_actual.email_usuario;
        telefono_usuario := v_usuario_actual.telefono_usuario;
        colegio_usuario := v_usuario_actual.colegio_usuario;
        tipo_usuario := v_usuario_actual.nombre_tipo_usuario;
        
        -- Registrar cambios en logs
        IF p_nombre IS NOT NULL THEN
            v_cambios := v_cambios || jsonb_build_object('nombre', p_nombre);
        END IF;
        IF p_apellido IS NOT NULL THEN
            v_cambios := v_cambios || jsonb_build_object('apellido', p_apellido);
        END IF;
        IF p_telefono IS NOT NULL THEN
            v_cambios := v_cambios || jsonb_build_object('telefono', p_telefono);
        END IF;
        IF p_colegio IS NOT NULL THEN
            v_cambios := v_cambios || jsonb_build_object('colegio', p_colegio);
        END IF;
        
        INSERT INTO tb_logs_sistema (
            id_usuario,
            accion_log,
            tabla_afectada_log,
            registro_id_log,
            detalles_log
        ) VALUES (
            p_id_usuario,
            'ACTUALIZACION_USUARIO',
            'tb_usuarios',
            p_id_usuario::text,
            jsonb_build_object(
                'email', v_usuario_actual.email_usuario,
                'cambios', v_cambios
            )
        );
    ELSE
        message := 'Error al actualizar el usuario';
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
COMMENT ON FUNCTION sp_actualizar_usuario(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR) IS 
'Procedimiento para actualizar datos del perfil de usuario.';

-- Ejemplo de uso:
/*
SELECT * FROM sp_actualizar_usuario(
    '550e8400-e29b-41d4-a716-446655440000',
    'Juan Carlos',  -- nombre
    'Pérez Martínez',  -- apellido
    '555-0123',  -- teléfono
    'Colegio San José'  -- colegio
);
*/
