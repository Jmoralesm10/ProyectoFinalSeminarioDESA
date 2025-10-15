-- =====================================================
-- Stored Procedure: sp_consultar_agenda_congreso
-- Descripción: Consulta la agenda del congreso
-- Sistema: Gestión del Congreso de Tecnología
-- =====================================================

CREATE OR REPLACE FUNCTION sp_consultar_agenda_congreso(
    p_dia_agenda INTEGER DEFAULT NULL,
    p_tipo_actividad VARCHAR(50) DEFAULT NULL
)
RETURNS TABLE (
    id_agenda INTEGER,
    id_informacion INTEGER,
    dia_agenda INTEGER,
    hora_inicio_agenda TIME,
    hora_fin_agenda TIME,
    titulo_actividad_agenda VARCHAR(200),
    descripcion_actividad_agenda TEXT,
    tipo_actividad_agenda VARCHAR(50),
    ponente_agenda VARCHAR(200),
    orden_agenda INTEGER,
    congreso_titulo VARCHAR(200)
) AS $$
BEGIN
    -- Validar parámetros de entrada
    IF p_dia_agenda IS NOT NULL AND (p_dia_agenda < 1 OR p_dia_agenda > 5) THEN
        RAISE EXCEPTION 'El día de la agenda debe estar entre 1 y 5';
    END IF;

    IF p_tipo_actividad IS NOT NULL AND LENGTH(TRIM(p_tipo_actividad)) = 0 THEN
        RAISE EXCEPTION 'El tipo de actividad no puede estar vacío';
    END IF;

    -- Retornar agenda filtrada
    RETURN QUERY
    SELECT 
        vac.id_agenda,
        vac.id_informacion,
        vac.dia_agenda,
        vac.hora_inicio_agenda,
        vac.hora_fin_agenda,
        vac.titulo_actividad_agenda,
        vac.descripcion_actividad_agenda,
        vac.tipo_actividad_agenda,
        vac.ponente_agenda,
        vac.orden_agenda,
        vac.congreso_titulo
    FROM vista_agenda_congreso_publica vac
    WHERE 
        (p_dia_agenda IS NULL OR vac.dia_agenda = p_dia_agenda)
        AND (p_tipo_actividad IS NULL OR vac.tipo_actividad_agenda ILIKE '%' || p_tipo_actividad || '%')
    ORDER BY vac.dia_agenda, vac.orden_agenda, vac.hora_inicio_agenda;
END;
$$ LANGUAGE plpgsql;

-- Comentario de la función
COMMENT ON FUNCTION sp_consultar_agenda_congreso(INTEGER, VARCHAR) IS 'Consulta la agenda del congreso, opcionalmente filtrada por día y tipo de actividad';

-- Ejemplos de uso:
-- SELECT * FROM sp_consultar_agenda_congreso(); -- Toda la agenda
-- SELECT * FROM sp_consultar_agenda_congreso(1); -- Solo día 1
-- SELECT * FROM sp_consultar_agenda_congreso(NULL, 'taller'); -- Solo talleres
-- SELECT * FROM sp_consultar_agenda_congreso(2, 'competencia'); -- Competencias del día 2
