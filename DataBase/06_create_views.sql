-- =====================================================
-- Script de creación de vistas
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Vista de tb_usuarios con información completa
CREATE VIEW vista_tb_usuarios_completa AS
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
    u.fecha_actualizacion_usuario
FROM tb_tb_usuarios u
JOIN tb_tb_tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario;

-- Vista de actividades con información completa
CREATE VIEW vista_actividades_completa AS
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
    ca.nombre_categoria as categoria,
    a.estado_actividad,
    a.fecha_creacion_actividad,
    a.fecha_actualizacion_actividad
FROM tb_actividades a
JOIN tb_categorias_actividad ca ON a.id_categoria = ca.id_categoria
LEFT JOIN tb_inscripciones_actividad ia ON a.id_actividad = ia.id_actividad 
    AND ia.estado_inscripcion = 'confirmada'
GROUP BY a.id_actividad, ca.nombre_categoria;

-- Vista de inscripciones con información de usuario y actividad
CREATE VIEW vista_inscripciones_completa AS
SELECT 
    ia.id_usuario,
    ia.id_actividad,
    u.nombre_usuario || ' ' || u.apellido_usuario as nombre_completo,
    u.email_usuario,
    u.codigo_qr_usuario,
    a.nombre_actividad as actividad,
    a.tipo_actividad,
    a.fecha_inicio_actividad,
    a.lugar_actividad,
    ia.fecha_inscripcion,
    ia.estado_inscripcion,
    ia.observaciones_inscripcion
FROM tb_inscripciones_actividad ia
JOIN tb_usuarios u ON ia.id_usuario = u.id_usuario
JOIN tb_actividades a ON ia.id_actividad = a.id_actividad;

-- Vista de tb_asistencia con información completa
CREATE VIEW vista_tb_asistencia_completa AS
SELECT 
    ast.id,
    u.nombre || ' ' || u.apellido as nombre_completo,
    u.email,
    u.codigo_qr,
    a.nombre as actividad,
    ast.tipo_tb_asistencia,
    ast.fecha_tb_asistencia,
    ast.metodo_registro,
    ast.observaciones
FROM tb_asistencia ast
JOIN tb_usuarios u ON ast.usuario_id = u.id
LEFT JOIN tb_actividades a ON ast.actividad_id = a.id;

-- Vista de tb_diplomas con información completa
CREATE VIEW vista_tb_diplomas_completa AS
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
FROM tb_diplomas d
JOIN tb_usuarios u ON d.usuario_id = u.id
LEFT JOIN tb_actividades a ON d.actividad_id = a.id;

-- Vista de resultados de competencias
CREATE VIEW vista_tb_resultados_competencia AS
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
FROM tb_resultados_competencia rc
JOIN tb_actividades a ON rc.actividad_id = a.id
JOIN tb_usuarios u ON rc.usuario_id = u.id
WHERE a.tipo_actividad = 'competencia';

-- Vista de estadísticas generales
CREATE VIEW vista_estadisticas_generales AS
SELECT 
    (SELECT COUNT(*) FROM tb_usuarios WHERE activo = true) as total_tb_usuarios,
    (SELECT COUNT(*) FROM tb_usuarios WHERE tipo_usuario_id = 1 AND activo = true) as tb_usuarios_externos,
    (SELECT COUNT(*) FROM tb_usuarios WHERE tipo_usuario_id = 2 AND activo = true) as tb_usuarios_internos,
    (SELECT COUNT(*) FROM tb_actividades WHERE activo = true) as total_tb_actividades,
    (SELECT COUNT(*) FROM tb_actividades WHERE tipo_actividad = 'taller' AND activo = true) as total_talleres,
    (SELECT COUNT(*) FROM tb_actividades WHERE tipo_actividad = 'competencia' AND activo = true) as total_competencias,
    (SELECT COUNT(*) FROM tb_inscripciones_actividad WHERE estado = 'confirmada') as total_inscripciones,
    (SELECT COUNT(*) FROM tb_asistencia WHERE tipo_tb_asistencia = 'general') as total_tb_asistencia_general,
    (SELECT COUNT(*) FROM tb_diplomas) as total_tb_diplomas_generados;

-- Vista de reporte de tb_asistencia por actividad
CREATE VIEW vista_reporte_tb_asistencia_actividad AS
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
    ) as porcentaje_tb_asistencia
FROM tb_actividades a
LEFT JOIN tb_inscripciones_actividad ia ON a.id = ia.actividad_id AND ia.estado = 'confirmada'
LEFT JOIN tb_asistencia ast ON a.id = ast.actividad_id AND ast.tipo_tb_asistencia = 'actividad'
WHERE a.activo = true
GROUP BY a.id, a.nombre, a.tipo_actividad, a.fecha_inicio;

-- Vista de tb_usuarios con más tb_actividades inscritas
CREATE VIEW vista_tb_usuarios_mas_activos AS
SELECT 
    u.id,
    u.nombre || ' ' || u.apellido as nombre_completo,
    u.email,
    tu.nombre as tipo_usuario,
    COUNT(ia.id) as total_inscripciones,
    COUNT(ast.id) as total_tb_asistencias
FROM tb_usuarios u
JOIN tb_tipos_usuario tu ON u.tipo_usuario_id = tu.id
LEFT JOIN tb_inscripciones_actividad ia ON u.id = ia.usuario_id AND ia.estado = 'confirmada'
LEFT JOIN tb_asistencia ast ON u.id = ast.usuario_id
WHERE u.activo = true
GROUP BY u.id, u.nombre, u.apellido, u.email, tu.nombre
ORDER BY total_inscripciones DESC, total_tb_asistencias DESC;

-- Comentarios de las vistas
COMMENT ON VIEW vista_tb_usuarios_completa IS 'Vista completa de tb_usuarios con información de tipo';
COMMENT ON VIEW vista_tb_actividades_completa IS 'Vista completa de tb_actividades con información de categoría';
COMMENT ON VIEW vista_inscripciones_completa IS 'Vista de inscripciones con datos de usuario y actividad';
COMMENT ON VIEW vista_tb_asistencia_completa IS 'Vista de tb_asistencia con información completa';
COMMENT ON VIEW vista_tb_diplomas_completa IS 'Vista de tb_diplomas con información de usuario y actividad';
COMMENT ON VIEW vista_tb_resultados_competencia IS 'Vista de resultados de competencias';
COMMENT ON VIEW vista_estadisticas_generales IS 'Estadísticas generales del sistema';
COMMENT ON VIEW vista_reporte_tb_asistencia_actividad IS 'Reporte de tb_asistencia por actividad';
COMMENT ON VIEW vista_tb_usuarios_mas_activos IS 'Usuarios con mayor participación en tb_actividades';
