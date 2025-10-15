-- =====================================================
-- Stored Procedure: sp_consultar_informacion_congreso
-- Descripción: Consulta la información más reciente del congreso
-- Sistema: Gestión del Congreso de Tecnología
-- =====================================================
DROP FUNCTION sp_consultar_informacion_congreso();
CREATE OR REPLACE FUNCTION sp_consultar_informacion_congreso()
RETURNS TABLE (
    id_informacion INTEGER,
    titulo_informacion VARCHAR(200),
    descripcion_informacion TEXT,
    fecha_inicio_informacion DATE,
    fecha_fin_informacion DATE,
    lugar_informacion VARCHAR(200),
    informacion_carrera_informacion TEXT,
    fecha_creacion_informacion TIMESTAMP,
    fecha_actualizacion_informacion TIMESTAMP
) AS $$
BEGIN
    -- Retornar la información más reciente del congreso
    RETURN QUERY
    SELECT 
        vic.id_informacion,
        vic.titulo_informacion,
        vic.descripcion_informacion,
        vic.fecha_inicio_informacion,
        vic.fecha_fin_informacion,
        vic.lugar_informacion,
        vic.informacion_carrera_informacion,
        vic.fecha_creacion_informacion,
        vic.fecha_actualizacion_informacion
    FROM vista_informacion_congreso_publica vic;
END;
$$ LANGUAGE plpgsql;

-- Comentario de la función
COMMENT ON FUNCTION sp_consultar_informacion_congreso() IS 'Consulta la información más reciente del congreso disponible públicamente';

-- Ejemplo de uso:
-- SELECT * FROM sp_consultar_informacion_congreso();
