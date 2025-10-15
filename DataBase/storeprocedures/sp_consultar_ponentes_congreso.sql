-- =====================================================
-- Stored Procedure: sp_consultar_ponentes_congreso
-- Descripción: Consulta los ponentes invitados al congreso
-- Sistema: Gestión del Congreso de Tecnología
-- =====================================================

CREATE OR REPLACE FUNCTION sp_consultar_ponentes_congreso(
    p_especialidad VARCHAR(200) DEFAULT NULL,
    p_empresa VARCHAR(200) DEFAULT NULL
)
RETURNS TABLE (
    id_ponente INTEGER,
    id_informacion INTEGER,
    nombre_ponente VARCHAR(100),
    apellido_ponente VARCHAR(100),
    titulo_academico_ponente VARCHAR(100),
    cargo_ponente VARCHAR(200),
    empresa_ponente VARCHAR(200),
    especialidad_ponente VARCHAR(200),
    foto_ponente_path VARCHAR(500),
    email_ponente VARCHAR(200),
    linkedin_ponente VARCHAR(200),
    twitter_ponente VARCHAR(200),
    orden_ponente INTEGER,
    congreso_titulo VARCHAR(200),
    nombre_completo_ponente TEXT
) AS $$
BEGIN
    -- Validar parámetros de entrada
    IF p_especialidad IS NOT NULL AND LENGTH(TRIM(p_especialidad)) = 0 THEN
        RAISE EXCEPTION 'La especialidad no puede estar vacía';
    END IF;

    IF p_empresa IS NOT NULL AND LENGTH(TRIM(p_empresa)) = 0 THEN
        RAISE EXCEPTION 'La empresa no puede estar vacía';
    END IF;

    -- Retornar ponentes filtrados
    RETURN QUERY
    SELECT 
        vpc.id_ponente,
        vpc.id_informacion,
        vpc.nombre_ponente,
        vpc.apellido_ponente,
        vpc.titulo_academico_ponente,
        vpc.cargo_ponente,
        vpc.empresa_ponente,
        vpc.especialidad_ponente,
        vpc.foto_ponente_path,
        vpc.email_ponente,
        vpc.linkedin_ponente,
        vpc.twitter_ponente,
        vpc.orden_ponente,
        vpc.congreso_titulo,
        vpc.nombre_completo_ponente
    FROM vista_ponentes_congreso_publica vpc
    WHERE 
        (p_especialidad IS NULL OR vpc.especialidad_ponente ILIKE '%' || p_especialidad || '%')
        AND (p_empresa IS NULL OR vpc.empresa_ponente ILIKE '%' || p_empresa || '%')
    ORDER BY vpc.orden_ponente, vpc.nombre_ponente, vpc.apellido_ponente;
END;
$$ LANGUAGE plpgsql;

-- Comentario de la función
COMMENT ON FUNCTION sp_consultar_ponentes_congreso(VARCHAR, VARCHAR) IS 'Consulta los ponentes invitados al congreso, opcionalmente filtrados por especialidad y empresa';

-- Ejemplos de uso:
-- SELECT * FROM sp_consultar_ponentes_congreso(); -- Todos los ponentes
-- SELECT * FROM sp_consultar_ponentes_congreso('IA'); -- Ponentes especializados en IA
-- SELECT * FROM sp_consultar_ponentes_congreso(NULL, 'Microsoft'); -- Ponentes de Microsoft
-- SELECT * FROM sp_consultar_ponentes_congreso('Desarrollo Web', 'Google'); -- Desarrolladores de Google
