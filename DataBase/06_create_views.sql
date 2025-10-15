-- =====================================================
-- Script de creación de vistas
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Vista de usuarios con información completa
CREATE OR REPLACE VIEW vista_usuarios_completa AS
SELECT 
    u.id_usuario,
    u.nombre_usuario,
    u.apellido_usuario,
    u.email_usuario,
    u.telefono_usuario,
    u.colegio_usuario,
    u.codigo_qr_usuario,
    u.email_verificado_usuario,
    tu.nombre_tipo_usuario,
    u.estado_usuario,
    u.fecha_inscripcion_usuario,
    u.fecha_actualizacion_usuario,
    u.ultimo_acceso_usuario,
    u.intentos_login_usuario
FROM tb_usuarios u
JOIN tb_tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario;

-- Vista de actividades con información completa
DROP VIEW vista_actividades_completa;
CREATE OR REPLACE VIEW vista_actividades_completa AS
SELECT 
    a.id_actividad,
    a.nombre_actividad,
    a.descripcion_actividad,
    a.tipo_actividad,
    a.fecha_inicio_actividad,
    a.fecha_fin_actividad,
    a.fecha_limite_inscripcion,
    a.duracion_estimada_minutos,
    a.cupo_maximo_actividad,
    (a.cupo_maximo_actividad - COALESCE(COUNT(ia.id_usuario), 0)) as cupo_disponible_actividad,
    a.lugar_actividad,
    a.ponente_actividad,
    a.requisitos_actividad,
    a.nivel_requerido,
    a.edad_minima,
    a.edad_maxima,
    a.materiales_requeridos,
    a.costo_actividad,
    a.moneda_costo,
    a.permite_inscripciones,
    a.requiere_aprobacion,
    ca.nombre_categoria as categoria_nombre,
    a.estado_actividad,
    a.fecha_creacion_actividad,
    a.fecha_actualizacion_actividad
FROM tb_actividades a
JOIN tb_categorias_actividad ca ON a.id_categoria = ca.id_categoria
LEFT JOIN tb_inscripciones_actividad ia ON a.id_actividad = ia.id_actividad 
    AND ia.estado_inscripcion = 'confirmada'
GROUP BY a.id_actividad, ca.nombre_categoria;

-- Vista de inscripciones con información de usuario y actividad
DROP VIEW vista_inscripciones_completa; 
CREATE OR REPLACE VIEW vista_inscripciones_completa AS
SELECT 
    ia.id_usuario,
    ia.id_actividad,
    u.nombre_usuario || ' ' || u.apellido_usuario as nombre_completo,
    u.email_usuario,
    u.codigo_qr_usuario,
    a.nombre_actividad as actividad_nombre,
    a.tipo_actividad,
    a.fecha_inicio_actividad,
    a.lugar_actividad,
    ca.nombre_categoria as categoria_nombre,
    ia.fecha_inscripcion,
    ia.estado_inscripcion,
    ia.observaciones_inscripcion
FROM tb_inscripciones_actividad ia
JOIN tb_usuarios u ON ia.id_usuario = u.id_usuario
JOIN tb_actividades a ON ia.id_actividad = a.id_actividad
JOIN tb_categorias_actividad ca ON a.id_categoria = ca.id_categoria;

-- Vista de asistencia general con información completa
CREATE OR REPLACE VIEW vista_asistencia_general_completa AS
SELECT 
    ag.id_usuario,
    ag.fecha_asistencia,
    ag.hora_ingreso,
    u.nombre_usuario || ' ' || u.apellido_usuario as nombre_completo,
    u.email_usuario,
    u.codigo_qr_usuario,
    tu.nombre_tipo_usuario,
    u.colegio_usuario
FROM tb_asistencia_general ag
JOIN tb_usuarios u ON ag.id_usuario = u.id_usuario
JOIN tb_tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario;

-- Vista de asistencia por actividad con información completa
DROP VIEW vista_asistencia_actividad_completa;
CREATE OR REPLACE VIEW vista_asistencia_actividad_completa AS
SELECT 
    aa.id_usuario,
    aa.id_actividad,
    aa.fecha_asistencia,
    u.nombre_usuario || ' ' || u.apellido_usuario as nombre_completo,
    u.email_usuario,
    u.codigo_qr_usuario,
    a.nombre_actividad,
    a.tipo_actividad,
    a.fecha_inicio_actividad,
    a.lugar_actividad,
    ca.nombre_categoria as categoria_nombre,
    tu.nombre_tipo_usuario
FROM tb_asistencia_actividad aa
JOIN tb_usuarios u ON aa.id_usuario = u.id_usuario
JOIN tb_actividades a ON aa.id_actividad = a.id_actividad
JOIN tb_categorias_actividad ca ON a.id_categoria = ca.id_categoria
JOIN tb_tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario;

-- Vista de diplomas con información completa
CREATE OR REPLACE VIEW vista_diplomas_completa AS
SELECT 
    d.id_usuario,
    d.id_actividad,
    u.nombre_usuario || ' ' || u.apellido_usuario as nombre_completo,
    u.email_usuario,
    a.nombre_actividad as actividad_nombre,
    a.tipo_actividad,
    d.tipo_diploma,
    d.nombre_diploma,
    d.plantilla_path_diploma,
    d.archivo_path_diploma,
    d.fecha_generacion_diploma,
    d.fecha_descarga_diploma,
    d.enviado_email_diploma,
    d.fecha_envio_email_diploma,
    generador.nombre_usuario || ' ' || generador.apellido_usuario as generado_por_nombre,
    d.observaciones_diploma,
    -- Información de posición si es ganador
    rc.posicion_resultado,
    rc.puntuacion_resultado,
    CASE 
        WHEN d.tipo_diploma = 'participacion' AND rc.posicion_resultado = 1 THEN '🥇 Primer Lugar'
        WHEN d.tipo_diploma = 'participacion' AND rc.posicion_resultado = 2 THEN '🥈 Segundo Lugar'
        WHEN d.tipo_diploma = 'participacion' AND rc.posicion_resultado = 3 THEN '🥉 Tercer Lugar'
        WHEN d.tipo_diploma = 'participacion' THEN '📜 Participación'
        WHEN d.tipo_diploma = 'congreso_general' THEN '🏆 Congreso General'
        ELSE d.tipo_diploma
    END as tipo_diploma_descripcion
FROM tb_diplomas d
JOIN tb_usuarios u ON d.id_usuario = u.id_usuario
LEFT JOIN tb_actividades a ON d.id_actividad = a.id_actividad
LEFT JOIN tb_usuarios generador ON d.generado_por_usuario = generador.id_usuario
LEFT JOIN tb_resultados_competencia rc ON d.id_usuario = rc.id_usuario AND d.id_actividad = rc.id_actividad;

-- Vista de resultados de competencias
CREATE OR REPLACE VIEW vista_resultados_competencia AS
SELECT 
    rc.id_actividad,
    rc.id_usuario,
    a.nombre_actividad as competencia_nombre,
    u.nombre_usuario || ' ' || u.apellido_usuario as participante_nombre,
    u.email_usuario,
    rc.posicion_resultado,
    rc.puntuacion_resultado,
    rc.descripcion_proyecto_resultado,
    rc.foto_proyecto_path_resultado,
    rc.fecha_resultado,
    rc.observaciones_resultado,
    a.fecha_inicio_actividad,
    a.lugar_actividad,
    ca.nombre_categoria as categoria_nombre,
    -- Indicar si ya tiene diploma generado
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM tb_diplomas d 
            WHERE d.id_usuario = rc.id_usuario 
            AND d.id_actividad = rc.id_actividad
            AND d.tipo_diploma = 'participacion'
        ) THEN TRUE
        ELSE FALSE
    END as tiene_diploma_generado
FROM tb_resultados_competencia rc
JOIN tb_actividades a ON rc.id_actividad = a.id_actividad
JOIN tb_usuarios u ON rc.id_usuario = u.id_usuario
JOIN tb_categorias_actividad ca ON a.id_categoria = ca.id_categoria
WHERE a.tipo_actividad = 'competencia';

-- Vista de estadísticas generales
CREATE OR REPLACE VIEW vista_estadisticas_generales AS
SELECT 
    (SELECT COUNT(*) FROM tb_usuarios WHERE estado_usuario = TRUE) as total_usuarios,
    (SELECT COUNT(*) FROM tb_usuarios WHERE id_tipo_usuario = 1 AND estado_usuario = TRUE) as usuarios_externos,
    (SELECT COUNT(*) FROM tb_usuarios WHERE id_tipo_usuario = 2 AND estado_usuario = TRUE) as usuarios_internos,
    (SELECT COUNT(*) FROM tb_actividades WHERE estado_actividad = TRUE) as total_actividades,
    (SELECT COUNT(*) FROM tb_actividades WHERE tipo_actividad = 'taller' AND estado_actividad = TRUE) as total_talleres,
    (SELECT COUNT(*) FROM tb_actividades WHERE tipo_actividad = 'competencia' AND estado_actividad = TRUE) as total_competencias,
    (SELECT COUNT(*) FROM tb_inscripciones_actividad WHERE estado_inscripcion = 'confirmada') as total_inscripciones,
    (SELECT COUNT(*) FROM tb_asistencia_general) as total_asistencia_general,
    (SELECT COUNT(*) FROM tb_asistencia_actividad) as total_asistencia_actividades
    /*(SELECT COUNT(*) FROM tb_diplomas) as total_diplomas_generados,
    (SELECT COUNT(*) FROM tb_resultados_competencia) as total_resultados_competencias*/;

-- Vista de reporte de asistencia por actividad
CREATE OR REPLACE VIEW vista_reporte_asistencia_actividad AS
SELECT 
    a.id_actividad,
    a.nombre_actividad,
    a.tipo_actividad,
    a.fecha_inicio_actividad,
    a.lugar_actividad,
    ca.nombre_categoria as categoria_nombre,
    COUNT(DISTINCT ia.id_usuario) as total_inscritos,
    COUNT(DISTINCT aa.id_usuario) as total_asistentes,
    ROUND(
        CASE 
            WHEN COUNT(DISTINCT ia.id_usuario) > 0 THEN 
                (COUNT(DISTINCT aa.id_usuario)::decimal / COUNT(DISTINCT ia.id_usuario)::decimal) * 100 
            ELSE 0 
        END, 2
    ) as porcentaje_asistencia,
    a.cupo_maximo_actividad,
    (a.cupo_maximo_actividad - COUNT(DISTINCT ia.id_usuario)) as cupos_disponibles
FROM tb_actividades a
LEFT JOIN tb_inscripciones_actividad ia ON a.id_actividad = ia.id_actividad 
    AND ia.estado_inscripcion = 'confirmada'
LEFT JOIN tb_asistencia_actividad aa ON a.id_actividad = aa.id_actividad
JOIN tb_categorias_actividad ca ON a.id_categoria = ca.id_categoria
WHERE a.estado_actividad = TRUE
GROUP BY a.id_actividad, a.nombre_actividad, a.tipo_actividad, a.fecha_inicio_actividad, 
         a.lugar_actividad, ca.nombre_categoria, a.cupo_maximo_actividad;

-- Vista de usuarios con más actividades inscritas
CREATE OR REPLACE VIEW vista_usuarios_mas_activos AS
SELECT 
    u.id_usuario,
    u.nombre_usuario || ' ' || u.apellido_usuario as nombre_completo,
    u.email_usuario,
    tu.nombre_tipo_usuario,
    u.colegio_usuario,
    COUNT(DISTINCT ia.id_actividad) as total_inscripciones,
    COUNT(DISTINCT aa.id_actividad) as total_asistencias_actividades,
    COUNT(DISTINCT ag.fecha_asistencia) as total_asistencias_generales,
    u.fecha_inscripcion_usuario,
    u.ultimo_acceso_usuario
FROM tb_usuarios u
JOIN tb_tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
LEFT JOIN tb_inscripciones_actividad ia ON u.id_usuario = ia.id_usuario 
    AND ia.estado_inscripcion = 'confirmada'
LEFT JOIN tb_asistencia_actividad aa ON u.id_usuario = aa.id_usuario
LEFT JOIN tb_asistencia_general ag ON u.id_usuario = ag.id_usuario
WHERE u.estado_usuario = TRUE
GROUP BY u.id_usuario, u.nombre_usuario, u.apellido_usuario, u.email_usuario, 
         tu.nombre_tipo_usuario, u.colegio_usuario, u.fecha_inscripcion_usuario, u.ultimo_acceso_usuario
ORDER BY total_inscripciones DESC, total_asistencias_actividades DESC;

-- Vista de administradores con información completa del usuario
CREATE OR REPLACE VIEW vista_administradores_completa AS
SELECT 
    a.id_usuario,
    a.rol_administrador,
    u.nombre_usuario || ' ' || u.apellido_usuario as nombre_completo,
    u.email_usuario,
    u.telefono_usuario,
    u.colegio_usuario,
    tu.nombre_tipo_usuario,
    a.permisos_administrador,
    a.estado_administrador,
    a.fecha_asignacion_administrador,
    a.fecha_ultima_actividad_administrador,
    a.asignado_por_usuario,
    asignador.nombre_usuario || ' ' || asignador.apellido_usuario as asignado_por_nombre,
    a.observaciones_administrador,
    u.estado_usuario,
    u.fecha_inscripcion_usuario
FROM tb_administradores a
JOIN tb_usuarios u ON a.id_usuario = u.id_usuario
JOIN tb_tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
LEFT JOIN tb_usuarios asignador ON a.asignado_por_usuario = asignador.id_usuario;

-- Vista de administradores (compatible con la API)
CREATE OR REPLACE VIEW vista_administradores AS
SELECT 
    a.id_usuario,
    u.nombre_usuario,
    u.apellido_usuario,
    u.email_usuario,
    u.telefono_usuario,
    u.es_administrador,
    u.permisos_especiales,
    a.rol_administrador,
    a.permisos_administrador,
    a.estado_administrador,
    a.fecha_asignacion_administrador,
    a.fecha_ultima_actividad_administrador,
    a.observaciones_administrador,
    u.estado_usuario,
    u.fecha_inscripcion_usuario,
    u.ultimo_acceso_usuario
FROM tb_administradores a
JOIN tb_usuarios u ON a.id_usuario = u.id_usuario
WHERE a.estado_administrador = true
ORDER BY a.fecha_asignacion_administrador DESC;

-- Vista de reporte de inscripciones por actividad
CREATE OR REPLACE VIEW vista_reporte_inscripciones_actividad AS
SELECT 
    a.id_actividad,
    a.nombre_actividad,
    a.tipo_actividad,
    a.fecha_inicio_actividad,
    a.fecha_limite_inscripcion,
    a.cupo_maximo_actividad,
    ca.nombre_categoria as categoria_nombre,
    COUNT(ia.id_usuario) as total_inscripciones,
    COUNT(CASE WHEN ia.estado_inscripcion = 'confirmada' THEN 1 END) as inscripciones_confirmadas,
    COUNT(CASE WHEN ia.estado_inscripcion = 'en_espera' THEN 1 END) as inscripciones_pendientes,
    COUNT(CASE WHEN ia.estado_inscripcion = 'cancelada' THEN 1 END) as inscripciones_canceladas,
    (a.cupo_maximo_actividad - COUNT(CASE WHEN ia.estado_inscripcion = 'confirmada' THEN 1 END)) as cupos_disponibles,
    ROUND(
        CASE 
            WHEN a.cupo_maximo_actividad > 0 THEN 
                (COUNT(CASE WHEN ia.estado_inscripcion = 'confirmada' THEN 1 END)::decimal / a.cupo_maximo_actividad::decimal) * 100 
            ELSE 0 
        END, 2
    ) as porcentaje_ocupacion
FROM tb_actividades a
LEFT JOIN tb_inscripciones_actividad ia ON a.id_actividad = ia.id_actividad
JOIN tb_categorias_actividad ca ON a.id_categoria = ca.id_categoria
WHERE a.estado_actividad = TRUE
GROUP BY a.id_actividad, a.nombre_actividad, a.tipo_actividad, a.fecha_inicio_actividad, 
         a.fecha_limite_inscripcion, a.cupo_maximo_actividad, ca.nombre_categoria;

-- Vista de reporte de usuarios por colegio
CREATE OR REPLACE VIEW vista_reporte_usuarios_por_colegio AS
SELECT 
    COALESCE(u.colegio_usuario, 'Sin especificar') as colegio,
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN u.estado_usuario = TRUE THEN 1 END) as usuarios_activos,
    COUNT(CASE WHEN u.id_tipo_usuario = 1 THEN 1 END) as usuarios_externos,
    COUNT(CASE WHEN u.id_tipo_usuario = 2 THEN 1 END) as usuarios_internos,
    COUNT(CASE WHEN u.email_verificado_usuario = TRUE THEN 1 END) as emails_verificados,
    COUNT(DISTINCT ia.id_actividad) as total_inscripciones,
    COUNT(DISTINCT ag.fecha_asistencia) as total_asistencias_generales
FROM tb_usuarios u
LEFT JOIN tb_inscripciones_actividad ia ON u.id_usuario = ia.id_usuario 
    AND ia.estado_inscripcion = 'confirmada'
LEFT JOIN tb_asistencia_general ag ON u.id_usuario = ag.id_usuario
GROUP BY u.colegio_usuario
ORDER BY total_usuarios DESC;

-- Vista de reporte de actividades por categoría
CREATE OR REPLACE VIEW vista_reporte_actividades_por_categoria AS
SELECT 
    ca.id_categoria,
    ca.nombre_categoria,
    ca.descripcion_categoria,
    COUNT(a.id_actividad) as total_actividades,
    COUNT(CASE WHEN a.tipo_actividad = 'taller' THEN 1 END) as total_talleres,
    COUNT(CASE WHEN a.tipo_actividad = 'competencia' THEN 1 END) as total_competencias,
    COUNT(CASE WHEN a.estado_actividad = TRUE THEN 1 END) as actividades_activas,
    COUNT(DISTINCT ia.id_usuario) as total_inscripciones,
    COUNT(DISTINCT aa.id_usuario) as total_asistencias,
    ROUND(
        CASE 
            WHEN COUNT(DISTINCT ia.id_usuario) > 0 THEN 
                (COUNT(DISTINCT aa.id_usuario)::decimal / COUNT(DISTINCT ia.id_usuario)::decimal) * 100 
            ELSE 0 
        END, 2
    ) as porcentaje_asistencia_promedio
FROM tb_categorias_actividad ca
LEFT JOIN tb_actividades a ON ca.id_categoria = a.id_categoria
LEFT JOIN tb_inscripciones_actividad ia ON a.id_actividad = ia.id_actividad 
    AND ia.estado_inscripcion = 'confirmada'
LEFT JOIN tb_asistencia_actividad aa ON a.id_actividad = aa.id_actividad
WHERE ca.estado_categoria = TRUE
GROUP BY ca.id_categoria, ca.nombre_categoria, ca.descripcion_categoria
ORDER BY total_actividades DESC;

-- Vista de reporte de diplomas por actividad
CREATE OR REPLACE VIEW vista_reporte_diplomas_actividad AS
SELECT 
    a.id_actividad,
    a.nombre_actividad,
    a.tipo_actividad,
    a.fecha_inicio_actividad,
    ca.nombre_categoria as categoria_nombre,
    COUNT(DISTINCT d.id_usuario) as total_diplomas_generados,
    -- Contar ganadores por posición
    COUNT(CASE WHEN rc.posicion_resultado = 1 THEN 1 END) as diplomas_primer_lugar,
    COUNT(CASE WHEN rc.posicion_resultado = 2 THEN 1 END) as diplomas_segundo_lugar,
    COUNT(CASE WHEN rc.posicion_resultado = 3 THEN 1 END) as diplomas_tercer_lugar,
    -- Contar diplomas de participación (excluyendo ganadores)
    COUNT(CASE WHEN d.tipo_diploma = 'participacion' AND rc.posicion_resultado IS NULL THEN 1 END) as diplomas_participacion,
    COUNT(CASE WHEN d.enviado_email_diploma = TRUE THEN 1 END) as diplomas_enviados,
    COUNT(CASE WHEN d.enviado_email_diploma = FALSE THEN 1 END) as diplomas_pendientes_envio,
    COUNT(CASE WHEN d.fecha_descarga_diploma IS NOT NULL THEN 1 END) as diplomas_descargados,
    MAX(d.fecha_generacion_diploma) as ultima_generacion
FROM tb_actividades a
LEFT JOIN tb_diplomas d ON a.id_actividad = d.id_actividad
LEFT JOIN tb_resultados_competencia rc ON d.id_usuario = rc.id_usuario AND d.id_actividad = rc.id_actividad
JOIN tb_categorias_actividad ca ON a.id_categoria = ca.id_categoria
WHERE a.estado_actividad = TRUE
GROUP BY a.id_actividad, a.nombre_actividad, a.tipo_actividad, a.fecha_inicio_actividad, ca.nombre_categoria;

-- Vista de reporte de diplomas del congreso
CREATE OR REPLACE VIEW vista_reporte_diplomas_congreso AS
SELECT 
    DATE(d.fecha_generacion_diploma) as fecha_generacion,
    COUNT(*) as total_diplomas_generados,
    COUNT(CASE WHEN d.enviado_email_diploma = TRUE THEN 1 END) as diplomas_enviados,
    COUNT(CASE WHEN d.enviado_email_diploma = FALSE THEN 1 END) as diplomas_pendientes_envio,
    COUNT(CASE WHEN d.fecha_descarga_diploma IS NOT NULL THEN 1 END) as diplomas_descargados,
    COUNT(DISTINCT d.generado_por_usuario) as administradores_generadores
FROM tb_diplomas d
WHERE d.tipo_diploma = 'congreso_general'
GROUP BY DATE(d.fecha_generacion_diploma)
ORDER BY fecha_generacion DESC;

-- Vista de estadísticas de diplomas
CREATE OR REPLACE VIEW vista_estadisticas_diplomas AS
SELECT 
    COUNT(*) as total_diplomas,
    -- Contar ganadores por posición usando JOIN con resultados
    COUNT(CASE WHEN rc.posicion_resultado = 1 THEN 1 END) as total_primer_lugar,
    COUNT(CASE WHEN rc.posicion_resultado = 2 THEN 1 END) as total_segundo_lugar,
    COUNT(CASE WHEN rc.posicion_resultado = 3 THEN 1 END) as total_tercer_lugar,
    -- Contar diplomas de participación (excluyendo ganadores)
    COUNT(CASE WHEN d.tipo_diploma = 'participacion' AND rc.posicion_resultado IS NULL THEN 1 END) as total_participacion,
    COUNT(CASE WHEN d.tipo_diploma = 'congreso_general' THEN 1 END) as total_congreso_general,
    COUNT(CASE WHEN d.enviado_email_diploma = TRUE THEN 1 END) as total_enviados,
    COUNT(CASE WHEN d.enviado_email_diploma = FALSE THEN 1 END) as total_pendientes_envio,
    COUNT(CASE WHEN d.fecha_descarga_diploma IS NOT NULL THEN 1 END) as total_descargados,
    ROUND(
        CASE 
            WHEN COUNT(*) > 0 THEN (COUNT(CASE WHEN d.enviado_email_diploma = TRUE THEN 1 END)::decimal / COUNT(*)::decimal) * 100 
            ELSE 0 
        END, 2
    ) as porcentaje_enviados,
    ROUND(
        CASE 
            WHEN COUNT(*) > 0 THEN (COUNT(CASE WHEN d.fecha_descarga_diploma IS NOT NULL THEN 1 END)::decimal / COUNT(*)::decimal) * 100 
            ELSE 0 
        END, 2
    ) as porcentaje_descargados
FROM tb_diplomas d
LEFT JOIN tb_resultados_competencia rc ON d.id_usuario = rc.id_usuario AND d.id_actividad = rc.id_actividad;

-- Comentarios de las vistas
COMMENT ON VIEW vista_usuarios_completa IS 'Vista completa de usuarios con información de tipo y datos adicionales';
COMMENT ON VIEW vista_actividades_completa IS 'Vista completa de actividades con información de categoría y cupos disponibles';
COMMENT ON VIEW vista_inscripciones_completa IS 'Vista de inscripciones con datos de usuario y actividad';
COMMENT ON VIEW vista_asistencia_general_completa IS 'Vista de asistencia general con información completa del usuario';
COMMENT ON VIEW vista_asistencia_actividad_completa IS 'Vista de asistencia por actividad con información completa';
COMMENT ON VIEW vista_diplomas_completa IS 'Vista de diplomas con información de usuario y actividad';
COMMENT ON VIEW vista_resultados_competencia IS 'Vista de resultados de competencias con información completa';
COMMENT ON VIEW vista_estadisticas_generales IS 'Estadísticas generales del sistema';
COMMENT ON VIEW vista_reporte_asistencia_actividad IS 'Reporte de asistencia por actividad con porcentajes';
COMMENT ON VIEW vista_usuarios_mas_activos IS 'Usuarios con mayor participación en actividades';
COMMENT ON VIEW vista_administradores_completa IS 'Vista completa de administradores con información del usuario y quien los asignó';
COMMENT ON VIEW vista_administradores IS 'Vista de administradores compatible con la API, incluye información básica del usuario y datos de administrador';
COMMENT ON VIEW vista_reporte_inscripciones_actividad IS 'Reporte de inscripciones por actividad con estadísticas';
COMMENT ON VIEW vista_reporte_usuarios_por_colegio IS 'Reporte de usuarios agrupados por colegio';
COMMENT ON VIEW vista_reporte_actividades_por_categoria IS 'Reporte de actividades agrupadas por categoría';
COMMENT ON VIEW vista_reporte_diplomas_actividad IS 'Reporte de diplomas generados por actividad';
COMMENT ON VIEW vista_reporte_diplomas_congreso IS 'Reporte de diplomas del congreso por fecha';
COMMENT ON VIEW vista_estadisticas_diplomas IS 'Estadísticas generales de diplomas';

-- =====================================================
-- VISTAS PÚBLICAS - INFORMACIÓN GENERAL DEL CONGRESO
-- =====================================================

-- Vista pública de preguntas frecuentes (FAQ)
CREATE OR REPLACE VIEW vista_faq_publica AS
SELECT 
    id_faq,
    pregunta_faq,
    respuesta_faq,
    categoria_faq,
    orden_faq,
    fecha_creacion_faq,
    fecha_actualizacion_faq
FROM tb_faq
WHERE estado_faq = TRUE
ORDER BY categoria_faq, orden_faq, pregunta_faq;

-- Vista pública de información del congreso (más reciente)
CREATE OR REPLACE VIEW vista_informacion_congreso_publica AS
SELECT 
    ic.id_informacion,
    ic.titulo_informacion,
    ic.descripcion_informacion,
    ic.fecha_inicio_informacion,
    ic.fecha_fin_informacion,
    ic.lugar_informacion,
    ic.informacion_carrera_informacion,
    ic.fecha_creacion_informacion,
    ic.fecha_actualizacion_informacion
FROM tb_informacion_congreso ic
WHERE ic.estado_informacion = TRUE
ORDER BY ic.fecha_creacion_informacion DESC
LIMIT 1;

-- Vista pública de agenda del congreso
CREATE OR REPLACE VIEW vista_agenda_congreso_publica AS
SELECT 
    ac.id_agenda,
    ac.id_informacion,
    ac.dia_agenda,
    ac.hora_inicio_agenda,
    ac.hora_fin_agenda,
    ac.titulo_actividad_agenda,
    ac.descripcion_actividad_agenda,
    ac.tipo_actividad_agenda,
    ac.ponente_agenda,
    ac.orden_agenda,
    ic.titulo_informacion as congreso_titulo
FROM tb_agenda_congreso ac
JOIN tb_informacion_congreso ic ON ac.id_informacion = ic.id_informacion
WHERE ac.estado_agenda = TRUE AND ic.estado_informacion = TRUE
ORDER BY ac.dia_agenda, ac.orden_agenda, ac.hora_inicio_agenda;

-- Vista pública de ponentes del congreso
CREATE OR REPLACE VIEW vista_ponentes_congreso_publica AS
SELECT 
    pc.id_ponente,
    pc.id_informacion,
    pc.nombre_ponente,
    pc.apellido_ponente,
    pc.titulo_academico_ponente,
    pc.cargo_ponente,
    pc.empresa_ponente,
    pc.especialidad_ponente,
    pc.foto_ponente_path,
    pc.email_ponente,
    pc.linkedin_ponente,
    pc.twitter_ponente,
    pc.orden_ponente,
    ic.titulo_informacion as congreso_titulo,
    CONCAT(
        COALESCE(pc.titulo_academico_ponente || ' ', ''),
        pc.nombre_ponente, ' ', pc.apellido_ponente
    ) as nombre_completo_ponente
FROM tb_ponentes_congreso pc
JOIN tb_informacion_congreso ic ON pc.id_informacion = ic.id_informacion
WHERE pc.estado_ponente = TRUE AND ic.estado_informacion = TRUE
ORDER BY pc.orden_ponente, pc.nombre_ponente, pc.apellido_ponente;

-- Comentarios de las vistas públicas
COMMENT ON VIEW vista_faq_publica IS 'Vista pública de preguntas frecuentes activas, ordenadas por categoría';
COMMENT ON VIEW vista_informacion_congreso_publica IS 'Vista pública de la información más reciente del congreso';
COMMENT ON VIEW vista_agenda_congreso_publica IS 'Vista pública de la agenda del congreso ordenada por día y hora';
COMMENT ON VIEW vista_ponentes_congreso_publica IS 'Vista pública de los ponentes invitados al congreso';