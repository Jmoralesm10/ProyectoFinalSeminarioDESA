-- =====================================================
-- Procedimiento Almacenado: sp_verificar_email_existe
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Procedimiento para verificar si un email ya existe en el sistema
CREATE OR REPLACE FUNCTION sp_verificar_email_existe(
    p_email_usuario VARCHAR(255)          -- Email a verificar
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    existe BOOLEAN,
    id_usuario UUID,
    email_verificado BOOLEAN
) AS $$
DECLARE
    v_usuario RECORD;
BEGIN
    -- Inicializar variables de respuesta
    success := FALSE;
    message := '';
    existe := FALSE;
    id_usuario := NULL;
    email_verificado := FALSE;
    
    -- Validar parámetros
    IF p_email_usuario IS NULL OR TRIM(p_email_usuario) = '' THEN
        message := 'Email requerido';
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
        u.email_verificado_usuario
    INTO v_usuario
    FROM tb_usuarios u
    WHERE u.email_usuario = LOWER(TRIM(p_email_usuario));
    
    -- Verificar si el usuario existe
    IF v_usuario.id_usuario IS NOT NULL THEN
        existe := TRUE;
        id_usuario := v_usuario.id_usuario;
        email_verificado := v_usuario.email_verificado_usuario;
        message := 'Email encontrado en el sistema';
    ELSE
        existe := FALSE;
        message := 'Email no encontrado en el sistema';
    END IF;
    
    success := TRUE;
    
    RETURN NEXT;
    
EXCEPTION
    WHEN OTHERS THEN
        success := FALSE;
        message := 'Error interno: ' || SQLERRM;
        existe := FALSE;
        RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Comentario del procedimiento
COMMENT ON FUNCTION sp_verificar_email_existe(VARCHAR) IS 
'Procedimiento para verificar si un email ya existe en el sistema.';

-- Ejemplo de uso:
/*
SELECT * FROM sp_verificar_email_existe('usuario@email.com');
*/
