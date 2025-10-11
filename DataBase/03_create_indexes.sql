-- =====================================================
-- Script de creación de índices
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Índices para la tabla usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_tipo_usuario ON usuarios(tipo_usuario_id);
CREATE INDEX idx_usuarios_codigo_qr ON usuarios(codigo_qr);
CREATE INDEX idx_usuarios_fecha_inscripcion ON usuarios(fecha_inscripcion);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

-- Índices para la tabla actividades
CREATE INDEX idx_actividades_categoria ON actividades(categoria_id);
CREATE INDEX idx_actividades_tipo ON actividades(tipo_actividad);
CREATE INDEX idx_actividades_fecha_inicio ON actividades(fecha_inicio);
CREATE INDEX idx_actividades_activo ON actividades(activo);

-- Índices para la tabla inscripciones_actividad
CREATE INDEX idx_inscripciones_usuario ON inscripciones_actividad(usuario_id);
CREATE INDEX idx_inscripciones_actividad ON inscripciones_actividad(actividad_id);
CREATE INDEX idx_inscripciones_estado ON inscripciones_actividad(estado);
CREATE INDEX idx_inscripciones_fecha ON inscripciones_actividad(fecha_inscripcion);

-- Índices para la tabla asistencia
CREATE INDEX idx_asistencia_usuario ON asistencia(usuario_id);
CREATE INDEX idx_asistencia_actividad ON asistencia(actividad_id);
CREATE INDEX idx_asistencia_fecha ON asistencia(fecha_asistencia);
CREATE INDEX idx_asistencia_tipo ON asistencia(tipo_asistencia);

-- Índices para la tabla diplomas
CREATE INDEX idx_diplomas_usuario ON diplomas(usuario_id);
CREATE INDEX idx_diplomas_actividad ON diplomas(actividad_id);
CREATE INDEX idx_diplomas_fecha_generacion ON diplomas(fecha_generacion);

-- Índices para la tabla resultados_competencia
CREATE INDEX idx_resultados_actividad ON resultados_competencia(actividad_id);
CREATE INDEX idx_resultados_usuario ON resultados_competencia(usuario_id);
CREATE INDEX idx_resultados_posicion ON resultados_competencia(posicion);

-- Índices para la tabla faq
CREATE INDEX idx_faq_categoria ON faq(categoria);
CREATE INDEX idx_faq_activo ON faq(activo);
CREATE INDEX idx_faq_orden ON faq(orden);

-- Índices para la tabla logs_sistema
CREATE INDEX idx_logs_usuario ON logs_sistema(usuario_id);
CREATE INDEX idx_logs_administrador ON logs_sistema(administrador_id);
CREATE INDEX idx_logs_fecha ON logs_sistema(fecha_log);
CREATE INDEX idx_logs_accion ON logs_sistema(accion);

-- Índices compuestos para consultas frecuentes
CREATE INDEX idx_usuarios_tipo_activo ON usuarios(tipo_usuario_id, activo);
CREATE INDEX idx_actividades_tipo_activo ON actividades(tipo_actividad, activo);
CREATE INDEX idx_inscripciones_usuario_estado ON inscripciones_actividad(usuario_id, estado);
CREATE INDEX idx_asistencia_usuario_fecha ON asistencia(usuario_id, fecha_asistencia);
CREATE INDEX idx_diplomas_usuario_actividad ON diplomas(usuario_id, actividad_id);
