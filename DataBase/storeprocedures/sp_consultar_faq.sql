-- =====================================================
-- Stored Procedure: sp_consultar_faq
-- Descripción: Consulta las preguntas frecuentes (FAQ) públicas
-- Sistema: Gestión del Congreso de Tecnología
-- =====================================================

CREATE OR REPLACE FUNCTION sp_consultar_faq(
    p_categoria_faq VARCHAR(100) DEFAULT NULL
)
RETURNS TABLE (
    id_faq INTEGER,
    pregunta_faq TEXT,
    respuesta_faq TEXT,
    categoria_faq VARCHAR(100),
    orden_faq INTEGER,
    fecha_creacion_faq TIMESTAMP,
    fecha_actualizacion_faq TIMESTAMP
) AS $$
BEGIN
    -- Validar parámetros de entrada
    IF p_categoria_faq IS NOT NULL AND LENGTH(TRIM(p_categoria_faq)) = 0 THEN
        RAISE EXCEPTION 'La categoría no puede estar vacía';
    END IF;

    -- Retornar FAQ filtradas por categoría si se especifica
    IF p_categoria_faq IS NOT NULL THEN
        RETURN QUERY
        SELECT 
            vf.id_faq,
            vf.pregunta_faq,
            vf.respuesta_faq,
            vf.categoria_faq,
            vf.orden_faq,
            vf.fecha_creacion_faq,
            vf.fecha_actualizacion_faq
        FROM vista_faq_publica vf
        WHERE vf.categoria_faq ILIKE '%' || p_categoria_faq || '%'
        ORDER BY vf.categoria_faq, vf.orden_faq, vf.pregunta_faq;
    ELSE
        -- Retornar todas las FAQ
        RETURN QUERY
        SELECT 
            vf.id_faq,
            vf.pregunta_faq,
            vf.respuesta_faq,
            vf.categoria_faq,
            vf.orden_faq,
            vf.fecha_creacion_faq,
            vf.fecha_actualizacion_faq
        FROM vista_faq_publica vf
        ORDER BY vf.categoria_faq, vf.orden_faq, vf.pregunta_faq;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Comentario de la función
COMMENT ON FUNCTION sp_consultar_faq(VARCHAR) IS 'Consulta las preguntas frecuentes públicas, opcionalmente filtradas por categoría';

-- Ejemplos de uso:
-- SELECT * FROM sp_consultar_faq(); -- Todas las FAQ
-- SELECT * FROM sp_consultar_faq('inscripcion'); -- FAQ de inscripción
-- SELECT * FROM sp_consultar_faq('pago'); -- FAQ de pagos
