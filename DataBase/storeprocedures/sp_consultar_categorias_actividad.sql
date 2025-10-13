-- =====================================================
-- Procedimiento Almacenado: sp_consultar_categorias_actividad
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Procedimiento para consultar categorías de actividades
CREATE OR REPLACE FUNCTION sp_consultar_categorias_actividad()
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    id_categoria INTEGER,
    nombre_categoria VARCHAR(100),
    descripcion_categoria TEXT,
    estado_categoria BOOLEAN,
    fecha_creacion_categoria TIMESTAMP
) AS $$
DECLARE
    v_count INTEGER := 0;
BEGIN
    -- Inicializar variables de respuesta
    success := FALSE;
    message := '';
    id_categoria := NULL;
    nombre_categoria := '';
    descripcion_categoria := '';
    estado_categoria := FALSE;
    fecha_creacion_categoria := NULL;
    
    -- Consultar categorías activas
    FOR id_categoria, nombre_categoria, descripcion_categoria, estado_categoria, fecha_creacion_categoria
    IN 
        SELECT 
            ca.id_categoria,
            ca.nombre_categoria,
            ca.descripcion_categoria,
            ca.estado_categoria,
            ca.fecha_creacion_categoria
        FROM tb_categorias_actividad ca
        WHERE ca.estado_categoria = TRUE
        ORDER BY ca.nombre_categoria ASC
    LOOP
        success := TRUE;
        message := 'Categorías obtenidas exitosamente';
        v_count := v_count + 1;
        
        RETURN NEXT;
    END LOOP;
    
    -- Si no se encontraron categorías
    IF v_count = 0 THEN
        success := FALSE;
        message := 'No se encontraron categorías de actividades';
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
COMMENT ON FUNCTION sp_consultar_categorias_actividad() IS 
'Procedimiento para consultar todas las categorías de actividades activas.';

-- Ejemplo de uso:
/*
SELECT * FROM sp_consultar_categorias_actividad();
*/
