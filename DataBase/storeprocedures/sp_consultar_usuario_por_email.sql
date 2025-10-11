-- =====================================================
-- Procedimiento Almacenado: sp_consultar_usuario_por_email
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Procedimiento para consultar datos completos de un usuario por email
CREATE OR REPLACE FUNCTION sp_consultar_usuario_por_email(
    p_email_usuario VARCHAR(255)          -- Email del usuario a consultar
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
    codigo_qr_usuario VARCHAR(500),
    email_verificado_usuario BOOLEAN,
    ultimo_acceso_usuario TIMESTAMP,
    estado_usuario BOOLEAN,
    fecha_inscripcion_usuario TIMESTAMP,
    tipo_usuario VARCHAR(50)
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
    telefono_usuario := '';
    colegio_usuario := '';
    codigo_qr_usuario := '';
    email_verificado_usuario := FALSE;
    ultimo_acceso_usuario := NULL;
    estado_usuario := FALSE;
    fecha_inscripcion_usuario := NULL;
    tipo_usuario := '';
    
    -- Validar parámetros
    IF p_email_usuario IS NULL OR TRIM(p_email_usuario) = '' THEN
        message := 'Email de usuario requerido';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Validar formato de email
    IF p_email_usuario !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        message := 'Formato de email inválido';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Buscar el usuario
    SELECT 
        u.id_usuario,
        u.nombre_usuario,
        u.apellido_usuario,
        u.email_usuario,
        u.telefono_usuario,
        u.colegio_usuario,
        u.codigo_qr_usuario,
        u.email_verificado_usuario,
        u.ultimo_acceso_usuario,
        u.estado_usuario,
        u.fecha_inscripcion_usuario,
        tu.nombre_tipo_usuario
    INTO v_usuario
    FROM tb_usuarios u
    JOIN tb_tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
    WHERE u.email_usuario = LOWER(TRIM(p_email_usuario));
    
    -- Verificar si el usuario existe
    IF v_usuario.id_usuario IS NULL THEN
        message := 'Usuario no encontrado';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Preparar respuesta exitosa
    success := TRUE;
    message := 'Usuario encontrado exitosamente';
    id_usuario := v_usuario.id_usuario;
    nombre_usuario := v_usuario.nombre_usuario;
    apellido_usuario := v_usuario.apellido_usuario;
    email_usuario := v_usuario.email_usuario;
    telefono_usuario := v_usuario.telefono_usuario;
    colegio_usuario := v_usuario.colegio_usuario;
    codigo_qr_usuario := v_usuario.codigo_qr_usuario;
    email_verificado_usuario := v_usuario.email_verificado_usuario;
    ultimo_acceso_usuario := v_usuario.ultimo_acceso_usuario;
    estado_usuario := v_usuario.estado_usuario;
    fecha_inscripcion_usuario := v_usuario.fecha_inscripcion_usuario;
    tipo_usuario := v_usuario.nombre_tipo_usuario;
    
    -- Registrar en logs
    INSERT INTO tb_logs_sistema (
        id_usuario,
        accion_log,
        tabla_afectada_log,
        registro_id_log,
        detalles_log
    ) VALUES (
        v_usuario.id_usuario,
        'CONSULTA_USUARIO_EMAIL',
        'tb_usuarios',
        v_usuario.id_usuario::text,
        jsonb_build_object(
            'email', v_usuario.email_usuario,
            'tipo_usuario', v_usuario.nombre_tipo_usuario
        )
    );
    
    RETURN NEXT;
    
EXCEPTION
    WHEN OTHERS THEN
        success := FALSE;
        message := 'Error interno: ' || SQLERRM;
        RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Comentario del procedimiento
COMMENT ON FUNCTION sp_consultar_usuario_por_email(VARCHAR) IS 
'Procedimiento para consultar datos completos de un usuario por email.';

-- Ejemplo de uso:
/*
SELECT * FROM sp_consultar_usuario_por_email('usuario@email.com');
*/
