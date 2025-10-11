-- =====================================================
-- Script de creación de vistas
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Vista de usuarios con información completa
CREATE VIEW vista_usuarios_completa AS
SELECT 
    u.id,
    u.nombre,
    u.apellido,
    u.email,
    u.telefono,
    u.colegio,
    u.email_universitario,
    u.codigo_qr,
    tu.nombre as tipo_usuario,
    u.activo,
    u.fecha_inscripcion,
    u.fecha_actualizacion
FROM usuarios u
JOIN tipos_usuario tu ON u.tipo_usuario_id = tu.id;

-- Vista de actividades con información completa
CREATE VIEW vista_actividades_completa AS
SELECT 
    a.id,
    a.nombre,
    a.descripcion,
    a.tipo_actividad,
    a.fecha_inicio,
    a.fecha_fin,
    a.cupo_maximo,
    a.cupo_disponible,
    a.lugar,
    a.ponente,
    a.requisitos,
    ca.nombre as categoria,
    a.activo,
    a.fecha_creacion,
    a.fecha_actualizacion
FROM actividades a
JOIN categorias_actividad ca ON a.categoria_id = ca.id;

-- Vista de inscripciones con información de usuario y actividad
CREATE VIEW vista_inscripciones_completa AS
SELECT 
    ia.id,
    u.nombre || ' ' || u.apellido as nombre_completo,
    u.email,
    u.codigo_qr,
    a.nombre as actividad,
    a.tipo_actividad,
    a.fecha_inicio,
    a.lugar,
    ia.fecha_inscripcion,
    ia.estado,
    ia.observaciones
FROM inscripciones_actividad ia
JOIN usuarios u ON ia.usuario_id = u.id
JOIN actividades a ON ia.actividad_id = a.id;

-- Vista de asistencia con información completa
CREATE VIEW vista_asistencia_completa AS
SELECT 
    ast.id,
    u.nombre || ' ' || u.apellido as nombre_completo,
    u.email,
    u.codigo_qr,
    a.nombre as actividad,
    ast.tipo_asistencia,
    ast.fecha_asistencia,
    ast.metodo_registro,
    ast.observaciones
FROM asistencia ast
JOIN usuarios u ON ast.usuario_id = u.id
LEFT JOIN actividades a ON ast.actividad_id = a.id;

-- Vista de diplomas con información completa
CREATE VIEW vista_diplomas_completa AS
SELECT 
    d.id,
    u.nombre || ' ' || u.apellido as nombre_completo,
    u.email,
    a.nombre as actividad,
    d.nombre_diploma,
    d.fecha_generacion,
    d.fecha_descarga,
    d.enviado_email,
    d.fecha_envio_email
FROM diplomas d
JOIN usuarios u ON d.usuario_id = u.id
LEFT JOIN actividades a ON d.actividad_id = a.id;

-- Vista de resultados de competencias
CREATE VIEW vista_resultados_competencia AS
SELECT 
    rc.id,
    a.nombre as competencia,
    u.nombre || ' ' || u.apellido as participante,
    u.email,
    rc.posicion,
    rc.puntuacion,
    rc.descripcion_proyecto,
    rc.foto_proyecto_path,
    rc.fecha_resultado,
    rc.observaciones
FROM resultados_competencia rc
JOIN actividades a ON rc.actividad_id = a.id
JOIN usuarios u ON rc.usuario_id = u.id
WHERE a.tipo_actividad = 'competencia';

-- Vista de estadísticas generales
CREATE VIEW vista_estadisticas_generales AS
SELECT 
    (SELECT COUNT(*) FROM usuarios WHERE activo = true) as total_usuarios,
    (SELECT COUNT(*) FROM usuarios WHERE tipo_usuario_id = 1 AND activo = true) as usuarios_externos,
    (SELECT COUNT(*) FROM usuarios WHERE tipo_usuario_id = 2 AND activo = true) as usuarios_internos,
    (SELECT COUNT(*) FROM actividades WHERE activo = true) as total_actividades,
    (SELECT COUNT(*) FROM actividades WHERE tipo_actividad = 'taller' AND activo = true) as total_talleres,
    (SELECT COUNT(*) FROM actividades WHERE tipo_actividad = 'competencia' AND activo = true) as total_competencias,
    (SELECT COUNT(*) FROM inscripciones_actividad WHERE estado = 'confirmada') as total_inscripciones,
    (SELECT COUNT(*) FROM asistencia WHERE tipo_asistencia = 'general') as total_asistencia_general,
    (SELECT COUNT(*) FROM diplomas) as total_diplomas_generados;

-- Vista de reporte de asistencia por actividad
CREATE VIEW vista_reporte_asistencia_actividad AS
SELECT 
    a.id as actividad_id,
    a.nombre as actividad,
    a.tipo_actividad,
    a.fecha_inicio,
    COUNT(ia.id) as total_inscritos,
    COUNT(ast.id) as total_asistentes,
    ROUND(
        CASE 
            WHEN COUNT(ia.id) > 0 THEN (COUNT(ast.id)::decimal / COUNT(ia.id)::decimal) * 100 
            ELSE 0 
        END, 2
    ) as porcentaje_asistencia
FROM actividades a
LEFT JOIN inscripciones_actividad ia ON a.id = ia.actividad_id AND ia.estado = 'confirmada'
LEFT JOIN asistencia ast ON a.id = ast.actividad_id AND ast.tipo_asistencia = 'actividad'
WHERE a.activo = true
GROUP BY a.id, a.nombre, a.tipo_actividad, a.fecha_inicio;

-- Vista de usuarios con más actividades inscritas
CREATE VIEW vista_usuarios_mas_activos AS
SELECT 
    u.id,
    u.nombre || ' ' || u.apellido as nombre_completo,
    u.email,
    tu.nombre as tipo_usuario,
    COUNT(ia.id) as total_inscripciones,
    COUNT(ast.id) as total_asistencias
FROM usuarios u
JOIN tipos_usuario tu ON u.tipo_usuario_id = tu.id
LEFT JOIN inscripciones_actividad ia ON u.id = ia.usuario_id AND ia.estado = 'confirmada'
LEFT JOIN asistencia ast ON u.id = ast.usuario_id
WHERE u.activo = true
GROUP BY u.id, u.nombre, u.apellido, u.email, tu.nombre
ORDER BY total_inscripciones DESC, total_asistencias DESC;

-- Comentarios de las vistas
COMMENT ON VIEW vista_usuarios_completa IS 'Vista completa de usuarios con información de tipo';
COMMENT ON VIEW vista_actividades_completa IS 'Vista completa de actividades con información de categoría';
COMMENT ON VIEW vista_inscripciones_completa IS 'Vista de inscripciones con datos de usuario y actividad';
COMMENT ON VIEW vista_asistencia_completa IS 'Vista de asistencia con información completa';
COMMENT ON VIEW vista_diplomas_completa IS 'Vista de diplomas con información de usuario y actividad';
COMMENT ON VIEW vista_resultados_competencia IS 'Vista de resultados de competencias';
COMMENT ON VIEW vista_estadisticas_generales IS 'Estadísticas generales del sistema';
COMMENT ON VIEW vista_reporte_asistencia_actividad IS 'Reporte de asistencia por actividad';
COMMENT ON VIEW vista_usuarios_mas_activos IS 'Usuarios con mayor participación en actividades';
