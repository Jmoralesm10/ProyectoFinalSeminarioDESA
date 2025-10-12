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

-- Función para validar cupo disponible (ya no actualizamos cupo_disponible)
CREATE OR REPLACE FUNCTION validar_cupo_disponible()
RETURNS TRIGGER AS $$
DECLARE
    actividad_cupo_max INTEGER;
    inscripciones_count INTEGER;
BEGIN
    -- Obtener el cupo máximo de la actividad
    SELECT cupo_maximo_actividad INTO actividad_cupo_max
    FROM tb_actividades 
    WHERE id_actividad = NEW.id_actividad;
    
    -- Contar inscripciones confirmadas
    SELECT COUNT(*) INTO inscripciones_count
    FROM tb_inscripciones_actividad 
    WHERE id_actividad = NEW.id_actividad
    AND estado_inscripcion = 'confirmada';
    
    -- Validar que hay cupo disponible
    IF inscripciones_count >= actividad_cupo_max THEN
        RAISE EXCEPTION 'No hay cupo disponible para esta actividad';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para validar inscripción
CREATE OR REPLACE FUNCTION validar_inscripcion()
RETURNS TRIGGER AS $$
DECLARE
    actividad_activa BOOLEAN;
    actividad_permite_inscripciones BOOLEAN;
    cupo_maximo INTEGER;
    inscripciones_confirmadas INTEGER;
BEGIN
    -- Verificar si la actividad está activa y permite inscripciones
    SELECT 
        estado_actividad,
        permite_inscripciones,
        cupo_maximo_actividad
    INTO 
        actividad_activa,
        actividad_permite_inscripciones,
        cupo_maximo
    FROM tb_actividades 
    WHERE id_actividad = NEW.id_actividad;
    
    IF NOT actividad_activa THEN
        RAISE EXCEPTION 'La actividad no está disponible para inscripción';
    END IF;
    
    IF NOT actividad_permite_inscripciones THEN
        RAISE EXCEPTION 'Las inscripciones para esta actividad no están permitidas';
    END IF;
    
    -- Contar inscripciones confirmadas
    SELECT COUNT(*) INTO inscripciones_confirmadas
    FROM tb_inscripciones_actividad 
    WHERE id_actividad = NEW.id_actividad
    AND estado_inscripcion = 'confirmada';
    
    -- Verificar cupo disponible
    IF inscripciones_confirmadas >= cupo_maximo THEN
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
            registro_id := COALESCE(
                NEW.id_usuario::text || '_' || NEW.id_actividad::text, 
                OLD.id_usuario::text || '_' || OLD.id_actividad::text
            );
        WHEN 'tb_asistencia' THEN
            registro_id := COALESCE(NEW.id_asistencia::text, OLD.id_asistencia::text);
        WHEN 'tb_resultados_competencia' THEN
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

-- Trigger para validar cupo disponible
CREATE TRIGGER trigger_inscripciones_validar_cupo
    BEFORE INSERT ON tb_inscripciones_actividad
    FOR EACH ROW
    EXECUTE FUNCTION validar_cupo_disponible();

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
