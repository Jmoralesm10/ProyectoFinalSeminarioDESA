-- =====================================================
-- Script de creación de tablas
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Tabla de tipos de usuario
CREATE TABLE tipos_usuario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios (estudiantes externos e internos)
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_usuario_id INTEGER NOT NULL REFERENCES tipos_usuario(id),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    colegio VARCHAR(200), -- Solo para estudiantes externos
    email_universitario VARCHAR(255), -- Solo para estudiantes internos
    codigo_qr VARCHAR(500) UNIQUE, -- Código QR generado
    activo BOOLEAN DEFAULT TRUE,
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de categorías de actividades
CREATE TABLE categorias_actividad (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de actividades (talleres y competencias)
CREATE TABLE actividades (
    id SERIAL PRIMARY KEY,
    categoria_id INTEGER NOT NULL REFERENCES categorias_actividad(id),
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo_actividad VARCHAR(50) NOT NULL CHECK (tipo_actividad IN ('taller', 'competencia')),
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    cupo_maximo INTEGER,
    cupo_disponible INTEGER,
    lugar VARCHAR(200),
    ponente VARCHAR(200),
    requisitos TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de inscripciones a actividades
CREATE TABLE inscripciones_actividad (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    actividad_id INTEGER NOT NULL REFERENCES actividades(id),
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'confirmada' CHECK (estado IN ('confirmada', 'cancelada', 'en_espera')),
    observaciones TEXT,
    UNIQUE(usuario_id, actividad_id)
);

-- Tabla de asistencia
CREATE TABLE asistencia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    actividad_id INTEGER REFERENCES actividades(id), -- NULL para asistencia general al congreso
    fecha_asistencia TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_asistencia VARCHAR(50) NOT NULL CHECK (tipo_asistencia IN ('general', 'actividad')),
    metodo_registro VARCHAR(50) DEFAULT 'qr' CHECK (metodo_registro IN ('qr', 'manual', 'lista')),
    observaciones TEXT
);

-- Tabla de diplomas
CREATE TABLE diplomas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    actividad_id INTEGER REFERENCES actividades(id),
    nombre_diploma VARCHAR(200) NOT NULL,
    plantilla_path VARCHAR(500),
    archivo_path VARCHAR(500),
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_descarga TIMESTAMP,
    enviado_email BOOLEAN DEFAULT FALSE,
    fecha_envio_email TIMESTAMP
);

-- Tabla de resultados de competencias
CREATE TABLE resultados_competencia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actividad_id INTEGER NOT NULL REFERENCES actividades(id),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    posicion INTEGER NOT NULL CHECK (posicion > 0),
    puntuacion DECIMAL(10,2),
    descripcion_proyecto TEXT,
    foto_proyecto_path VARCHAR(500),
    fecha_resultado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT
);

-- Tabla de FAQ (Preguntas Frecuentes)
CREATE TABLE faq (
    id SERIAL PRIMARY KEY,
    pregunta TEXT NOT NULL,
    respuesta TEXT NOT NULL,
    categoria VARCHAR(100),
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de información del congreso
CREATE TABLE informacion_congreso (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    lugar VARCHAR(200),
    agenda TEXT,
    ponentes_invitados TEXT,
    informacion_carrera TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de administradores del sistema
CREATE TABLE administradores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'admin' CHECK (rol IN ('admin', 'super_admin')),
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de logs del sistema
CREATE TABLE logs_sistema (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id),
    administrador_id UUID REFERENCES administradores(id),
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(100),
    registro_id VARCHAR(100),
    detalles JSONB,
    ip_address INET,
    user_agent TEXT,
    fecha_log TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comentarios de las tablas
COMMENT ON TABLE tipos_usuario IS 'Tipos de usuario: externo, interno';
COMMENT ON TABLE usuarios IS 'Usuarios del sistema (estudiantes externos e internos)';
COMMENT ON TABLE categorias_actividad IS 'Categorías para clasificar las actividades';
COMMENT ON TABLE actividades IS 'Talleres y competencias del congreso';
COMMENT ON TABLE inscripciones_actividad IS 'Inscripciones de usuarios a actividades';
COMMENT ON TABLE asistencia IS 'Registro de asistencia de usuarios';
COMMENT ON TABLE diplomas IS 'Diplomas generados para los participantes';
COMMENT ON TABLE resultados_competencia IS 'Resultados y ganadores de competencias';
COMMENT ON TABLE faq IS 'Preguntas frecuentes del sistema';
COMMENT ON TABLE informacion_congreso IS 'Información general del congreso';
COMMENT ON TABLE administradores IS 'Administradores del sistema';
COMMENT ON TABLE logs_sistema IS 'Logs de actividades del sistema';
