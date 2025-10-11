-- =====================================================
-- Script de creación de triggers y funciones
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Función para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar el campo de fecha de actualización según la tabla
    IF TG_TABLE_NAME = 'tb_usuarios' THEN
        NEW.fecha_actualizacion_usuario = CURRENT_TIMESTAMP;
    ELSIF TG_TABLE_NAME = 'tb_actividades' THEN
        NEW.fecha_actualizacion_actividad = CURRENT_TIMESTAMP;
    ELSIF TG_TABLE_NAME = 'tb_faq' THEN
        NEW.fecha_actualizacion_faq = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para generar código QR único
CREATE OR REPLACE FUNCTION generar_codigo_qr_usuario()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo_qr_usuario IS NULL THEN
        NEW.codigo_qr_usuario = 'CONGRESO_2024_' || NEW.id_usuario::text || '_' || extract(epoch from now())::text;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar cupo disponible
CREATE OR REPLACE FUNCTION actualizar_cupo_disponible()
RETURNS TRIGGER AS $$
DECLARE
    actividad_cupo_max INTEGER;
    inscripciones_count INTEGER;
BEGIN
    -- Obtener el cupo máximo de la actividad
    SELECT cupo_maximo_actividad INTO actividad_cupo_max
    FROM tb_actividades 
    WHERE id_actividad = COALESCE(NEW.id_actividad, OLD.id_actividad);
    
    -- Contar inscripciones confirmadas
    SELECT COUNT(*) INTO inscripciones_count
    FROM tb_inscripciones_actividad 
    WHERE id_actividad = COALESCE(NEW.id_actividad, OLD.id_actividad)
    AND estado_inscripcion = 'confirmada';
    
    -- Actualizar cupo disponible
    UPDATE tb_actividades 
    SET cupo_disponible_actividad = actividad_cupo_max - inscripciones_count,
        fecha_actualizacion_actividad = CURRENT_TIMESTAMP
    WHERE id_actividad = COALESCE(NEW.id_actividad, OLD.id_actividad);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Función para validar inscripción
CREATE OR REPLACE FUNCTION validar_inscripcion()
RETURNS TRIGGER AS $$
DECLARE
    cupo_disponible INTEGER;
    actividad_activa BOOLEAN;
BEGIN
    -- Verificar si la actividad está activa
    SELECT activo INTO actividad_activa
    FROM actividades 
    WHERE id = NEW.actividad_id;
    
    IF NOT actividad_activa THEN
        RAISE EXCEPTION 'La actividad no está disponible para inscripción';
    END IF;
    
    -- Verificar cupo disponible
    SELECT cupo_disponible INTO cupo_disponible
    FROM actividades 
    WHERE id = NEW.actividad_id;
    
    IF cupo_disponible <= 0 THEN
        RAISE EXCEPTION 'No hay cupo disponible para esta actividad';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para log de actividades
CREATE OR REPLACE FUNCTION log_actividad()
RETURNS TRIGGER AS $$
DECLARE
    registro_id TEXT;
BEGIN
    -- Determinar el ID del registro según la tabla
    CASE TG_TABLE_NAME
        WHEN 'tb_usuarios' THEN
            registro_id := COALESCE(NEW.id_usuario::text, OLD.id_usuario::text);
        WHEN 'tb_inscripciones_actividad' THEN
            registro_id := COALESCE(NEW.id_inscripcion::text, OLD.id_inscripcion::text);
        WHEN 'asistencia' THEN
            registro_id := COALESCE(NEW.id_asistencia::text, OLD.id_asistencia::text);
        WHEN 'resultados_competencia' THEN
            registro_id := COALESCE(NEW.id_resultado::text, OLD.id_resultado::text);
        ELSE
            registro_id := COALESCE(NEW.id::text, OLD.id::text);
    END CASE;
    
    INSERT INTO tb_logs_sistema (
        accion_log,
        tabla_afectada_log,
        registro_id_log,
        detalles_log,
        fecha_log
    ) VALUES (
        TG_OP,
        TG_TABLE_NAME,
        registro_id,
        CASE 
            WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
            ELSE to_jsonb(NEW)
        END,
        CURRENT_TIMESTAMP
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar fecha_actualizacion
CREATE TRIGGER trigger_usuarios_actualizar_fecha
    BEFORE UPDATE ON tb_usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_actividades_actualizar_fecha
    BEFORE UPDATE ON tb_actividades
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_faq_actualizar_fecha
    BEFORE UPDATE ON tb_faq
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_informacion_congreso_actualizar_fecha
    BEFORE UPDATE ON tb_informacion_congreso
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

-- Trigger para generar código QR
CREATE TRIGGER trigger_usuarios_generar_qr
    BEFORE INSERT ON tb_usuarios
    FOR EACH ROW
    EXECUTE FUNCTION generar_codigo_qr_usuario();

-- Triggers para actualizar cupo disponible
CREATE TRIGGER trigger_inscripciones_actualizar_cupo
    AFTER INSERT OR UPDATE OR DELETE ON tb_inscripciones_actividad
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_cupo_disponible();

-- Trigger para validar inscripción
CREATE TRIGGER trigger_inscripciones_validar
    BEFORE INSERT ON tb_inscripciones_actividad
    FOR EACH ROW
    EXECUTE FUNCTION validar_inscripcion();

-- Triggers para logging (solo en tablas críticas)
CREATE TRIGGER trigger_log_usuarios
    AFTER INSERT OR UPDATE OR DELETE ON tb_usuarios
    FOR EACH ROW
    EXECUTE FUNCTION log_actividad();

CREATE TRIGGER trigger_log_inscripciones
    AFTER INSERT OR UPDATE OR DELETE ON tb_inscripciones_actividad
    FOR EACH ROW
    EXECUTE FUNCTION log_actividad();

CREATE TRIGGER trigger_log_asistencia
    AFTER INSERT OR UPDATE OR DELETE ON tb_asistencia
    FOR EACH ROW
    EXECUTE FUNCTION log_actividad();

CREATE TRIGGER trigger_log_resultados
    AFTER INSERT OR UPDATE OR DELETE ON tb_resultados_competencia
    FOR EACH ROW
    EXECUTE FUNCTION log_actividad();
