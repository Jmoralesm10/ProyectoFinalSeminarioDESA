-- =====================================================
-- Script de creación de índices
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Índices para la tabla usuarios
CREATE INDEX idx_usuarios_email ON tb_usuarios(email_usuario);
CREATE INDEX idx_usuarios_tipo_usuario ON tb_usuarios(id_tipo_usuario);
CREATE INDEX idx_usuarios_codigo_qr ON tb_usuarios(codigo_qr_usuario);
CREATE INDEX idx_usuarios_fecha_inscripcion ON tb_usuarios(fecha_inscripcion_usuario);
CREATE INDEX idx_usuarios_activo ON tb_usuarios(estado_usuario);

-- Índices para la tabla actividades
CREATE INDEX idx_actividades_categoria ON tb_actividades(id_categoria);
CREATE INDEX idx_actividades_tipo ON tb_actividades(tipo_actividad);
CREATE INDEX idx_actividades_fecha_inicio ON tb_actividades(fecha_inicio_actividad);
CREATE INDEX idx_actividades_fecha_limite ON tb_actividades(fecha_limite_inscripcion);
CREATE INDEX idx_actividades_estado ON tb_actividades(estado_actividad);
CREATE INDEX idx_actividades_permite_inscripciones ON tb_actividades(permite_inscripciones);
CREATE INDEX idx_actividades_nivel ON tb_actividades(nivel_requerido);
CREATE INDEX idx_actividades_costo ON tb_actividades(costo_actividad);

-- Índices para la tabla inscripciones_actividad
-- Nota: No necesitamos índice en id_usuario ni id_actividad ya que son parte de la PK compuesta
CREATE INDEX idx_inscripciones_estado ON tb_inscripciones_actividad(estado_inscripcion);
CREATE INDEX idx_inscripciones_fecha ON tb_inscripciones_actividad(fecha_inscripcion);
CREATE INDEX idx_inscripciones_actividad_estado ON tb_inscripciones_actividad(id_actividad, estado_inscripcion);

-- Índices para la tabla asistencia general
CREATE INDEX idx_asistencia_general_fecha ON tb_asistencia_general(fecha_asistencia);
CREATE INDEX idx_asistencia_general_hora ON tb_asistencia_general(hora_ingreso);

-- Índices para la tabla asistencia por actividad
CREATE INDEX idx_asistencia_actividad_fecha ON tb_asistencia_actividad(fecha_asistencia);

-- Índices para la tabla diplomas
CREATE INDEX idx_diplomas_usuario ON tb_diplomas(id_usuario);
CREATE INDEX idx_diplomas_actividad ON tb_diplomas(id_actividad);
CREATE INDEX idx_diplomas_fecha_generacion ON tb_diplomas(fecha_generacion_diploma);

-- Índices para la tabla resultados_competencia
CREATE INDEX idx_resultados_actividad ON tb_resultados_competencia(id_actividad);
CREATE INDEX idx_resultados_usuario ON tb_resultados_competencia(id_usuario);
CREATE INDEX idx_resultados_posicion ON tb_resultados_competencia(posicion_resultado);

-- Índices para la tabla faq
CREATE INDEX idx_faq_categoria ON tb_faq(categoria_faq);
CREATE INDEX idx_faq_activo ON tb_faq(estado_faq);
CREATE INDEX idx_faq_orden ON tb_faq(orden_faq);

-- Índices para la tabla logs_sistema
CREATE INDEX idx_logs_usuario ON tb_logs_sistema(id_usuario);
CREATE INDEX idx_logs_administrador ON tb_logs_sistema(id_administrador);
CREATE INDEX idx_logs_fecha ON tb_logs_sistema(fecha_log);
CREATE INDEX idx_logs_accion ON tb_logs_sistema(accion_log);

-- Índices compuestos para consultas frecuentes
CREATE INDEX idx_usuarios_tipo_activo ON tb_usuarios(id_tipo_usuario, estado_usuario);
CREATE INDEX idx_actividades_tipo_activo ON tb_actividades(tipo_actividad, estado_actividad);
CREATE INDEX idx_actividades_disponibles ON tb_actividades(estado_actividad, permite_inscripciones, fecha_limite_inscripcion);
CREATE INDEX idx_inscripciones_usuario_estado ON tb_inscripciones_actividad(id_usuario, estado_inscripcion);
CREATE INDEX idx_asistencia_general_usuario_fecha ON tb_asistencia_general(id_usuario, fecha_asistencia);
CREATE INDEX idx_asistencia_actividad_usuario_fecha ON tb_asistencia_actividad(id_usuario, fecha_asistencia);
CREATE INDEX idx_diplomas_usuario_actividad ON tb_diplomas(id_usuario, id_actividad);
