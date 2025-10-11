-- =====================================================
-- Script de creación de triggers y funciones
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Función para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para generar código QR único
CREATE OR REPLACE FUNCTION generar_codigo_qr()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo_qr IS NULL THEN
        NEW.codigo_qr = 'QR_' || NEW.id::text || '_' || extract(epoch from now())::text;
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
    SELECT cupo_maximo INTO actividad_cupo_max
    FROM actividades 
    WHERE id = COALESCE(NEW.actividad_id, OLD.actividad_id);
    
    -- Contar inscripciones confirmadas
    SELECT COUNT(*) INTO inscripciones_count
    FROM inscripciones_actividad 
    WHERE actividad_id = COALESCE(NEW.actividad_id, OLD.actividad_id)
    AND estado = 'confirmada';
    
    -- Actualizar cupo disponible
    UPDATE actividades 
    SET cupo_disponible = actividad_cupo_max - inscripciones_count,
        fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.actividad_id, OLD.actividad_id);
    
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
BEGIN
    INSERT INTO logs_sistema (
        usuario_id,
        accion,
        tabla_afectada,
        registro_id,
        detalles,
        fecha_log
    ) VALUES (
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id::text, OLD.id::text),
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
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_actividades_actualizar_fecha
    BEFORE UPDATE ON actividades
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_faq_actualizar_fecha
    BEFORE UPDATE ON faq
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_informacion_congreso_actualizar_fecha
    BEFORE UPDATE ON informacion_congreso
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

-- Trigger para generar código QR
CREATE TRIGGER trigger_usuarios_generar_qr
    BEFORE INSERT ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION generar_codigo_qr();

-- Triggers para actualizar cupo disponible
CREATE TRIGGER trigger_inscripciones_actualizar_cupo
    AFTER INSERT OR UPDATE OR DELETE ON inscripciones_actividad
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_cupo_disponible();

-- Trigger para validar inscripción
CREATE TRIGGER trigger_inscripciones_validar
    BEFORE INSERT ON inscripciones_actividad
    FOR EACH ROW
    EXECUTE FUNCTION validar_inscripcion();

-- Triggers para logging (solo en tablas críticas)
CREATE TRIGGER trigger_log_usuarios
    AFTER INSERT OR UPDATE OR DELETE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION log_actividad();

CREATE TRIGGER trigger_log_inscripciones
    AFTER INSERT OR UPDATE OR DELETE ON inscripciones_actividad
    FOR EACH ROW
    EXECUTE FUNCTION log_actividad();

CREATE TRIGGER trigger_log_asistencia
    AFTER INSERT OR UPDATE OR DELETE ON asistencia
    FOR EACH ROW
    EXECUTE FUNCTION log_actividad();

CREATE TRIGGER trigger_log_resultados
    AFTER INSERT OR UPDATE OR DELETE ON resultados_competencia
    FOR EACH ROW
    EXECUTE FUNCTION log_actividad();
