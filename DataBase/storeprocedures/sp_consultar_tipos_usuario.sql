-- =====================================================
-- Procedimiento Almacenado: sp_consultar_tipos_usuario
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Procedimiento para obtener todos los tipos de usuario disponibles
CREATE OR REPLACE FUNCTION sp_consultar_tipos_usuario()
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    id_tipo_usuario INTEGER,
    nombre_tipo_usuario VARCHAR(50),
    descripcion_tipo_usuario TEXT,
    estado_tipo_usuario BOOLEAN,
    fecha_creacion TIMESTAMP
) AS $$
DECLARE
    v_tipo RECORD;
BEGIN
    -- Inicializar variables de respuesta
    success := FALSE;
    message := '';
    id_tipo_usuario := NULL;
    nombre_tipo_usuario := '';
    descripcion_tipo_usuario := '';
    estado_tipo_usuario := FALSE;
    fecha_creacion := NULL;
    
    -- Obtener todos los tipos de usuario activos
    FOR v_tipo IN 
        SELECT 
            tu.id_tipo_usuario,
            tu.nombre_tipo_usuario,
            tu.descripcion_tipo_usuario,
            tu.estado_tipo_usuario,
            tu.fecha_creacion
        FROM tb_tipos_usuario tu
        WHERE tu.estado_tipo_usuario = TRUE
        ORDER BY tu.id_tipo_usuario
    LOOP
        success := TRUE;
        message := 'Tipos de usuario obtenidos exitosamente';
        id_tipo_usuario := v_tipo.id_tipo_usuario;
        nombre_tipo_usuario := v_tipo.nombre_tipo_usuario;
        descripcion_tipo_usuario := v_tipo.descripcion_tipo_usuario;
        estado_tipo_usuario := v_tipo.estado_tipo_usuario;
        fecha_creacion := v_tipo.fecha_creacion;
        
        RETURN NEXT;
    END LOOP;
    
    -- Si no se encontraron tipos de usuario
    IF NOT FOUND THEN
        success := FALSE;
        message := 'No se encontraron tipos de usuario activos';
        RETURN NEXT;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        success := FALSE;
        message := 'Error interno: ' || SQLERRM;
        RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Comentario del procedimiento
COMMENT ON FUNCTION sp_consultar_tipos_usuario() IS 
'Procedimiento para obtener todos los tipos de usuario disponibles y activos.';

-- Ejemplo de uso:
/*
SELECT * FROM sp_consultar_tipos_usuario();
*/
