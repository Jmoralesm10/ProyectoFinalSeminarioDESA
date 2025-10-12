-- =====================================================
-- Script para crear tablas de pagos simulados
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Tabla para registrar transacciones de pago simuladas
CREATE TABLE IF NOT EXISTS tb_pagos_simulados (
    id_pago UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario UUID NOT NULL REFERENCES tb_usuarios(id_usuario),
    id_actividad INTEGER NOT NULL REFERENCES tb_actividades(id_actividad),
    monto_pago DECIMAL(10,2) NOT NULL,
    moneda_pago VARCHAR(3) NOT NULL DEFAULT 'GTQ',
    metodo_pago VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('tarjeta', 'paypal', 'transferencia')),
    estado_pago VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'procesando', 'completado', 'fallido', 'cancelado')),
    referencia_pago VARCHAR(100), -- Referencia del procesador de pagos
    detalles_pago JSONB, -- Detalles adicionales del pago (datos de tarjeta encriptados, etc.)
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_confirmacion TIMESTAMP,
    observaciones_pago TEXT,
    
    -- Auditoría
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_pagos_usuario ON tb_pagos_simulados(id_usuario);
CREATE INDEX IF NOT EXISTS idx_pagos_actividad ON tb_pagos_simulados(id_actividad);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON tb_pagos_simulados(estado_pago);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON tb_pagos_simulados(fecha_pago);

-- Tabla para registrar intentos de pago (para debugging y análisis)
CREATE TABLE IF NOT EXISTS tb_intentos_pago (
    id_intento UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_pago UUID REFERENCES tb_pagos_simulados(id_pago),
    id_usuario UUID NOT NULL REFERENCES tb_usuarios(id_usuario),
    id_actividad INTEGER NOT NULL REFERENCES tb_actividades(id_actividad),
    metodo_pago VARCHAR(20) NOT NULL,
    monto_original DECIMAL(10,2) NOT NULL,
    moneda_original VARCHAR(3) NOT NULL,
    estado_intento VARCHAR(20) NOT NULL CHECK (estado_intento IN ('iniciado', 'procesando', 'exitoso', 'fallido', 'cancelado')),
    codigo_error VARCHAR(50), -- Código de error del procesador
    mensaje_error TEXT, -- Mensaje de error detallado
    datos_entrada JSONB, -- Datos que se enviaron al procesador
    respuesta_procesador JSONB, -- Respuesta del procesador de pagos
    ip_cliente INET,
    user_agent TEXT,
    fecha_intento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para la tabla de intentos
CREATE INDEX IF NOT EXISTS idx_intentos_pago ON tb_intentos_pago(id_pago);
CREATE INDEX IF NOT EXISTS idx_intentos_usuario ON tb_intentos_pago(id_usuario);
CREATE INDEX IF NOT EXISTS idx_intentos_estado ON tb_intentos_pago(estado_intento);
CREATE INDEX IF NOT EXISTS idx_intentos_fecha ON tb_intentos_pago(fecha_intento);

-- Función para actualizar fecha de actualización
CREATE OR REPLACE FUNCTION actualizar_fecha_pago()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar fechas
CREATE TRIGGER trigger_actualizar_fecha_pago
    BEFORE UPDATE ON tb_pagos_simulados
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_pago();

-- Función para registrar intentos de pago automáticamente
CREATE OR REPLACE FUNCTION registrar_intento_pago()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo registrar si es un nuevo pago
    IF TG_OP = 'INSERT' THEN
        INSERT INTO tb_intentos_pago (
            id_pago,
            id_usuario,
            id_actividad,
            metodo_pago,
            monto_original,
            moneda_original,
            estado_intento,
            datos_entrada
        ) VALUES (
            NEW.id_pago,
            NEW.id_usuario,
            NEW.id_actividad,
            NEW.metodo_pago,
            NEW.monto_pago,
            NEW.moneda_pago,
            'iniciado',
            NEW.detalles_pago
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar intentos automáticamente
CREATE TRIGGER trigger_registrar_intento_pago
    AFTER INSERT ON tb_pagos_simulados
    FOR EACH ROW
    EXECUTE FUNCTION registrar_intento_pago();

-- Comentarios de las tablas
COMMENT ON TABLE tb_pagos_simulados IS 'Registro de pagos simulados para actividades del congreso';
COMMENT ON TABLE tb_intentos_pago IS 'Registro de intentos de pago para análisis y debugging';

-- Comentarios de columnas importantes
COMMENT ON COLUMN tb_pagos_simulados.detalles_pago IS 'Detalles del pago en formato JSON (datos de tarjeta encriptados, etc.)';
COMMENT ON COLUMN tb_pagos_simulados.referencia_pago IS 'Referencia única del procesador de pagos';
COMMENT ON COLUMN tb_intentos_pago.datos_entrada IS 'Datos enviados al procesador de pagos';
COMMENT ON COLUMN tb_intentos_pago.respuesta_procesador IS 'Respuesta completa del procesador de pagos';
