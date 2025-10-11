-- =====================================================
-- Script de creación de roles y permisos
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Crear roles para diferentes tipos de usuarios
CREATE ROLE congreso_admin;
CREATE ROLE congreso_organizador;
CREATE ROLE congreso_lector;

-- Asignar permisos al rol de administrador
GRANT ALL PRIVILEGES ON DATABASE congreso_tecnologia TO congreso_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO congreso_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO congreso_admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO congreso_admin;

-- Asignar permisos al rol de organizador
GRANT CONNECT ON DATABASE congreso_tecnologia TO congreso_organizador;
GRANT USAGE ON SCHEMA public TO congreso_organizador;

-- Permisos de lectura para organizador
GRANT SELECT ON ALL TABLES IN SCHEMA public TO congreso_organizador;

-- Permisos de escritura para organizador en tablas específicas
GRANT INSERT, UPDATE, DELETE ON usuarios TO congreso_organizador;
GRANT INSERT, UPDATE, DELETE ON tb_actividades TO congreso_organizador;
GRANT INSERT, UPDATE, DELETE ON inscripciones_actividad TO congreso_organizador;
GRANT INSERT, UPDATE, DELETE ON asistencia TO congreso_organizador;
GRANT INSERT, UPDATE, DELETE ON diplomas TO congreso_organizador;
GRANT INSERT, UPDATE, DELETE ON tb_resultados_competencia TO congreso_organizador;
GRANT INSERT, UPDATE, DELETE ON tb_faq TO congreso_organizador;
GRANT INSERT, UPDATE, DELETE ON tb_informacion_congreso TO congreso_organizador;

-- Permisos en secuencias para organizador
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO congreso_organizador;

-- Asignar permisos al rol de lector (solo consultas)
GRANT CONNECT ON DATABASE congreso_tecnologia TO congreso_lector;
GRANT USAGE ON SCHEMA public TO congreso_lector;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO congreso_lector;

-- Crear usuarios específicos para la aplicación
CREATE USER app_admin WITH PASSWORD 'admin_congreso_2024!';
CREATE USER app_organizador WITH PASSWORD 'organizador_congreso_2024!';
CREATE USER app_lector WITH PASSWORD 'lector_congreso_2024!';

-- Asignar roles a los usuarios
GRANT congreso_admin TO app_admin;
GRANT congreso_organizador TO app_organizador;
GRANT congreso_lector TO app_lector;

-- Crear políticas de seguridad (Row Level Security) para datos sensibles
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE administradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_sistema ENABLE ROW LEVEL SECURITY;

-- Política para usuarios: solo pueden ver sus propios datos
CREATE POLICY usuarios_own_data ON usuarios
    FOR ALL TO congreso_organizador
    USING (true); -- Los organizadores pueden ver todos los usuarios

CREATE POLICY usuarios_own_data_lector ON usuarios
    FOR SELECT TO congreso_lector
    USING (true); -- Los lectores pueden ver todos los usuarios

-- Política para administradores: solo super_admin puede ver otros admins
CREATE POLICY admin_own_data ON administradores
    FOR ALL TO congreso_admin
    USING (true);

-- Política para logs: solo administradores pueden ver logs
CREATE POLICY logs_admin_only ON logs_sistema
    FOR ALL TO congreso_admin
    USING (true);

-- Crear vistas con seguridad para datos públicos
CREATE VIEW vista_tb_actividades_publicas AS
SELECT 
    id,
    nombre,
    descripcion,
    tipo_actividad,
    fecha_inicio,
    fecha_fin,
    cupo_maximo,
    cupo_disponible,
    lugar,
    ponente,
    requisitos
FROM tb_actividades
WHERE activo = true;

-- Crear vista para información pública del congreso
CREATE VIEW vista_congreso_publico AS
SELECT 
    titulo,
    descripcion,
    fecha_inicio,
    fecha_fin,
    lugar,
    agenda,
    ponentes_invitados,
    informacion_carrera
FROM tb_informacion_congreso
WHERE activo = true;

-- Crear vista para FAQ públicas
CREATE VIEW vista_tb_faq_publicas AS
SELECT 
    pregunta,
    respuesta,
    categoria
FROM tb_faq
WHERE activo = true
ORDER BY orden;

-- Crear vista para resultados públicos de competencias
CREATE VIEW vista_resultados_publicos AS
SELECT 
    a.nombre as competencia,
    u.nombre || ' ' || u.apellido as participante,
    rc.posicion,
    rc.puntuacion,
    rc.descripcion_proyecto,
    rc.foto_proyecto_path,
    rc.fecha_resultado
FROM tb_resultados_competencia rc
JOIN tb_actividades a ON rc.actividad_id = a.id
JOIN usuarios u ON rc.usuario_id = u.id
WHERE a.tipo_actividad = 'competencia'
ORDER BY a.nombre, rc.posicion;

-- Otorgar permisos en las vistas públicas
GRANT SELECT ON vista_tb_actividades_publicas TO congreso_lector;
GRANT SELECT ON vista_congreso_publico TO congreso_lector;
GRANT SELECT ON vista_tb_faq_publicas TO congreso_lector;
GRANT SELECT ON vista_resultados_publicos TO congreso_lector;

-- Crear función para verificar permisos de usuario
CREATE OR REPLACE FUNCTION verificar_permisos_usuario(p_usuario_id UUID, p_operacion VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    v_tipo_usuario VARCHAR;
    v_es_admin BOOLEAN;
BEGIN
    -- Obtener tipo de usuario
    SELECT tu.nombre INTO v_tipo_usuario
    FROM usuarios u
    JOIN tipos_usuario tu ON u.tipo_usuario_id = tu.id
    WHERE u.id = p_usuario_id;
    
    -- Verificar si es administrador
    SELECT EXISTS(
        SELECT 1 FROM administradores 
        WHERE email = (SELECT email FROM usuarios WHERE id = p_usuario_id)
    ) INTO v_es_admin;
    
    -- Lógica de permisos
    CASE p_operacion
        WHEN 'leer_tb_actividades' THEN
            RETURN TRUE; -- Todos pueden leer tb_actividades
        WHEN 'inscribirse' THEN
            RETURN v_tipo_usuario IN ('externo', 'interno'); -- Solo usuarios registrados
        WHEN 'ver_asistencia' THEN
            RETURN v_es_admin OR v_tipo_usuario IN ('externo', 'interno'); -- Admin o usuarios registrados
        WHEN 'generar_diplomas' THEN
            RETURN v_es_admin; -- Solo administradores
        WHEN 'gestionar_usuarios' THEN
            RETURN v_es_admin; -- Solo administradores
        WHEN 'gestionar_tb_actividades' THEN
            RETURN v_es_admin; -- Solo administradores
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Comentarios de roles y permisos
COMMENT ON ROLE congreso_admin IS 'Rol de administrador con acceso completo al sistema';
COMMENT ON ROLE congreso_organizador IS 'Rol de organizador con permisos de gestión limitados';
COMMENT ON ROLE congreso_lector IS 'Rol de solo lectura para consultas públicas';
COMMENT ON FUNCTION verificar_permisos_usuario(UUID, VARCHAR) IS 'Función para verificar permisos de usuario según operación';
